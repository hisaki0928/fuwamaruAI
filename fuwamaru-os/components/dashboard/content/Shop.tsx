"use client";

import { useState } from "react";
import { ShoppingBag, Gem, CheckCircle2 } from "lucide-react";
import type { ShopCategory, User } from "@/lib/types";
import { useStore } from "@/lib/store";

const CATEGORIES: (ShopCategory | "ALL")[] = ["ALL", "特典", "称号", "アバター", "消耗品"];

export function Shop({ user }: { user: User }) {
  const { shopItems } = useStore();
  const [cat, setCat] = useState<ShopCategory | "ALL">("ALL");
  const [purchased, setPurchased] = useState<Set<string>>(new Set());
  const [fp, setFp] = useState(user.fp);

  const filtered = cat === "ALL" ? shopItems : shopItems.filter((i) => i.category === cat);

  function handleBuy(id: string, cost: number) {
    if (fp < cost) return;
    setFp((prev) => prev - cost);
    setPurchased((prev) => new Set([...prev, id]));
  }

  return (
    <div style={{ padding: "24px", maxWidth: 800 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11, background: "rgba(167,139,250,0.12)",
            border: "1px solid rgba(167,139,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ShoppingBag size={18} color="var(--c-fp)" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--c-t0)" }}>FP ショップ</h1>
            <p style={{ margin: 0, fontSize: 12, color: "var(--c-t2)" }}>貯めたFPでご褒美をゲット</p>
          </div>
        </div>
        {/* FP Balance */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
          background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 10,
        }}>
          <Gem size={14} color="var(--c-fp)" />
          <span style={{ fontSize: 16, fontWeight: 800, color: "var(--c-fp)" }}>{fp.toLocaleString()}</span>
          <span style={{ fontSize: 11, color: "var(--c-t2)" }}>FP</span>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {CATEGORIES.map((c) => {
          const cnt = c === "ALL" ? shopItems.length : shopItems.filter((i) => i.category === c).length;
          const active = cat === c;
          return (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: "6px 13px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: active ? "var(--c-fp)" : "var(--c-bg2)",
              color: active ? "#000" : "var(--c-t1)",
              border: `1px solid ${active ? "var(--c-fp)" : "var(--c-border)"}`,
              transition: "all 0.15s",
            }}>
              {c === "ALL" ? "すべて" : c} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Items grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {filtered.map((item) => {
          const canBuy = !item.soldOut && !purchased.has(item.id) && fp >= item.fpCost;
          const isBought = purchased.has(item.id);

          return (
            <div
              key={item.id}
              style={{
                background: "var(--c-bg2)", border: "1px solid var(--c-border)",
                borderRadius: 14, padding: "18px 16px", position: "relative",
                opacity: item.soldOut ? 0.5 : 1,
              }}
            >
              {/* Badges */}
              <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 4 }}>
                {item.limited && (
                  <span style={{
                    fontSize: 9.5, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                    background: "rgba(245,158,11,0.15)", color: "var(--c-xp)", border: "1px solid rgba(245,158,11,0.3)",
                  }}>限定</span>
                )}
                {item.soldOut && (
                  <span style={{
                    fontSize: 9.5, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                    background: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)",
                  }}>完売</span>
                )}
              </div>

              <div style={{ fontSize: 32, marginBottom: 10 }}>{item.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-t0)", marginBottom: 5 }}>{item.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--c-t2)", lineHeight: 1.5, marginBottom: 14 }}>
                {item.description}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Gem size={13} color="var(--c-fp)" />
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--c-fp)" }}>{item.fpCost}</span>
                  <span style={{ fontSize: 10.5, color: "var(--c-t2)" }}>FP</span>
                </div>
                {isBought ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#34d399", fontWeight: 600 }}>
                    <CheckCircle2 size={13} />購入済み
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuy(item.id, item.fpCost)}
                    disabled={!canBuy}
                    style={{
                      padding: "7px 14px", borderRadius: 8, cursor: canBuy ? "pointer" : "not-allowed",
                      fontSize: 12, fontWeight: 700, border: "none",
                      background: canBuy ? "var(--c-fp)" : "var(--c-bg3)",
                      color: canBuy ? "#000" : "var(--c-t2)",
                      transition: "all 0.15s",
                    }}
                  >
                    {item.soldOut ? "完売" : fp < item.fpCost ? "FP不足" : "購入"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
