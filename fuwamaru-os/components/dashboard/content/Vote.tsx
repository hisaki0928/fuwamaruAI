"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Plus, CheckCircle2, Clock, Archive, X, Send } from "lucide-react";
import type { ProposalStatus, Proposal } from "@/lib/types";
import { useStore } from "@/lib/store";

const STATUS_META: Record<ProposalStatus, { label: string; color: string; icon: React.ElementType }> = {
  open:        { label: "投票受付中", color: "var(--c-green)",  icon: Clock },
  closed:      { label: "投票終了",   color: "var(--c-t2)",     icon: Archive },
  implemented: { label: "実施済み",   color: "var(--c-blue)",   icon: CheckCircle2 },
};

function NewProposalModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("チーム");
  const [sent, setSent] = useState(false);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--c-bg1)", border: "1px solid var(--c-border)", borderRadius: 18,
        padding: "28px 24px", width: "100%", maxWidth: 440, boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "var(--c-t0)" }}>新しい提案を作成</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={16} color="var(--c-t2)" />
          </button>
        </div>
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle2 size={36} color="var(--c-green)" style={{ margin: "0 auto 10px" }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-t0)" }}>提案を送信しました！</div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); setTimeout(onClose, 1800); }}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--c-t2)", display: "block", marginBottom: 5 }}>タイトル</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required
                placeholder="提案のタイトルを入力" style={{
                  width: "100%", padding: "9px 12px", borderRadius: 9, fontSize: 13,
                  background: "var(--c-bg2)", border: "1px solid var(--c-border)", color: "var(--c-t0)", outline: "none", boxSizing: "border-box",
                }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--c-t2)", display: "block", marginBottom: 5 }}>カテゴリ</label>
              <select value={cat} onChange={(e) => setCat(e.target.value)} style={{
                width: "100%", padding: "9px 12px", borderRadius: 9, fontSize: 13,
                background: "var(--c-bg2)", border: "1px solid var(--c-border)", color: "var(--c-t0)", outline: "none",
              }}>
                {["チーム", "メニュー", "環境", "待遇", "その他"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--c-t2)", display: "block", marginBottom: 5 }}>詳細</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} required rows={3}
                placeholder="提案の背景や具体的な内容を書いてください" style={{
                  width: "100%", padding: "9px 12px", borderRadius: 9, fontSize: 13, resize: "none",
                  background: "var(--c-bg2)", border: "1px solid var(--c-border)", color: "var(--c-t0)", outline: "none",
                  fontFamily: "inherit", boxSizing: "border-box",
                }} />
            </div>
            <button type="submit" style={{
              padding: "11px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700,
              background: "var(--c-green)", color: "#fff", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Send size={14} /> 提案を送信
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function Vote() {
  const { proposals } = useStore();
  const [votes, setVotes] = useState<Record<string, "for" | "against">>({});
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<ProposalStatus | "ALL">("ALL");

  function handleVote(id: string, side: "for" | "against") {
    setVotes((prev) => ({ ...prev, [id]: prev[id] === side ? undefined as any : side }));
  }

  const filtered = proposals.filter((p) => filter === "ALL" || p.status === filter);

  return (
    <div style={{ padding: "24px", maxWidth: 720 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: "rgba(30,122,69,0.1)", border: "1px solid rgba(30,122,69,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ThumbsUp size={18} color="var(--c-green)" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--c-t0)" }}>投票・提案</h1>
            <p style={{ margin: 0, fontSize: 12, color: "var(--c-t2)" }}>みんなの意見でカフェをもっと良くしよう</p>
          </div>
        </div>
        <button onClick={() => setShowNew(true)} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "9px 14px",
          borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700,
          background: "var(--c-green)", color: "#fff", border: "none",
        }}>
          <Plus size={14} /> 提案する
        </button>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {(["ALL", "open", "implemented", "closed"] as const).map((s) => {
          const active = filter === s;
          const meta = s !== "ALL" ? STATUS_META[s] : null;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: active ? (meta ? `${meta.color}15` : "var(--c-xp)") : "var(--c-bg2)",
              color: active ? (meta?.color ?? "var(--c-t0)") : "var(--c-t1)",
              border: `1px solid ${active ? (meta?.color ?? "var(--c-xp)") + "40" : "var(--c-border)"}`,
            }}>
              {s === "ALL" ? "すべて" : STATUS_META[s].label}
            </button>
          );
        })}
      </div>

      {/* Proposal list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((p) => {
          const sm = STATUS_META[p.status];
          const SI = sm.icon;
          const totalVotes = p.votesFor + p.votesAgainst + (votes[p.id] ? 0 : 0);
          const forPct = totalVotes > 0 ? Math.round((p.votesFor / (p.votesFor + p.votesAgainst)) * 100) : 0;
          const myVote = votes[p.id];
          const isOpen = p.status === "open";

          return (
            <div key={p.id} style={{
              background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 14, padding: "18px",
            }}>
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                      background: `${sm.color}12`, color: sm.color,
                    }}>
                      <SI size={9} style={{ display: "inline", marginRight: 3 }} />
                      {sm.label}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                      background: "var(--c-bg3)", color: "var(--c-t2)",
                    }}>{p.category}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-t0)", marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "var(--c-t2)", lineHeight: 1.5, marginBottom: 8 }}>{p.description}</div>
                  <div style={{ fontSize: 10.5, color: "var(--c-t2)" }}>
                    {p.authorEmoji} {p.authorName} · {p.createdAt}
                  </div>
                </div>
              </div>

              {/* Vote bar */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--c-t2)", marginBottom: 4 }}>
                  <span style={{ color: "var(--c-green)", fontWeight: 600 }}>賛成 {p.votesFor}</span>
                  <span style={{ color: "var(--c-red)", fontWeight: 600 }}>反対 {p.votesAgainst}</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: "rgba(181,40,40,0.2)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${forPct}%`, background: "var(--c-green)", borderRadius: 3, transition: "width 0.3s" }} />
                </div>
              </div>

              {/* Vote buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => isOpen && handleVote(p.id, "for")}
                  disabled={!isOpen}
                  style={{
                    flex: 1, padding: "8px", borderRadius: 9, cursor: isOpen ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    fontSize: 12, fontWeight: 700, border: "none",
                    background: myVote === "for" ? "var(--c-green)" : "rgba(30,122,69,0.1)",
                    color: myVote === "for" ? "#fff" : "var(--c-green)",
                    transition: "all 0.15s",
                  }}
                >
                  <ThumbsUp size={13} /> 賛成
                </button>
                <button
                  onClick={() => isOpen && handleVote(p.id, "against")}
                  disabled={!isOpen}
                  style={{
                    flex: 1, padding: "8px", borderRadius: 9, cursor: isOpen ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    fontSize: 12, fontWeight: 700, border: "none",
                    background: myVote === "against" ? "var(--c-red)" : "rgba(181,40,40,0.1)",
                    color: myVote === "against" ? "#fff" : "var(--c-red)",
                    transition: "all 0.15s",
                  }}
                >
                  <ThumbsDown size={13} /> 反対
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showNew && <NewProposalModal onClose={() => setShowNew(false)} />}
    </div>
  );
}
