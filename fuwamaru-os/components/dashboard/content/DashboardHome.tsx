"use client";

import { Zap, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import type { User } from "@/lib/types";
import { MOCK_STATS, MOCK_ACTIVITY } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { MissionCard } from "@/components/ui/MissionCard";
import { CircleLevel } from "@/components/ui/CircleLevel";

interface DashboardHomeProps {
  user: User;
}

export function DashboardHome({ user }: DashboardHomeProps) {
  const { missions } = useStore();
  const completedMissions = missions.filter((m) => m.progress >= m.total).length;
  const totalMissions = missions.length;

  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        maxWidth: 960,
      }}
    >
      {/* Greeting Banner */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(167,139,250,0.08) 100%)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 14,
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--c-t0)", marginBottom: 4 }}>
            おはよう、{user.nickname}！ ☕
          </div>
          <div style={{ fontSize: 13, color: "var(--c-t1)" }}>
            今日も最高のコーヒーを届けよう。{" "}
            <span style={{ color: "var(--c-xp)", fontWeight: 600 }}>
              {completedMissions}/{totalMissions}
            </span>{" "}
            ミッション完了中
          </div>
        </div>
        <CircleLevel level={user.level} xp={user.xp} xpMax={user.xpMax} size={70} />
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        {MOCK_STATS.map((stat, i) => (
          <div
            key={i}
            style={{
              background: "var(--c-bg2)",
              border: "1px solid var(--c-border)",
              borderRadius: 12,
              padding: "16px 18px",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--c-t2)", marginBottom: 6, fontWeight: 600, letterSpacing: 0.5 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--c-t0)", marginBottom: 4 }}>
              {stat.value}
            </div>
            <div
              style={{
                fontSize: 11,
                color:
                  stat.trend === "up"
                    ? "#34d399"
                    : stat.trend === "down"
                    ? "#f87171"
                    : "var(--c-t2)",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              {stat.trend === "up" ? (
                <TrendingUp size={11} />
              ) : stat.trend === "down" ? (
                <TrendingDown size={11} />
              ) : (
                <Minus size={11} />
              )}
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        {/* Missions */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 800,
                color: "var(--c-t0)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Zap size={14} color="var(--c-xp)" />
              デイリーミッション
            </h2>
            <span style={{ fontSize: 11, color: "var(--c-t2)" }}>
              {completedMissions}/{totalMissions} 完了
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              fontWeight: 800,
              color: "var(--c-t0)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Activity size={14} color="var(--c-t1)" />
            最近の活動
          </h2>
          <div
            style={{
              background: "var(--c-bg2)",
              border: "1px solid var(--c-border)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {MOCK_ACTIVITY.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 14px",
                  borderBottom:
                    i < MOCK_ACTIVITY.length - 1 ? "1px solid var(--c-border)" : "none",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: item.color,
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "var(--c-t0)", lineHeight: 1.5 }}>
                    {item.text}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--c-t2)", marginTop: 2 }}>
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
