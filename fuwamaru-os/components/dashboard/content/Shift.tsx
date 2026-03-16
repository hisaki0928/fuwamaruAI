"use client";

import { useState } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { MOCK_SHIFTS } from "@/lib/mock-data";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const STATUS_META = {
  confirmed: { label: "確定", color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  pending:   { label: "申請中", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  off:       { label: "休み", color: "var(--c-t2)", bg: "var(--c-bg3)" },
} as const;

export function Shift() {
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(3);

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const shiftMap = Object.fromEntries(MOCK_SHIFTS.map((s) => [s.date, s]));

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const totalWork = MOCK_SHIFTS.filter((s) => s.status !== "off" && s.date.startsWith(`${year}-${String(month).padStart(2, "0")}`)).length;
  const totalHours = totalWork * 7.5;

  return (
    <div style={{ padding: "24px", maxWidth: 760 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11, background: "rgba(96,165,250,0.12)",
          border: "1px solid rgba(96,165,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Calendar size={18} color="var(--c-blue)" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--c-t0)" }}>シフト管理</h1>
          <p style={{ margin: 0, fontSize: 12, color: "var(--c-t2)" }}>
            今月の勤務: {totalWork}日 / 約{totalHours}時間
          </p>
        </div>
      </div>

      {/* Month navigator */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 12,
        padding: "12px 16px", marginBottom: 16,
      }}>
        <button onClick={prevMonth} style={{
          width: 32, height: 32, borderRadius: 8, background: "var(--c-bg3)", border: "1px solid var(--c-border)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <ChevronLeft size={15} color="var(--c-t1)" />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--c-t0)" }}>
          {year}年 {month}月
        </span>
        <button onClick={nextMonth} style={{
          width: 32, height: 32, borderRadius: 8, background: "var(--c-bg3)", border: "1px solid var(--c-border)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <ChevronRight size={15} color="var(--c-t1)" />
        </button>
      </div>

      {/* Calendar */}
      <div style={{ background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 14, overflow: "hidden" }}>
        {/* Weekday headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {WEEKDAYS.map((d, i) => (
            <div key={d} style={{
              padding: "10px 4px", textAlign: "center", fontSize: 11, fontWeight: 700,
              color: i === 0 ? "#f87171" : i === 6 ? "#60a5fa" : "var(--c-t2)",
              borderBottom: "1px solid var(--c-border)",
            }}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} style={{ minHeight: 72, borderBottom: "1px solid var(--c-border)", borderRight: idx % 7 !== 6 ? "1px solid var(--c-border)" : "none" }} />;

            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const shift = shiftMap[dateStr];
            const dayOfWeek = (firstDay + day - 1) % 7;
            const isToday = dateStr === "2025-03-12";

            return (
              <div
                key={day}
                style={{
                  minHeight: 72, padding: "8px 6px",
                  borderBottom: "1px solid var(--c-border)",
                  borderRight: (firstDay + day - 1) % 7 !== 6 ? "1px solid var(--c-border)" : "none",
                  background: isToday ? "rgba(245,158,11,0.05)" : "transparent",
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 6, marginBottom: 4,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isToday ? "var(--c-xp)" : "transparent",
                  fontSize: 12, fontWeight: isToday ? 800 : 500,
                  color: isToday ? "#000" : dayOfWeek === 0 ? "#f87171" : dayOfWeek === 6 ? "#60a5fa" : "var(--c-t1)",
                }}>{day}</div>

                {shift && (
                  <div style={{
                    borderRadius: 5, padding: "3px 5px",
                    background: STATUS_META[shift.status].bg,
                    fontSize: 9.5, lineHeight: 1.4,
                  }}>
                    <div style={{ fontWeight: 700, color: STATUS_META[shift.status].color }}>
                      {STATUS_META[shift.status].label}
                    </div>
                    {shift.start && (
                      <div style={{ color: "var(--c-t2)" }}>{shift.start}〜{shift.end}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: meta.bg, border: `1px solid ${meta.color}40` }} />
            <span style={{ fontSize: 11, color: "var(--c-t2)" }}>{meta.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
