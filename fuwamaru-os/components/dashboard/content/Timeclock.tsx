"use client";

import { useState } from "react";
import { Clock, LogIn, LogOut, Coffee } from "lucide-react";
import { MOCK_TIME_RECORDS } from "@/lib/mock-data";

function formatMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}時間${m > 0 ? m + "分" : ""}`;
}

export function Timeclock() {
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);

  const now = new Date();
  const nowStr = now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });

  const monthMinutes = MOCK_TIME_RECORDS.reduce((s, r) => s + (r.totalMinutes ?? 0), 0);
  const weekMinutes = MOCK_TIME_RECORDS.slice(0, 3).reduce((s, r) => s + (r.totalMinutes ?? 0), 0);

  function handleClockIn() {
    setClockedIn(true);
    setClockInTime(nowStr);
  }
  function handleClockOut() {
    setClockedIn(false);
    setClockInTime(null);
  }

  return (
    <div style={{ padding: "24px", maxWidth: 640 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11, background: "rgba(96,165,250,0.12)",
          border: "1px solid rgba(96,165,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Clock size={18} color="var(--c-blue)" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--c-t0)" }}>タイムカード</h1>
          <p style={{ margin: 0, fontSize: 12, color: "var(--c-t2)" }}>出勤・退勤の打刻</p>
        </div>
      </div>

      {/* Clock panel */}
      <div style={{
        background: clockedIn ? "rgba(52,211,153,0.05)" : "var(--c-bg2)",
        border: `1px solid ${clockedIn ? "rgba(52,211,153,0.25)" : "var(--c-border)"}`,
        borderRadius: 20, padding: "32px 24px", marginBottom: 24, textAlign: "center",
      }}>
        <div style={{ fontSize: 11, color: "var(--c-t2)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
          現在時刻
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, color: "var(--c-t0)", letterSpacing: -1, marginBottom: 6 }}>
          {nowStr}
        </div>
        <div style={{ fontSize: 13, color: "var(--c-t2)", marginBottom: 28 }}>
          2025年3月12日（水）
        </div>

        {clockedIn ? (
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px",
              background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)",
              borderRadius: 8, marginBottom: 20, fontSize: 12, color: "#34d399", fontWeight: 600,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", animation: "pulse 1.5s infinite" }} />
              出勤中 — {clockInTime} から
            </div>
            <div>
              <button
                onClick={handleClockOut}
                style={{
                  width: "100%", maxWidth: 280, padding: "14px", borderRadius: 12,
                  fontSize: 15, fontWeight: 800, cursor: "pointer", border: "none",
                  background: "#f87171", color: "#fff", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8, margin: "0 auto",
                }}
              >
                <LogOut size={18} /> 退勤する
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleClockIn}
            style={{
              width: "100%", maxWidth: 280, padding: "14px", borderRadius: 12,
              fontSize: 15, fontWeight: 800, cursor: "pointer", border: "none",
              background: "#34d399", color: "#000", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8, margin: "0 auto",
            }}
          >
            <LogIn size={18} /> 出勤する
          </button>
        )}
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "今週の勤務時間", value: formatMinutes(weekMinutes), icon: Coffee, color: "var(--c-xp)" },
          { label: "今月の勤務時間", value: formatMinutes(monthMinutes), icon: Clock, color: "var(--c-blue)" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 12, padding: "16px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <s.icon size={20} color={s.color} />
            <div>
              <div style={{ fontSize: 10.5, color: "var(--c-t2)", marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--c-t0)" }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* History */}
      <h2 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "var(--c-t0)" }}>打刻履歴</h2>
      <div style={{ background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", padding: "10px 16px",
          borderBottom: "1px solid var(--c-border)", fontSize: 11, fontWeight: 700, color: "var(--c-t2)" }}>
          <span>日付</span><span>出勤</span><span>退勤</span><span>実働</span>
        </div>
        {MOCK_TIME_RECORDS.map((r, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
            padding: "11px 16px", borderBottom: i < MOCK_TIME_RECORDS.length - 1 ? "1px solid var(--c-border)" : "none",
            fontSize: 12,
          }}>
            <span style={{ color: "var(--c-t0)", fontWeight: 600 }}>{r.date.slice(5)}</span>
            <span style={{ color: "#34d399" }}>{r.clockIn}</span>
            <span style={{ color: "#f87171" }}>{r.clockOut ?? "—"}</span>
            <span style={{ color: "var(--c-t1)", fontWeight: 600 }}>
              {r.totalMinutes ? formatMinutes(r.totalMinutes) : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
