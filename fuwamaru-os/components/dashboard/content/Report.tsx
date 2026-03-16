"use client";

import { useState } from "react";
import { FileText, Send, Zap, Star, TrendingUp, Users, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import type { DailyReport, ReportScore } from "@/lib/types";
import { MOCK_REPORTS } from "@/lib/mock-data";

function ScoreBar({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Icon size={12} color={color} />
          <span style={{ fontSize: 12, color: "var(--c-t1)", fontWeight: 600 }}>{label}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{value}</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: "var(--c-bg3)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 3, width: `${value}%`,
          background: color, transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

function ScoreCard({ score, xp }: { score: ReportScore; xp?: number }) {
  const totalColor = score.total >= 90 ? "#34d399" : score.total >= 75 ? "var(--c-xp)" : "#60a5fa";
  return (
    <div style={{
      background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 14, padding: "20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--c-t1)" }}>AI 評価結果</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {xp && (
            <div style={{
              display: "flex", alignItems: "center", gap: 4, padding: "3px 8px",
              background: "rgba(245,158,11,0.12)", borderRadius: 6,
              border: "1px solid rgba(245,158,11,0.25)",
            }}>
              <Zap size={11} color="var(--c-xp)" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--c-xp)" }}>+{xp} XP</span>
            </div>
          )}
          <div style={{
            fontSize: 28, fontWeight: 900, color: totalColor,
            textShadow: `0 0 20px ${totalColor}60`,
          }}>
            {score.total}
            <span style={{ fontSize: 14, color: "var(--c-t2)", fontWeight: 400 }}> 点</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <ScoreBar label="接客力"    value={score.customer} icon={Star}       color="#f59e0b" />
        <ScoreBar label="提案力"    value={score.proposal} icon={Lightbulb}  color="#a78bfa" />
        <ScoreBar label="チームワーク" value={score.teamwork} icon={Users}   color="#60a5fa" />
        <ScoreBar label="成長意欲"  value={score.growth}   icon={TrendingUp} color="#34d399" />
      </div>
    </div>
  );
}

function ReportHistoryItem({ report }: { report: DailyReport }) {
  const [open, setOpen] = useState(false);
  const totalColor = report.score
    ? report.score.total >= 90 ? "#34d399" : report.score.total >= 75 ? "var(--c-xp)" : "#60a5fa"
    : "var(--c-t2)";

  return (
    <div style={{
      background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 12, overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
          background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-t0)" }}>{report.date}</div>
          <div style={{ fontSize: 11, color: "var(--c-t2)", marginTop: 2 }}>
            {report.submittedAt?.split("T")[1]?.slice(0, 5)} 提出
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {report.score && (
          <span style={{ fontSize: 18, fontWeight: 800, color: totalColor }}>{report.score.total}点</span>
        )}
        {report.xpEarned && (
          <span style={{ fontSize: 11, color: "var(--c-xp)", fontWeight: 600 }}>+{report.xpEarned} XP</span>
        )}
        {open ? <ChevronUp size={14} color="var(--c-t2)" /> : <ChevronDown size={14} color="var(--c-t2)" />}
      </button>

      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--c-border)" }}>
          <p style={{ fontSize: 13, color: "var(--c-t1)", lineHeight: 1.7, marginTop: 14, marginBottom: 14 }}>
            {report.content}
          </p>
          {report.score && <ScoreCard score={report.score} />}
        </div>
      )}
    </div>
  );
}

export function Report() {
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mockScore] = useState<ReportScore>({ customer: 88, proposal: 75, teamwork: 92, growth: 87, total: 86 });

  const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
  const alreadySubmitted = MOCK_REPORTS.some((r) => r.date === "2025-03-12");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (content.trim().length < 20) return;
    setSubmitted(true);
  }

  return (
    <div style={{ padding: "24px", maxWidth: 720 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11, background: "rgba(52,211,153,0.12)",
          border: "1px solid rgba(52,211,153,0.25)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <FileText size={18} color="#34d399" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--c-t0)" }}>日報 AI 評価</h1>
          <p style={{ margin: 0, fontSize: 12, color: "var(--c-t2)" }}>今日の振り返りを記録してAIが採点</p>
        </div>
      </div>

      {/* 今日の日報 */}
      <div style={{
        background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 16, padding: "20px", marginBottom: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-t0)" }}>今日の日報 — {today}</span>
          {alreadySubmitted && (
            <span style={{
              fontSize: 10.5, fontWeight: 700, color: "#34d399", padding: "3px 8px",
              background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 6,
            }}>提出済み</span>
          )}
        </div>

        {!submitted && !alreadySubmitted ? (
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"今日の業務を振り返って記録しよう。\n\n例）接客で意識したこと、改善できた点、明日への目標など..."}
              rows={6}
              style={{
                width: "100%", padding: "14px", borderRadius: 10, fontSize: 13, lineHeight: 1.7,
                background: "var(--c-bg3)", border: "1px solid var(--c-border)",
                color: "var(--c-t0)", resize: "vertical", outline: "none", boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
              <span style={{ fontSize: 11, color: content.length < 20 ? "var(--c-t2)" : "#34d399" }}>
                {content.length} 文字 {content.length < 20 ? `(最低20文字)` : "✓"}
              </span>
              <button
                type="submit"
                disabled={content.trim().length < 20}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
                  borderRadius: 9, cursor: content.trim().length < 20 ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: 700, border: "none",
                  background: content.trim().length >= 20 ? "#34d399" : "var(--c-bg3)",
                  color: content.trim().length >= 20 ? "#000" : "var(--c-t2)",
                  transition: "all 0.15s",
                }}
              >
                <Send size={13} />
                AI 評価を受ける
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p style={{ fontSize: 13, color: "var(--c-t1)", lineHeight: 1.7, marginBottom: 16 }}>
              {submitted ? content : MOCK_REPORTS[0].content}
            </p>
            <ScoreCard score={submitted ? mockScore : MOCK_REPORTS[0].score!} xp={submitted ? 52 : MOCK_REPORTS[0].xpEarned} />
          </div>
        )}
      </div>

      {/* 履歴 */}
      <div>
        <h2 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "var(--c-t0)" }}>提出履歴</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MOCK_REPORTS.map((r) => <ReportHistoryItem key={r.id} report={r} />)}
        </div>
      </div>
    </div>
  );
}
