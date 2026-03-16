"use client";

import { useState } from "react";
import { Award, Lock } from "lucide-react";
import type { BadgeCategory } from "@/lib/types";
import { useStore } from "@/lib/store";

const RARITY_META = {
  COMMON:    { label: "コモン",    color: "#a0a0b0" },
  RARE:      { label: "レア",      color: "#60a5fa" },
  EPIC:      { label: "エピック",  color: "#a78bfa" },
  LEGENDARY: { label: "レジェンダリー", color: "#f59e0b" },
} as const;

const CATEGORIES: (BadgeCategory | "ALL")[] = ["ALL", "接客", "バリスタ", "チームワーク", "継続", "特別"];

export function Badges() {
  const { badges } = useStore();
  const [cat, setCat] = useState<BadgeCategory | "ALL">("ALL");

  const filtered = cat === "ALL" ? badges : badges.filter((b) => b.category === cat);
  const earned = badges.filter((b) => b.earned).length;

  return (
    <div style={{ padding: "24px", maxWidth: 800 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11, background: "rgba(167,139,250,0.12)",
          border: "1px solid rgba(167,139,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Award size={18} color="var(--c-fp)" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--c-t0)" }}>バッジ・実績</h1>
          <p style={{ margin: 0, fontSize: 12, color: "var(--c-t2)" }}>{earned}/{badges.length} 獲得済み</p>
        </div>
      </div>

      {/* 進捗 */}
      <div style={{
        background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 14,
        padding: "16px 20px", marginBottom: 20,
        display: "flex", gap: 20, alignItems: "center",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: "var(--c-t1)", fontWeight: 600 }}>コレクション達成率</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--c-fp)" }}>
              {Math.round((earned / badges.length) * 100)}%
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: "var(--c-bg3)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3,
              width: `${(earned / badges.length) * 100}%`,
              background: "linear-gradient(90deg, var(--c-fp), #7c3aed)",
            }} />
          </div>
        </div>
        {(["COMMON", "RARE", "EPIC", "LEGENDARY"] as const).map((r) => {
          const cnt = badges.filter((b) => b.rarity === r && b.earned).length;
          return (
            <div key={r} style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: RARITY_META[r].color }}>{cnt}</div>
              <div style={{ fontSize: 9.5, color: "var(--c-t2)" }}>{RARITY_META[r].label}</div>
            </div>
          );
        })}
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {CATEGORIES.map((c) => {
          const cnt = c === "ALL" ? badges.length : badges.filter((b) => b.category === c).length;
          const active = cat === c;
          return (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
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

      {/* Badge grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {filtered.map((badge) => {
          const rm = RARITY_META[badge.rarity];
          return (
            <div
              key={badge.id}
              style={{
                background: badge.earned ? "var(--c-bg2)" : "var(--c-bg1)",
                border: `1px solid ${badge.earned ? rm.color + "40" : "var(--c-border)"}`,
                borderRadius: 14, padding: "16px 14px",
                opacity: badge.earned ? 1 : 0.55,
                transition: "all 0.15s",
                position: "relative",
                textAlign: "center",
              }}
            >
              {/* Rarity badge */}
              <div style={{
                position: "absolute", top: 8, right: 8,
                fontSize: 9, fontWeight: 700, padding: "2px 5px",
                borderRadius: 4, background: `${rm.color}18`, color: rm.color,
              }}>{rm.label}</div>

              {/* Emoji */}
              <div style={{
                fontSize: 32, marginBottom: 8, lineHeight: 1,
                filter: badge.earned ? "none" : "grayscale(1)",
              }}>{badge.emoji}</div>

              <div style={{ fontSize: 13, fontWeight: 700, color: badge.earned ? "var(--c-t0)" : "var(--c-t2)", marginBottom: 4 }}>
                {badge.name}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--c-t2)", lineHeight: 1.5 }}>
                {badge.description}
              </div>

              {badge.earned ? (
                <div style={{
                  marginTop: 10, fontSize: 10, color: "#34d399", fontWeight: 600,
                }}>
                  ✓ {badge.earnedAt} 獲得
                </div>
              ) : (
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <Lock size={10} color="var(--c-t2)" />
                  <span style={{ fontSize: 10, color: "var(--c-t2)" }}>+{badge.xpReward} XP</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
