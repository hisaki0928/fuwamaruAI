"use client";

import { useState } from "react";
import { Package, AlertTriangle, CheckCircle2, Search, History, TrendingDown } from "lucide-react";
import type { InvCategory, StockStatus } from "@/lib/types";
import { useStore } from "@/lib/store";

const STATUS_META: Record<StockStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  ok:       { label: "在庫OK",  color: "var(--c-green)",  bg: "rgba(30,122,69,0.1)",   icon: CheckCircle2 },
  low:      { label: "低在庫",  color: "var(--c-xp)",     bg: "rgba(181,100,10,0.1)",  icon: AlertTriangle },
  critical: { label: "補充必要", color: "var(--c-red)",   bg: "rgba(181,40,40,0.1)",   icon: AlertTriangle },
};

const CATS: (InvCategory | "ALL")[] = ["ALL", "豆・粉", "乳製品", "シロップ", "フード材料", "カップ・器材"];

const REASON_LABELS: Record<string, string> = {
  checkout:   "会計",
  manual:     "手動",
  adjustment: "調整",
};
const REASON_COLORS: Record<string, string> = {
  checkout:   "var(--c-blue)",
  manual:     "var(--c-green)",
  adjustment: "var(--c-xp)",
};

function uid() { return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

export function Inventory() {
  const { inventory, setInventory, inventoryLogs, setInventoryLogs } = useStore();
  const [activeTab, setActiveTab]       = useState<"list" | "history">("list");
  const [cat, setCat]                   = useState<InvCategory | "ALL">("ALL");
  const [query, setQuery]               = useState("");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "ALL">("ALL");

  // Manual stock edit state
  const [editId, setEditId]     = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const filtered = inventory.filter((i) => {
    if (cat !== "ALL" && i.category !== cat) return false;
    if (statusFilter !== "ALL" && i.status !== statusFilter) return false;
    if (query && !i.name.includes(query)) return false;
    return true;
  });

  const counts = {
    critical: inventory.filter((i) => i.status === "critical").length,
    low:      inventory.filter((i) => i.status === "low").length,
    ok:       inventory.filter((i) => i.status === "ok").length,
  };

  function handleManualUpdate(itemId: string, newStockStr: string) {
    const newStock = Number(newStockStr);
    if (isNaN(newStock) || newStock < 0) return;
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    const before = item.stock;
    const newStatus: StockStatus =
      newStock === 0 ? "critical" :
      newStock / item.par < 0.3 ? "critical" :
      newStock / item.par < 0.6 ? "low" : "ok";

    setInventory(inventory.map((i) =>
      i.id === itemId ? { ...i, stock: newStock, status: newStatus } : i
    ));

    setInventoryLogs([...inventoryLogs, {
      id: uid(),
      itemId: item.id,
      itemName: item.name,
      before,
      after: newStock,
      unit: item.unit,
      changedAt: new Date().toISOString(),
      reason: "manual",
    }]);

    setEditId(null);
    setEditValue("");
  }

  // Sort logs newest first
  const sortedLogs = [...inventoryLogs].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  return (
    <div style={{ padding: "24px", maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11,
          background: "rgba(26,85,160,0.1)", border: "1px solid rgba(26,85,160,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Package size={18} color="var(--c-blue)" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--c-t0)" }}>在庫管理</h1>
          <p style={{ margin: 0, fontSize: 12, color: "var(--c-t2)" }}>
            補充必要 {counts.critical}件 · 低在庫 {counts.low}件
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {([
          { id: "list",    label: "在庫一覧",  icon: Package },
          { id: "history", label: "変更履歴",  icon: History },
        ] as const).map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
              borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500,
              background: active ? "var(--c-blue)" : "var(--c-bg2)",
              color: active ? "#fff" : "var(--c-t1)",
              transition: "all 0.15s",
            }}>
              <Icon size={13} /> {label}
            </button>
          );
        })}
      </div>

      {activeTab === "list" && (
        <>
          {/* Alert strip */}
          {counts.critical > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
              background: "rgba(181,40,40,0.08)", border: "1px solid rgba(181,40,40,0.25)",
              borderRadius: 10, marginBottom: 18, fontSize: 12, color: "var(--c-red)", fontWeight: 600,
            }}>
              <AlertTriangle size={14} />
              {inventory.filter((i) => i.status === "critical").map((i) => i.name).join("、")} の在庫が危険水準です
            </div>
          )}

          {/* Status quick filter */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {(["ALL", "critical", "low", "ok"] as const).map((s) => {
              const active = statusFilter === s;
              const meta = s !== "ALL" ? STATUS_META[s] : null;
              return (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: active ? (meta?.bg ?? "var(--c-xp)") : "var(--c-bg2)",
                  color: active ? (meta?.color ?? "var(--c-t0)") : "var(--c-t1)",
                  border: `1px solid ${active ? (meta?.color ?? "var(--c-xp)") + "50" : "var(--c-border)"}`,
                  transition: "all 0.15s",
                }}>
                  {s === "ALL" ? "すべて" : STATUS_META[s].label}
                  {s !== "ALL" && ` (${counts[s]})`}
                </button>
              );
            })}
          </div>

          {/* Search + Category */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={13} color="var(--c-t2)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="商品名を検索"
                style={{
                  width: "100%", padding: "8px 12px 8px 30px", borderRadius: 9, fontSize: 13,
                  background: "var(--c-bg2)", border: "1px solid var(--c-border)",
                  color: "var(--c-t0)", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {CATS.map((c) => (
                <button key={c} onClick={() => setCat(c)} style={{
                  padding: "6px 11px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 600,
                  background: cat === c ? "var(--c-blue)" : "var(--c-bg2)",
                  color: cat === c ? "#fff" : "var(--c-t1)",
                  border: `1px solid ${cat === c ? "var(--c-blue)" : "var(--c-border)"}`,
                  whiteSpace: "nowrap",
                }}>
                  {c === "ALL" ? "全カテゴリ" : c}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 100px 80px",
              padding: "10px 16px", borderBottom: "1px solid var(--c-border)",
              fontSize: 11, fontWeight: 700, color: "var(--c-t2)", textTransform: "uppercase", letterSpacing: 0.5,
            }}>
              <span>商品名</span><span>カテゴリ</span><span>在庫</span><span>目標</span><span>ステータス</span><span>更新</span>
            </div>
            {filtered.map((item, i) => {
              const sm = STATUS_META[item.status];
              const pct = Math.min(100, Math.round((item.stock / item.par) * 100));
              const Icon = sm.icon;
              const isEditing = editId === item.id;
              return (
                <div key={item.id} style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 100px 80px",
                  padding: "12px 16px", alignItems: "center",
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--c-border)" : "none",
                  background: item.status === "critical" ? "rgba(181,40,40,0.03)" : "transparent",
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--c-t0)" }}>{item.name}</span>
                  <span style={{ fontSize: 11, color: "var(--c-t2)" }}>{item.category}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: sm.color }}>
                      {item.stock} {item.unit}
                    </div>
                    <div style={{ marginTop: 3, height: 3, borderRadius: 2, background: "var(--c-bg3)", width: 60, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: sm.color, borderRadius: 2 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--c-t2)" }}>{item.par} {item.unit}</span>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px",
                    borderRadius: 6, background: sm.bg, fontSize: 11, fontWeight: 700, color: sm.color,
                  }}>
                    <Icon size={11} /> {sm.label}
                  </div>
                  <div>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: 4 }}>
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          style={{
                            width: 44, padding: "3px 5px", borderRadius: 5, fontSize: 11,
                            background: "var(--c-bg3)", border: "1px solid var(--c-border)",
                            color: "var(--c-t0)", outline: "none",
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleManualUpdate(item.id, editValue);
                            if (e.key === "Escape") { setEditId(null); setEditValue(""); }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleManualUpdate(item.id, editValue)}
                          style={{
                            padding: "3px 6px", borderRadius: 5, border: "none", cursor: "pointer",
                            background: "var(--c-green)", color: "#fff", fontSize: 10, fontWeight: 700,
                          }}
                        >OK</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditId(item.id); setEditValue(String(item.stock)); }}
                        style={{
                          padding: "4px 8px", borderRadius: 6, border: "1px solid var(--c-border)",
                          background: "var(--c-bg3)", color: "var(--c-t1)", fontSize: 10,
                          cursor: "pointer", fontWeight: 600,
                        }}
                      >
                        編集
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "history" && (
        <div>
          {sortedLogs.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "48px 24px",
              background: "var(--c-bg2)", borderRadius: 14, border: "1px solid var(--c-border)",
              color: "var(--c-t2)", fontSize: 13,
            }}>
              まだ変更履歴がありません
            </div>
          ) : (
            <div style={{ background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
                padding: "10px 16px", borderBottom: "1px solid var(--c-border)",
                fontSize: 11, fontWeight: 700, color: "var(--c-t2)", textTransform: "uppercase", letterSpacing: 0.5,
              }}>
                <span>商品名</span><span>変更前</span><span>変更後</span><span>日時</span><span>理由</span>
              </div>
              {sortedLogs.map((log, i) => {
                const delta = log.after - log.before;
                return (
                  <div key={log.id} style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
                    padding: "11px 16px", alignItems: "center",
                    borderBottom: i < sortedLogs.length - 1 ? "1px solid var(--c-border)" : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {delta < 0 && <TrendingDown size={12} color="var(--c-red)" />}
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--c-t0)" }}>{log.itemName}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--c-t1)" }}>{log.before} {log.unit}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: delta < 0 ? "var(--c-red)" : "var(--c-green)" }}>
                      {log.after} {log.unit}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--c-t2)", fontFamily: "monospace" }}>
                      {new Date(log.changedAt).toLocaleString("ja-JP", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5,
                      background: `${REASON_COLORS[log.reason]}18`,
                      color: REASON_COLORS[log.reason],
                    }}>
                      {REASON_LABELS[log.reason]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
