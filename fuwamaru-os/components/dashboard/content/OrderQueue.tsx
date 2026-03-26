"use client";

import { useState, useEffect } from "react";
import {
  ClipboardList, CheckCircle2, XCircle, Clock, Banknote,
  CreditCard, TrendingUp, ShoppingBag, Timer, AlertCircle,
} from "lucide-react";
import type { PendingOrder } from "@/lib/types";
import { useStore } from "@/lib/store";

// ── 経過時間フォーマット ──────────────────────────────────
function elapsed(iso: string): { label: string; level: "fresh" | "warn" | "late" } {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const min = Math.floor(sec / 60);
  if (min < 1)  return { label: `${sec}秒`,       level: "fresh" };
  if (min < 3)  return { label: `${min}分`,        level: "fresh" };
  if (min < 7)  return { label: `${min}分`,        level: "warn"  };
  return              { label: `${min}分 ⚠`,       level: "late"  };
}

const LEVEL_COLOR = {
  fresh: { text: "#34d399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.25)" },
  warn:  { text: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)" },
  late:  { text: "#f87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.30)" },
};

// ── サマリー計算 ──────────────────────────────────────────
function todaySummary(orders: PendingOrder[]) {
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(today) && o.status !== "cancelled");
  const revenue = todayOrders.filter((o) => o.status === "served").reduce((s, o) => s + o.total, 0);
  const pending = todayOrders.filter((o) => o.status === "pending").length;
  const served  = todayOrders.filter((o) => o.status === "served").length;
  const avgItems = todayOrders.length
    ? Math.round(todayOrders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0) / todayOrders.length * 10) / 10
    : 0;
  return { revenue, pending, served, total: todayOrders.length, avgItems };
}

// ── オーダーカード ───────────────────────────────────────
function OrderCard({
  order,
  onServe,
  onCancel,
}: {
  order: PendingOrder;
  onServe:  (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (order.status !== "pending") return;
    const t = setInterval(() => tick((n) => n + 1), 10000);
    return () => clearInterval(t);
  }, [order.status]);

  const el    = elapsed(order.createdAt);
  const col   = LEVEL_COLOR[el.level];
  const isPending = order.status === "pending";

  return (
    <div style={{
      background: "var(--c-bg2)",
      border: `1px solid ${isPending ? col.border : "var(--c-border)"}`,
      borderRadius: 14,
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      opacity: isPending ? 1 : 0.6,
      transition: "all 0.2s",
    }}>
      {/* 上段：番号・席・時間 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          fontSize: 18, fontWeight: 900, color: isPending ? col.text : "var(--c-t2)",
          minWidth: 36,
        }}>
          #{order.orderNo}
        </div>
        {order.tableNote && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
            background: "var(--c-bg3)", color: "var(--c-t1)", border: "1px solid var(--c-border)",
          }}>
            🪑 {order.tableNote}
          </span>
        )}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
          {isPending ? (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
              background: col.bg, color: col.text, border: `1px solid ${col.border}`,
              display: "flex", alignItems: "center", gap: 3,
            }}>
              <Timer size={10} /> {el.label}
            </span>
          ) : (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
              background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)",
            }}>
              ✓ 提供済み
            </span>
          )}
          {order.paymentMethod === "cash"
            ? <Banknote size={13} color="var(--c-green)" />
            : <CreditCard size={13} color="var(--c-blue)" />
          }
        </div>
      </div>

      {/* 商品リスト */}
      <div style={{
        background: "var(--c-bg3)", borderRadius: 9, padding: "10px 12px",
        display: "flex", flexDirection: "column", gap: 5,
      }}>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 15 }}>{item.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--c-t0)", flex: 1 }}>
              {item.name}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 800, color: "var(--c-xp)",
              minWidth: 24, textAlign: "right",
            }}>×{item.qty}</span>
            {item.note && (
              <span style={{ fontSize: 10, color: "var(--c-t2)", marginLeft: 4, fontStyle: "italic" }}>
                ({item.note})
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 金額・割引 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--c-t0)" }}>
          ¥{order.total.toLocaleString()}
        </span>
        {order.discount > 0 && (
          <span style={{ fontSize: 11, color: "var(--c-t2)", textDecoration: "line-through" }}>
            ¥{order.subtotal.toLocaleString()}
          </span>
        )}
        {order.discount > 0 && (
          <span style={{
            fontSize: 10.5, fontWeight: 700, padding: "1px 6px", borderRadius: 5,
            background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)",
          }}>
            -{order.discount}%OFF
          </span>
        )}
        {order.paymentMethod === "cash" && order.cashReceived != null && (
          <span style={{ fontSize: 11, color: "var(--c-t2)", marginLeft: "auto" }}>
            お釣り ¥{(order.cashReceived - order.total).toLocaleString()}
          </span>
        )}
      </div>

      {/* アクションボタン */}
      {isPending && (
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => onServe(order.id)}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              fontSize: 12, fontWeight: 700, background: "var(--c-green)", color: "#fff",
              transition: "opacity 0.15s",
            }}
          >
            <CheckCircle2 size={13} /> 提供完了
          </button>
          <button
            onClick={() => onCancel(order.id)}
            style={{
              padding: "9px 12px", borderRadius: 9, cursor: "pointer",
              background: "transparent", border: "1px solid var(--c-red)",
              color: "var(--c-red)", fontSize: 12, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 4,
              transition: "opacity 0.15s",
            }}
          >
            <XCircle size={12} /> キャンセル
          </button>
        </div>
      )}
    </div>
  );
}

