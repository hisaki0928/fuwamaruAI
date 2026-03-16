"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, CheckCircle2 } from "lucide-react";
import type { POSItem, CartItem, POSCategory } from "@/lib/types";
import { useStore } from "@/lib/store";

const CATS: (POSCategory | "ALL")[] = ["ALL", "ドリンク", "フード", "デザート"];

const CAT_COLORS: Record<string, string> = {
  "ドリンク":  "var(--c-blue)",
  "フード":    "var(--c-green)",
  "デザート":  "var(--c-orange)",
};

export function POS() {
  const { posItems, inventory, setInventory } = useStore();
  const [cat, setCat]     = useState<POSCategory | "ALL">("ドリンク");
  const [cart, setCart]   = useState<CartItem[]>([]);
  const [paid, setPaid]   = useState(false);

  const items = cat === "ALL" ? posItems : posItems.filter((i) => i.category === cat);
  const subtotal = cart.reduce((s, c) => s + c.item.price * c.qty, 0);
  const tax      = Math.round(subtotal * 0.1);
  const total    = subtotal + tax;

  function addToCart(item: POSItem) {
    setCart((prev) => {
      const ex = prev.find((c) => c.item.id === item.id);
      if (ex) return prev.map((c) => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { item, qty: 1 }];
    });
  }

  function changeQty(id: string, delta: number) {
    setCart((prev) => prev
      .map((c) => c.item.id === id ? { ...c, qty: c.qty + delta } : c)
      .filter((c) => c.qty > 0)
    );
  }

  function handleCheckout() {
    // Deduct inventory for each sold item
    setInventory(inventory.map((inv) => {
      let deduct = 0;
      for (const cartItem of cart) {
        const ing = cartItem.item.ingredients?.find((i) => i.inventoryId === inv.id);
        if (ing) deduct += ing.amount * cartItem.qty;
      }
      if (deduct === 0) return inv;
      const newStock = Math.max(0, inv.stock - deduct);
      const newStatus: typeof inv.status =
        newStock === 0 ? "critical" :
        newStock / inv.par < 0.3 ? "critical" :
        newStock / inv.par < 0.6 ? "low" : "ok";
      return { ...inv, stock: newStock, status: newStatus };
    }));
    setPaid(true);
    setTimeout(() => { setCart([]); setPaid(false); }, 2200);
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 66px)", overflow: "hidden" }}>

      {/* ── Left: Products ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "20px 16px 20px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "rgba(181,100,10,0.1)", border: "1px solid rgba(181,100,10,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ShoppingCart size={17} color="var(--c-xp)" />
          </div>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "var(--c-t0)" }}>POS レジ</h1>
        </div>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {CATS.map((c) => {
            const active = cat === c;
            return (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: "7px 16px", borderRadius: 8, cursor: "pointer",
                fontSize: 12, fontWeight: 600,
                background: active ? "var(--c-xp)" : "var(--c-bg2)",
                color: active ? "#fff" : "var(--c-t1)",
                border: `1px solid ${active ? "var(--c-xp)" : "var(--c-border)"}`,
                transition: "all 0.15s",
              }}>
                {c === "ALL" ? "すべて" : c}
              </button>
            );
          })}
        </div>

        {/* Items grid */}
        <div style={{
          flex: 1, overflowY: "auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10,
          alignContent: "start",
        }}>
          {items.map((item) => {
            const inCart = cart.find((c) => c.item.id === item.id)?.qty ?? 0;
            const col = CAT_COLORS[item.category] ?? "var(--c-t2)";
            return (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                style={{
                  padding: "14px 10px", borderRadius: 12, cursor: "pointer",
                  background: "var(--c-bg2)", border: `1px solid ${inCart ? "var(--c-xp)" : "var(--c-border)"}`,
                  textAlign: "center", transition: "all 0.15s", position: "relative",
                  boxShadow: inCart ? "0 2px 10px rgba(181,100,10,0.15)" : "none",
                }}
              >
                {inCart > 0 && (
                  <div style={{
                    position: "absolute", top: -6, right: -6, width: 20, height: 20,
                    borderRadius: "50%", background: "var(--c-xp)", color: "#fff",
                    fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{inCart}</div>
                )}
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: 76, objectFit: "cover", borderRadius: 8, marginBottom: 6 }} />
                  : <div style={{ fontSize: 28, marginBottom: 6 }}>{item.emoji}</div>
                }
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-t0)", marginBottom: 3, lineHeight: 1.3 }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: col }}>¥{item.price}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: Cart ── */}
      <div style={{
        width: 280, borderLeft: "1px solid var(--c-border)", display: "flex", flexDirection: "column",
        background: "var(--c-bg1)",
      }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--c-border)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-t0)", display: "flex", alignItems: "center", gap: 6 }}>
            <ShoppingCart size={13} color="var(--c-t1)" />
            注文内容 ({cart.reduce((s, c) => s + c.qty, 0)}点)
          </div>
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--c-t2)", fontSize: 12 }}>
              商品をタップして追加
            </div>
          ) : (
            cart.map((c) => (
              <div key={c.item.id} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
              }}>
                <span style={{ fontSize: 18 }}>{c.item.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--c-t0)", lineHeight: 1.3 }}>{c.item.name}</div>
                  <div style={{ fontSize: 11, color: "var(--c-xp)", fontWeight: 700 }}>¥{(c.item.price * c.qty).toLocaleString()}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => changeQty(c.item.id, -1)} style={{
                    width: 22, height: 22, borderRadius: 6, border: "1px solid var(--c-border)",
                    background: "var(--c-bg3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}><Minus size={10} color="var(--c-t1)" /></button>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--c-t0)", minWidth: 16, textAlign: "center" }}>{c.qty}</span>
                  <button onClick={() => changeQty(c.item.id, +1)} style={{
                    width: 22, height: 22, borderRadius: 6, border: "1px solid var(--c-border)",
                    background: "var(--c-bg3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}><Plus size={10} color="var(--c-t1)" /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals + checkout */}
        <div style={{ borderTop: "1px solid var(--c-border)", padding: "14px 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
            {[
              { label: "小計",  val: subtotal },
              { label: "消費税 10%", val: tax },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--c-t1)" }}>
                <span>{label}</span>
                <span>¥{val.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: "var(--c-t0)", paddingTop: 5, borderTop: "1px solid var(--c-border)", marginTop: 2 }}>
              <span>合計</span>
              <span style={{ color: "var(--c-xp)" }}>¥{total.toLocaleString()}</span>
            </div>
          </div>

          {paid ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "12px", borderRadius: 10, background: "rgba(30,122,69,0.12)",
              border: "1px solid rgba(30,122,69,0.3)", fontSize: 13, fontWeight: 700, color: "var(--c-green)",
            }}>
              <CheckCircle2 size={16} /> 会計完了！
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={handleCheckout} disabled={cart.length === 0} style={{
                flex: 1, padding: "10px 0", borderRadius: 9, cursor: cart.length ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                fontSize: 12, fontWeight: 700, border: "none",
                background: cart.length ? "var(--c-xp)" : "var(--c-bg3)",
                color: cart.length ? "#fff" : "var(--c-t2)",
              }}>
                <CreditCard size={13} /> カード
              </button>
              <button onClick={handleCheckout} disabled={cart.length === 0} style={{
                flex: 1, padding: "10px 0", borderRadius: 9, cursor: cart.length ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                fontSize: 12, fontWeight: 700, border: "none",
                background: cart.length ? "var(--c-green)" : "var(--c-bg3)",
                color: cart.length ? "#fff" : "var(--c-t2)",
              }}>
                <Banknote size={13} /> 現金
              </button>
            </div>
          )}

          {cart.length > 0 && !paid && (
            <button onClick={() => setCart([])} style={{
              width: "100%", marginTop: 6, padding: "6px 0", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              fontSize: 11, color: "var(--c-red)", background: "transparent", border: "none", cursor: "pointer",
            }}>
              <Trash2 size={11} /> クリア
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
