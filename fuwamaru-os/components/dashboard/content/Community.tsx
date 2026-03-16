"use client";

import { useState } from "react";
import { Users, Heart, Gift, Megaphone, Trophy, Plus, X, Send } from "lucide-react";
import type { PostType, User } from "@/lib/types";
import { MOCK_COMMUNITY_POSTS, REGISTERED_USERS } from "@/lib/mock-data";

const POST_META: Record<PostType, { icon: React.ElementType; color: string; label: string }> = {
  normal:      { icon: Users,    color: "var(--c-blue)",   label: "投稿" },
  bonus:       { icon: Gift,     color: "var(--c-fp)",     label: "ピアボーナス" },
  achievement: { icon: Trophy,   color: "var(--c-xp)",     label: "実績" },
  notice:      { icon: Megaphone,color: "var(--c-red)",    label: "お知らせ" },
};

function BonusModal({ currentUser, onClose }: { currentUser?: User; onClose: () => void }) {
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState(10);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const staffList = REGISTERED_USERS.filter((u) => u.id !== currentUser?.id);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!target || !message) return;
    setSent(true);
    setTimeout(onClose, 1800);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--c-bg1)", border: "1px solid var(--c-border)", borderRadius: 18,
        padding: "28px 24px", width: "100%", maxWidth: 380, boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Gift size={18} color="var(--c-fp)" />
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--c-t0)" }}>ピアボーナスを送る</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={16} color="var(--c-t2)" />
          </button>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-t0)" }}>送信しました！</div>
          </div>
        ) : (
          <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--c-t2)", display: "block", marginBottom: 5 }}>送り先</label>
              <select value={target} onChange={(e) => setTarget(e.target.value)} required style={{
                width: "100%", padding: "9px 12px", borderRadius: 9, fontSize: 13,
                background: "var(--c-bg2)", border: "1px solid var(--c-border)", color: "var(--c-t0)", outline: "none",
              }}>
                <option value="">選んでください</option>
                {staffList.map((u) => (
                  <option key={u.id} value={u.id}>{u.avatarEmoji} {u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--c-t2)", display: "block", marginBottom: 5 }}>
                FP 金額 (最大 50 FP)
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {[5, 10, 20, 30, 50].map((v) => (
                  <button type="button" key={v} onClick={() => setAmount(v)} style={{
                    flex: 1, padding: "7px 0", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
                    background: amount === v ? "var(--c-fp)" : "var(--c-bg2)",
                    color: amount === v ? "#fff" : "var(--c-t1)",
                    border: `1px solid ${amount === v ? "var(--c-fp)" : "var(--c-border)"}`,
                  }}>{v}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--c-t2)", display: "block", marginBottom: 5 }}>メッセージ</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={2}
                placeholder="ありがとう！いつも助かってます😊" style={{
                  width: "100%", padding: "9px 12px", borderRadius: 9, fontSize: 13, resize: "none",
                  background: "var(--c-bg2)", border: "1px solid var(--c-border)", color: "var(--c-t0)", outline: "none",
                  fontFamily: "inherit", boxSizing: "border-box",
                }} />
            </div>
            <button type="submit" style={{
              padding: "11px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700,
              background: "var(--c-fp)", color: "#fff", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Send size={14} /> {amount} FP 送る
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function Community({ user }: { user?: User }) {
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [showBonus, setShowBonus] = useState(false);

  function toggleLike(id: string) {
    setLiked((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <div style={{ padding: "24px", maxWidth: 680 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: "rgba(90,40,176,0.1)", border: "1px solid rgba(90,40,176,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Users size={18} color="var(--c-fp)" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--c-t0)" }}>コミュニティ</h1>
            <p style={{ margin: 0, fontSize: 12, color: "var(--c-t2)" }}>チームの声・お知らせ・ピアボーナス</p>
          </div>
        </div>
        <button onClick={() => setShowBonus(true)} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "9px 14px",
          borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700,
          background: "var(--c-fp)", color: "#fff", border: "none",
        }}>
          <Gift size={13} /> ボーナスを送る
        </button>
      </div>

      {/* Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {MOCK_COMMUNITY_POSTS.map((post) => {
          const pm = POST_META[post.type];
          const Icon = pm.icon;
          const isLiked = liked.has(post.id);

          return (
            <div key={post.id} style={{
              background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 14, padding: "16px",
            }}>
              {/* Post type badge */}
              {post.type !== "normal" && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px",
                  borderRadius: 6, fontSize: 10.5, fontWeight: 700, marginBottom: 10,
                  color: pm.color, background: `${pm.color}15`, border: `1px solid ${pm.color}30`,
                }}>
                  <Icon size={10} /> {pm.label}
                  {post.type === "bonus" && post.bonusAmount && (
                    <span style={{ marginLeft: 2 }}>+{post.bonusAmount} FP → {post.targetName}</span>
                  )}
                </div>
              )}

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, fontSize: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--c-bg3)",
                }}>
                  {post.authorEmoji}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-t0)" }}>{post.authorName}</div>
                  <div style={{ fontSize: 10.5, color: "var(--c-t2)" }}>{post.time}</div>
                </div>
              </div>

              {/* Content */}
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--c-t0)", lineHeight: 1.6 }}>
                {post.content}
              </p>

              {/* Like */}
              <button onClick={() => toggleLike(post.id)} style={{
                display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
                cursor: "pointer", fontSize: 12, color: isLiked ? "var(--c-red)" : "var(--c-t2)",
                fontWeight: isLiked ? 600 : 400,
              }}>
                <Heart size={13} fill={isLiked ? "var(--c-red)" : "none"} />
                {post.likes + (isLiked ? 1 : 0)}
              </button>
            </div>
          );
        })}
      </div>

      {showBonus && <BonusModal currentUser={user} onClose={() => setShowBonus(false)} />}
    </div>
  );
}
