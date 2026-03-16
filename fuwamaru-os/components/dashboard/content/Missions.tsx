"use client";

import { useState } from "react";
import { Trophy, CheckCircle2, Zap, Gem } from "lucide-react";
import type { MissionType } from "@/lib/types";
import { useStore } from "@/lib/store";
import { MissionCard } from "@/components/ui/MissionCard";

const TABS: { id: MissionType | "ALL"; label: string }[] = [
  { id: "ALL",     label: "すべて" },
  { id: "DAILY",   label: "デイリー" },
  { id: "WEEKLY",  label: "ウィークリー" },
  { id: "SPECIAL", label: "スペシャル" },
];

export function Missions() {
  const { missions } = useStore();
  const [tab, setTab] = useState<MissionType | "ALL">("ALL");

  const filtered = tab === "ALL" ? missions : missions.filter((m) => m.type === tab);
  const completed = missions.filter((m) => m.progress >= m.total).length;
  const totalXP = missions.reduce((s, m) => s + m.xpReward, 0);
  const totalFP  = missions.reduce((s, m) => s + m.fpReward, 0);

  return (
    <div style={{ padding: "24px", maxWidth: 760 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11, background: "rgba(245,158,11,0.12)",
          border: "1px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Trophy size={18} color="var(--c-xp)" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--c-t0)" }}>ミッション</h1>
          <p style={{ margin: 0, fontSize: 12, color: "var(--c-t2)" }}>
            {completed}/{missions.length} 完了 &nbsp;·&nbsp; 報酬合計: +{totalXP} XP / +{totalFP} FP
          </p>
        </div>
      </div>

      {/* 達成状況バー */}
      <div style={{
        background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 14,
        padding: "16px 20px", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 20,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--c-t1)", fontWeight: 600 }}>今日の達成率</span>
            <span style={{ fontSize: 12, color: "var(--c-xp)", fontWeight: 700 }}>
              {Math.round((completed / missions.length) * 100)}%
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "var(--c-bg3)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3, transition: "width 0.6s ease",
              width: `${(completed / missions.length) * 100}%`,
              background: "linear-gradient(90deg, var(--c-xp), #f97316)",
            }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--c-xp)" }}>{completed}</div>
            <div style={{ fontSize: 10, color: "var(--c-t2)" }}>完了</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--c-t1)" }}>{missions.length - completed}</div>
            <div style={{ fontSize: 10, color: "var(--c-t2)" }}>残り</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {TABS.map((t) => {
          const count = t.id === "ALL" ? missions.length : missions.filter((m) => m.type === t.id).length;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: active ? "var(--c-xp)" : "var(--c-bg2)",
                color: active ? "#000" : "var(--c-t1)",
                border: `1px solid ${active ? "var(--c-xp)" : "var(--c-border)"}`,
                transition: "all 0.15s",
              }}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Mission list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((m) => (
          <div key={m.id} style={{ position: "relative" }}>
            <MissionCard mission={m} />
            {m.progress >= m.total && (
              <div style={{
                position: "absolute", top: 12, right: 14,
                display: "flex", alignItems: "center", gap: 4,
                background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)",
                borderRadius: 6, padding: "3px 8px",
              }}>
                <CheckCircle2 size={11} color="#34d399" />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#34d399" }}>クリア済み</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
