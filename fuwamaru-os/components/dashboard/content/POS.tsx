"use client";

import { useState } from "react";
import {
  ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote,
  CheckCircle2, Percent, MessageSquare, TrendingUp, Hash,
} from "lucide-react";
import type { POSItem, CartItem, POSCategory } from "@/lib/types";
import { useStore } from "@/lib/store";

const CATS: (POSCategory | "ALL")[] = ["ALL", "ドリンク", "フード", "デザート"];
const CAT_COLORS: Record<string, string> = {
  "ドリンク": "var(--c-blue)",
  "フード":   "var(--c-green)",
  "デザート": "var(--c-orange)",
};
const DISCOUNT_OPTIONS = [0, 5, 10, 15, 20] as const;

let orderCounter = 1;
function uid() { return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

type PayMethod = "card" | "cash";
type CartItemExt = CartItem & { note?: string };

export function POS() {
  const {
    posItems, inventory, setInventory,
    inventoryLogs, setInventoryLogs,
    pendingOrders, setPendingOrders,
  } = useStore();

  const [cat,        setCat]        = useState<POSCategory | "ALL">("ドリンク");
  const [cart,       setCart]       = useState<CartItemExt[]>([]);
  const [tableNote,  setTableNote]  = useState("");
  const [discount,   setDiscount]   = useState(0);
  const [payMethod,  setPayMethod]  = useState<PayMethod>("card");
  const [cashInput,  setCashInput]  = useState("");
  const [noteTarget, setNoteTarget] = useState<string | null>(null);
  const [noteText,   setNoteText]   = useState("");
  const [paid,       setPaid]       = useState(false);
  const [lastOrder,  setLastOrder]  = useState<{ orderNo: number; change?: number } | null>(null);

  const items    = cat === "ALL" ? posItems : posItems.filter((i) => i.category === cat);
  const subtotal = cart.reduce((s, c) => s + c.item.price * c.qty, 0);
  const discAmt  = Math.round(subtotal * discount / 100);
  const afterDisc = subtotal - discAmt;
  const tax      = Math.round(afterDisc * 0.1);
  const total    = afterDisc + tax;
  const cashNum  = parseInt(cashInput.replace(/[^0-9]/g, ""), 10) || 0;
  const change   = payMethod === "cash" ? cashNum - total : 0;

  const todayStr     = new Date().toISOString().slice(0, 10);
  const todayOrders  = pendingOrders.filter((o) => o.createdAt.startsWith(todayStr) && o.status !== "cancelled");
  const todayRevenue = todayOrders.filter((o) => o.status === "served").reduce((s, o) => s + o.total, 0);
  const pendingCount = pendingOrders.filter((o) => o.status === "pending").length;

  function addToCart(item: POSItem) {
    setCart((prev) => {
      const ex = prev.find((c) => c.item.id === item.id);
      if (ex) return prev.map((c) => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { item, qty: 1 }];
    });
  }

  function changeQty(id: string, delta: number) {
    setCart((prev) =>
      prev.map((c) => c.item.id === id ? { ...c, qty: c.qty + delta } : c)
          .filter((c) => c.qty > 0)
    );
  }

  function applyNote() {
    if (!noteTarget) return;
    setCart((prev) => prev.map((c) =>
      c.item.id === noteTarget ? { ...c, note: noteText || undefined } : c
    ));
    setNoteTarget(null);
    setNoteText("");
  }

  function handleCheckout(method: PayMethod) {
    if (method === "cash" && cashNum < total) return;
    const now  = new Date().toISOString();
    const logs = [...inventoryLogs];

    const newInventory = inventory.map((inv) => {
      let deduct = 0;
      for (const ci of cart) {
        const ing = ci.item.ingredients?.find((i) => i.inventoryId === inv.id);
        if (ing) deduct += ing.amount * ci.qty;
      }
      if (deduct === 0) return inv;
      const before   = inv.stock;
      const newStock = Math.max(0, inv.stock - deduct);
      const newStatus: typeof inv.status =
        newStock === 0            ? "critical" :
        newStock / inv.par < 0.3 ? "critical" :
        newStock / inv.par < 0.6 ? "low" : "ok";
      logs.push({ id: uid(), itemId: inv.id, itemName: inv.name, before, after: newStock, unit: inv.unit, changedAt: now, reason: "checkout" });
      return { ...inv, stock: newStock, status: newStatus };
    });

    setInventory(newInventory);
    setInventoryLogs(logs);

    const no = orderCounter++;
    const order = {
      id: uid(),
      orderNo: no,
      items: cart.map((c) => ({ name: c.item.name, emoji: c.item.emoji, qty: c.qty, note: c.note })),
      total,
      subtotal,
      discount,
      paymentMethod: method,
      cashReceived:  method === "cash" ? cashNum : undefined,
      tableNote:     tableNote || undefined,
      createdAt:     now,
      status: "pending" as const,
    };
    setPendingOrders([...pendingOrders, order]);
    setLastOrder({ orderNo: no, change: method === "cash" ? cashNum - total : undefined });
    setPaid(true);
    setTimeout(() => {
      setCart([]); setDiscount(0); setTableNote(""); setCashInput(""); setPayMethod("card"); setPaid(false); setLastOrder(null);
    }, 3000);
  }

  const canCheckout = cart.length > 0 && !(payMethod === "cash" && cashNum > 0 && cashNum < total);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 66px)", overflow: "hidden", flexDirection: "column" }}>

      {/* ── 日次売上バー ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 20, padding: "7px 20px",
        background: "var(--c-bg1)", borderBottom: "1px solid var(--c-border)", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <TrendingUp size={12} color="var(--c-xp)" />
          <span style={{ fontSize: 11, color: "var(--c-t2)" }}>本日売上</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "var(--c-xp)" }}>¥{todayRevenue.toLocaleString()}</span>
        </div>
        <div style={{ width: 1, height: 14, background: "var(--c-border)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <ShoppingCart size={11} color="var(--c-t2)" />
          <span style={{ fontSize: 11, color: "var(--c-t2)" }}>受注</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-t0)" }}>{todayOrders.length}件</span>
        </div>
        {pendingCount > 0 && (
          <>
            <div style={{ width: 1, height: 14, background: "var(--c-border)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-red)", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 11, color: "var(--c-red)", fontWeight: 700 }}>未提供 {pendingCount}件</span>
            </div>
          </>
        )}
      </div>

      {/* ── 2カラム ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* 左：商品グリッド */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "16px 12px 16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(181,100,10,0.1)", border: "1px solid rgba(181,100,10,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingCart size={15} color="var(--c-xp)" />
            </div>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--c-t0)" }}>POS レジ</h1>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {CATS.map((c) => {
              const active = cat === c;
              return (
                <button key={c} onClick={() => setCat(c)} style={{
                  padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                  background: active ? "var(--c-xp)" : "var(--c-bg2)",
                  color: active ? "#fff" : "var(--c-t1)",
                  border: `1px solid ${active ? "var(--c-xp)" : "var(--c-border)"}`,
                }}>
                  {c === "ALL" ? "すべて" : c}
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8, alignContent: "start" }}>
            {items.map((item) => {
              const inCart = cart.find((c) => c.item.id === item.id)?.qty ?? 0;
              const col = CAT_COLORS[item.category] ?? "var(--c-t2)";
              return (
                <button key={item.id} onClick={() => addToCart(item)} style={{
                  padding: "12px 8px", borderRadius: 11, cursor: "pointer", textAlign: "center", position: "relative", transition: "all 0.15s",
                  background: "var(--c-bg2)", border: `1px solid ${inCart ? "var(--c-xp)" : "var(--c-border)"}`,
                  boxShadow: inCart ? "0 2px 10px rgba(181,100,10,0.2)" : "none",
                }}>
                  {inCart > 0 && (
                    <div style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "var(--c-xp)", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{inCart}</div>
                  )}
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: 68, objectFit: "cover", borderRadius: 7, marginBottom: 5 }} />
                    : <div style={{ fontSize: 26, marginBottom: 5 }}>{item.emoji}</div>
                  }
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--c-t0)", marginBottom: 2, lineHeight: 1.3 }}>{item.name}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: col }}>¥{item.price}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 右：カート */}
        <div style={{ width: 300, borderLeft: "1px solid var(--c-border)", display: "flex", flexDirection: "column", background: "var(--c-bg1)", flexShrink: 0 }}>

          <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--c-border)" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--c-t0)", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <ShoppingCart size={12} color="var(--c-t1)" />
              注文内容 ({cart.reduce((s, c) => s + c.qty, 0)}点)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Hash size={11} color="var(--c-t2)" />
              <input
                type="text" value={tableNote} onChange={(e) => setTableNote(e.target.value)}
                placeholder="席番号・テーブル（任意）"
                style={{ flex: 1, padding: "5px 8px", borderRadius: 7, fontSize: 11, boxSizing: "border-box", background: "var(--c-bg3)", border: "1px solid var(--c-border)", color: "var(--c-t0)", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--c-t2)", fontSize: 12 }}>商品をタップして追加</div>
            ) : (
              cart.map((c) => (
                <div key={c.item.id} style={{ padding: "7px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 17 }}>{c.item.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--c-t0)", lineHeight: 1.3 }}>{c.item.name}</div>
                      <div style={{ fontSize: 11, color: "var(--c-xp)", fontWeight: 700 }}>¥{(c.item.price * c.qty).toLocaleString()}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                      <button onClick={() => changeQty(c.item.id, -1)} style={{ width: 20, height: 20, borderRadius: 5, border: "1px solid var(--c-border)", background: "var(--c-bg3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={9} color="var(--c-t1)" /></button>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--c-t0)", minWidth: 14, textAlign: "center" }}>{c.qty}</span>
                      <button onClick={() => changeQty(c.item.id, +1)} style={{ width: 20, height: 20, borderRadius: 5, border: "1px solid var(--c-border)", background: "var(--c-bg3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={9} color="var(--c-t1)" /></button>
                      <button onClick={() => { setNoteTarget(c.item.id); setNoteText(c.note ?? ""); }} style={{
                        width: 20, height: 20, borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        border: `1px solid ${c.note ? "var(--c-blue)" : "var(--c-border)"}`,
                        background: c.note ? "rgba(96,165,250,0.12)" : "var(--c-bg3)",
                      }}>
                        <MessageSquare size={9} color={c.note ? "var(--c-blue)" : "var(--c-t2)"} />
                      </button>
                    </div>
                  </div>
                  {c.note && <div style={{ fontSize: 10, color: "var(--c-blue)", marginTop: 2, paddingLeft: 24, fontStyle: "italic" }}>📝 {c.note}</div>}
                </div>
              ))
            )}
          </div>

          <div style={{ borderTop: "1px solid var(--c-border)", padding: "10px 14px 14px" }}>
            {/* 割引 */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--c-t2)", marginBottom: 4, display: "flex", alignItems: "center", gap: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>
                <Percent size={9} /> 割引
              </div>
              <div style={{ display: "flex", gap: 3 }}>
                {DISCOUNT_OPTIONS.map((d) => (
                  <button key={d} onClick={() => setDiscount(d)} style={{
                    flex: 1, padding: "4px 0", borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: discount === d ? 700 : 500, transition: "all 0.12s",
                    background: discount === d ? "rgba(248,113,113,0.15)" : "var(--c-bg3)",
                    color: discount === d ? "#f87171" : "var(--c-t2)",
                    border: discount === d ? "1px solid rgba(248,113,113,0.4)" : "1px solid var(--c-border)",
                  }}>
                    {d === 0 ? "なし" : `${d}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* 金額 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--c-t1)" }}><span>小計</span><span>¥{subtotal.toLocaleString()}</span></div>
              {discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#f87171" }}><span>割引 ({discount}%)</span><span>-¥{discAmt.toLocaleString()}</span></div>}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--c-t1)" }}><span>消費税 10%</span><span>¥{tax.toLocaleString()}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: "var(--c-t0)", paddingTop: 4, borderTop: "1px solid var(--c-border)", marginTop: 2 }}>
                <span>合計</span><span style={{ color: "var(--c-xp)" }}>¥{total.toLocaleString()}</span>
              </div>
            </div>

            {/* 支払方法 */}
            <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
              {(["card", "cash"] as PayMethod[]).map((m) => (
                <button key={m} onClick={() => setPayMethod(m)} style={{
                  flex: 1, padding: "7px 0", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: payMethod === m ? 700 : 500, border: "none", transition: "all 0.12s",
                  background: m === "card"
                    ? (payMethod === "card" ? "rgba(96,165,250,0.2)" : "var(--c-bg3)")
                    : (payMethod === "cash" ? "rgba(52,211,153,0.15)" : "var(--c-bg3)"),
                  color: m === "card"
                    ? (payMethod === "card" ? "var(--c-blue)" : "var(--c-t2)")
                    : (payMethod === "cash" ? "var(--c-green)" : "var(--c-t2)"),
                  outline: payMethod === m ? `1px solid ${m === "card" ? "rgba(96,165,250,0.4)" : "rgba(52,211,153,0.4)"}` : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                }}>
                  {m === "card" ? <CreditCard size={11} /> : <Banknote size={11} />}
                  {m === "card" ? "カード" : "現金"}
                </button>
              ))}
            </div>

            {/* 現金おつり */}
            {payMethod === "cash" && (
              <div style={{ marginBottom: 8 }}>
                <input
                  type="number" value={cashInput} onChange={(e) => setCashInput(e.target.value)}
                  placeholder="受取金額を入力"
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, fontSize: 13, boxSizing: "border-box", background: "var(--c-bg3)", border: "1px solid var(--c-border)", color: "var(--c-t0)", outline: "none" }}
                />
                {cashNum >= total && cashNum > 0 && (
                  <div style={{ marginTop: 5, padding: "6px 10px", borderRadius: 7, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", fontSize: 13, fontWeight: 800, color: "var(--c-green)", textAlign: "center" }}>
                    お釣り ¥{change.toLocaleString()}
                  </div>
                )}
                {cashNum > 0 && cashNum < total && (
                  <div style={{ marginTop: 4, fontSize: 11, color: "var(--c-red)", textAlign: "center" }}>¥{(total - cashNum).toLocaleString()} 不足</div>
                )}
              </div>
            )}

            {/* 会計ボタン */}
            {paid && lastOrder ? (
              <div style={{ padding: "11px", borderRadius: 10, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 3, fontSize: 13, fontWeight: 700, color: "var(--c-green)" }}>
                  <CheckCircle2 size={14} /> #{lastOrder.orderNo} 会計完了！
                </div>
                {lastOrder.change != null && (
                  <div style={{ fontSize: 12, color: "var(--c-t1)" }}>お釣り ¥{lastOrder.change.toLocaleString()}</div>
                )}
              </div>
            ) : (
              <button onClick={() => handleCheckout(payMethod)} disabled={!canCheckout} style={{
                width: "100%", padding: "11px 0", borderRadius: 10, cursor: canCheckout ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                fontSize: 13, fontWeight: 800, border: "none", transition: "all 0.15s",
                background: canCheckout ? "var(--c-xp)" : "var(--c-bg3)",
                color: canCheckout ? "#fff" : "var(--c-t2)",
              }}>
                {payMethod === "card" ? <CreditCard size={13} /> : <Banknote size={13} />}
                {payMethod === "card" ? "カードで会計" : "現金で会計"}
              </button>
            )}

            {cart.length > 0 && !paid && (
              <button onClick={() => { setCart([]); setDiscount(0); setCashInput(""); setTableNote(""); }} style={{
                width: "100%", marginTop: 5, padding: "5px 0", borderRadius: 7,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                fontSize: 11, color: "var(--c-red)", background: "transparent", border: "none", cursor: "pointer",
              }}>
                <Trash2 size={10} /> クリア
              </button>
            )}
          </div>
        </div>
      </div>

      {/* メモ入力モーダル */}
      {noteTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setNoteTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--c-bg0)", borderRadius: 14, padding: 20, width: "100%", maxWidth: 320, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-t0)", marginBottom: 10 }}>メモを追加</div>
            <input
              type="text" value={noteText} onChange={(e) => setNoteText(e.target.value)} autoFocus
              placeholder="例：ホット、砂糖なし、サイズL..."
              onKeyDown={(e) => e.key === "Enter" && applyNote()}
              style={{ width: "100%", padding: "9px 11px", borderRadius: 8, fontSize: 13, boxSizing: "border-box", background: "var(--c-bg2)", border: "1px solid var(--c-border)", color: "var(--c-t0)", outline: "none" }}
            />
            <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
              <button onClick={applyNote} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--c-xp)", color: "#fff" }}>適用</button>
              <button onClick={() => setNoteTarget(null)} style={{ padding: "9px 14px", borderRadius: 8, cursor: "pointer", background: "transparent", border: "1px solid var(--c-border)", color: "var(--c-t2)", fontSize: 12 }}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