// ── メイン画面 ────────────────────────────────────────────
export function OrderQueue() {
  const { pendingOrders, setPendingOrders } = useStore();
  const [tab, setTab] = useState<"pending" | "served" | "all">("pending");
  const [, tick] = useState(0);

  // 1分ごとに再描画（経過時間更新）
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const summary = todaySummary(pendingOrders);

  const shown = pendingOrders
    .filter((o) => {
      if (tab === "pending") return o.status === "pending";
      if (tab === "served")  return o.status === "served" && o.createdAt.startsWith(today);
      return o.createdAt.startsWith(today);
    })
    .sort((a, b) => {
      // pending は古い順（対応が必要な順）、served は新しい順
      if (a.status === "pending" && b.status === "pending")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  function handleServe(id: string) {
    setPendingOrders(pendingOrders.map((o) =>
      o.id === id ? { ...o, status: "served", servedAt: new Date().toISOString() } : o
    ));
  }

  function handleCancel(id: string) {
    setPendingOrders(pendingOrders.map((o) =>
      o.id === id ? { ...o, status: "cancelled" } : o
    ));
  }

  function handleServeAll() {
    const now = new Date().toISOString();
    setPendingOrders(pendingOrders.map((o) =>
      o.status === "pending" ? { ...o, status: "served", servedAt: now } : o
    ));
  }

  return (
    <div style={{ padding: "24px", maxWidth: 1100, display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── ヘッダー ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ClipboardList size={18} color="var(--c-xp)" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--c-t0)" }}>
              オーダー管理
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: "var(--c-t2)" }}>
              本日 {summary.total}件受注 · 未提供 {summary.pending}件
            </p>
          </div>
        </div>
        {summary.pending > 0 && (
          <button onClick={handleServeAll} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 700, background: "var(--c-green)", color: "#fff",
          }}>
            <CheckCircle2 size={13} /> 全件提供完了
          </button>
        )}
      </div>

      {/* ── 日次サマリー ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          {
            icon: <TrendingUp size={15} color="var(--c-xp)" />,
            label: "本日売上",
            value: `¥${summary.revenue.toLocaleString()}`,
            color: "var(--c-xp)",
          },
          {
            icon: <ShoppingBag size={15} color="var(--c-blue)" />,
            label: "総受注数",
            value: `${summary.total}件`,
            color: "var(--c-blue)",
          },
          {
            icon: <CheckCircle2 size={15} color="var(--c-green)" />,
            label: "提供完了",
            value: `${summary.served}件`,
            color: "var(--c-green)",
          },
          {
            icon: <AlertCircle size={15} color={summary.pending > 0 ? "var(--c-red)" : "var(--c-t2)"} />,
            label: "未提供",
            value: `${summary.pending}件`,
            color: summary.pending > 0 ? "var(--c-red)" : "var(--c-t2)",
          },
        ].map(({ icon, label, value, color }) => (
          <div key={label} style={{
            background: "var(--c-bg2)", border: "1px solid var(--c-border)",
            borderRadius: 12, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: "var(--c-bg3)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>{icon}</div>
            <div>
              <div style={{ fontSize: 10.5, color: "var(--c-t2)", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── タブ ── */}
      <div style={{ display: "flex", gap: 6, borderBottom: "1px solid var(--c-border)", paddingBottom: 0 }}>
        {([
          ["pending", `未提供 (${summary.pending})`,    "var(--c-xp)"],
          ["served",  `提供済み (${summary.served})`,   "var(--c-green)"],
          ["all",     `本日全件 (${summary.total})`,    "var(--c-t1)"],
        ] as const).map(([id, label, color]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: "8px 16px", borderRadius: "8px 8px 0 0", cursor: "pointer",
              fontSize: 12, fontWeight: tab === id ? 700 : 400,
              background: tab === id ? "var(--c-bg2)" : "transparent",
              border: tab === id ? "1px solid var(--c-border)" : "1px solid transparent",
              borderBottom: tab === id ? "1px solid var(--c-bg2)" : "1px solid var(--c-border)",
              color: tab === id ? color : "var(--c-t2)",
              marginBottom: tab === id ? -1 : 0,
              transition: "all 0.15s",
            }}
          >
            {tab === "pending" && id === "pending" && summary.pending > 0 && (
              <span style={{
                display: "inline-flex", width: 16, height: 16, borderRadius: "50%",
                background: "var(--c-red)", color: "#fff", fontSize: 9, fontWeight: 800,
                alignItems: "center", justifyContent: "center", marginRight: 5,
              }}>{summary.pending}</span>
            )}
            {label}
          </button>
        ))}
      </div>

      {/* ── オーダーグリッド ── */}
      {shown.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          color: "var(--c-t2)", fontSize: 13,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        }}>
          <Clock size={32} color="var(--c-bg3)" />
          {tab === "pending" ? "未提供のオーダーはありません" : "本日の記録はありません"}
          <span style={{ fontSize: 11 }}>
            POS レジで会計するとここに表示されます
          </span>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12,
          alignContent: "start",
        }}>
          {shown.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onServe={handleServe}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
