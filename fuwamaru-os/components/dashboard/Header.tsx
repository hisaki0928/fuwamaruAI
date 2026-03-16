"use client";

import { Bell, Flame, Gem, Zap } from "lucide-react";
import type { User } from "@/lib/types";
import { ProgBar } from "@/components/ui/ProgBar";
import { CircleLevel } from "@/components/ui/CircleLevel";

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const xpPct = Math.round((user.xp / user.xpMax) * 100);

  return (
    <header
      style={{
        height: 66,
        background: "var(--c-bg1)",
        borderBottom: "1px solid var(--c-border)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 16,
        flexShrink: 0,
      }}
    >
      {/* Avatar + Level */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <CircleLevel level={user.level} xp={user.xp} xpMax={user.xpMax} size={44} />
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--c-t0)",
              lineHeight: 1.3,
            }}
          >
            {user.nickname}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--c-t2)", lineHeight: 1.3 }}>
            {user.title}
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div
        style={{
          flex: 1,
          maxWidth: 220,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Zap size={11} color="var(--c-xp)" />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--c-xp)" }}>
              XP
            </span>
          </div>
          <span style={{ fontSize: 10, color: "var(--c-t2)" }}>
            {user.xp.toLocaleString()} / {user.xpMax.toLocaleString()}
          </span>
        </div>
        <ProgBar
          value={user.xp}
          max={user.xpMax}
          color="var(--c-xp)"
          height={5}
        />
        <div style={{ fontSize: 9.5, color: "var(--c-t2)", textAlign: "right" }}>
          次のレベルまで {(user.xpMax - user.xp).toLocaleString()} XP
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* FP Chip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: "rgba(167,139,250,0.12)",
          border: "1px solid rgba(167,139,250,0.25)",
          borderRadius: 8,
          padding: "5px 10px",
          flexShrink: 0,
        }}
      >
        <Gem size={13} color="var(--c-fp)" />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-fp)" }}>
          {user.fp.toLocaleString()}
        </span>
        <span style={{ fontSize: 10, color: "var(--c-t2)" }}>FP</span>
      </div>

      {/* Streak Chip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: "rgba(245,158,11,0.12)",
          border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: 8,
          padding: "5px 10px",
          flexShrink: 0,
        }}
      >
        <Flame size={13} color="var(--c-xp)" />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-xp)" }}>
          {user.streak}
        </span>
        <span style={{ fontSize: 10, color: "var(--c-t2)" }}>日連続</span>
      </div>

      {/* Notification Bell */}
      <button
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          background: "var(--c-bg3)",
          border: "1px solid var(--c-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <Bell size={15} color="var(--c-t1)" />
        {/* Unread badge */}
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#ef4444",
            border: "1.5px solid var(--c-bg1)",
          }}
        />
      </button>
    </header>
  );
}
