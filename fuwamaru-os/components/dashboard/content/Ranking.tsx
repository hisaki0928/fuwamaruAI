"use client";

import { useState } from "react";
import { BarChart2, Zap, Gem, Flame, Crown } from "lucide-react";
import type { RankType } from "@/lib/types";
import { MOCK_RANKING } from "@/lib/mock-data";

const RANK_TABS: { id: RankType; label: string; icon: React.ElementType; color: string; key: "xp" | "fp" | "streak" }[] = [
  { id: "xp",     label: "XP ランキング",     icon: Zap,   color: "#f59e0b", key: "xp" },
  { id: "fp",     label: "FP ランキング",     icon: Gem,   color: "#a78bfa", key: "fp" },
  { id: "streak", label: "連続出勤ランキング", icon: Flame, color: "#fb923c", key: "streak" },
];

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export function Ranking({ currentUserId }: { currentUserId?: string }) {
  const [tab, setTab] = useState<RankType>("xp");
  const tabMeta = RANK_TABS.find((t) => t.id === tab)!;

  const sorted = [...MOCK_RANKING].sort((a, b) => b[tabMeta.key] - a[tabMeta.key]);
  const myRank = sorted.findIndex((r) => r.userId === currentUserId) + 1;

  return (
    <div style={{ padding: "24px", maxWidth: 680 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11, background: "rgba(245,158,11,0.12)",
          border: "1px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <BarChart2 size={18} color="var(--c-xp)" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--c-t0)" }}>ランキング</h1>
          <p style={{ margin: 0, fontSize: 12, color: "var(--c-t2)" }}>
            {currentUserId && myRank > 0 ? `あなたの順位: ${myRank}位` : "チーム全体の順位"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {RANK_TABS.map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "10px 12px", borderRadius: 10, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontSize: 12, fontWeight: 600,
              background: active ? `${t.color}18` : "var(--c-bg2)",
              color: active ? t.color : "var(--c-t1)",
              border: `1px solid ${active ? t.color + "40" : "var(--c-border)"}`,
              transition: "all 0.15s",
            }}>
              <Icon size={13} color={active ? t.color : "var(--c-t2)"} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Top 3 podium */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, justifyContent: "center" }}>
        {sorted.slice(0, 3).map((entry, i) => {
          const isMe = entry.userId === currentUserId;
          return (
            <div
              key={entry.userId}
              style={{
                flex: i === 0 ? "0 0 160px" : "0 0 130px",
                background: isMe ? `${tabMeta.color}14` : "var(--c-bg2)",
                border: `1px solid ${isMe ? tabMeta.color + "40" : "var(--c-border)"}`,
                borderRadius: 14, padding: "16px 12px", textAlign: "center",
                order: i === 1 ? -1 : i === 2 ? 1 : 0,
                marginTop: i === 0 ? 0 : 16,
              }}
            >
              <div style={{ fontSize: i === 0 ? 28 : 22, marginBottom: 6 }}>{RANK_MEDALS[i]}</div>
              <div style={{ fontSize: i === 0 ? 24 : 20, marginBottom: 4 }}>{entry.avatarEmoji}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-t0)" }}>{entry.nickname}</div>
              <div style={{
                fontSize: i === 0 ? 18 : 15, fontWeight: 800, color: tabMeta.color, marginTop: 6,
              }}>
                {tabMeta.key === "streak"
                  ? `${entry[tabMeta.key]}日`
                  : entry[tabMeta.key].toLocaleString()}
              </div>
              <div style={{ fontSize: 9, color: "var(--c-t2)", marginTop: 2 }}>
                {tabMeta.key === "xp" ? "XP" : tabMeta.key === "fp" ? "FP" : "連続"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full list */}
      <div style={{ background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 14, overflow: "hidden" }}>
        {sorted.map((entry, i) => {
          const isMe = entry.userId === currentUserId;
          const Icon = tabMeta.icon;
          return (
            <div
              key={entry.userId}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                borderBottom: i < sorted.length - 1 ? "1px solid var(--c-border)" : "none",
                background: isMe ? `${tabMeta.color}08` : "transparent",
              }}
            >
              <div style={{ width: 22, textAlign: "center", flexShrink: 0 }}>
                {i < 3
                  ? <span style={{ fontSize: 14 }}>{RANK_MEDALS[i]}</span>
                  : <span style={{ fontSize: 12, fontWeight: 700, color: "var(--c-t2)" }}>{i + 1}</span>
                }
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                background: `${entry.themeColor}14`, border: `1px solid ${entry.themeColor}25`,
              }}>
                {entry.avatarEmoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-t0)" }}>
                  {entry.name} {isMe && <span style={{ fontSize: 10, color: tabMeta.color }}>(あなた)</span>}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--c-t2)" }}>Lv.{entry.level}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <Icon size={13} color={tabMeta.color} />
                <span style={{ fontSize: 14, fontWeight: 800, color: tabMeta.color }}>
                  {tabMeta.key === "streak"
                    ? `${entry[tabMeta.key]}日`
                    : entry[tabMeta.key].toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
