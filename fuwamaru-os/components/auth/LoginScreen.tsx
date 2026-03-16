"use client";

import { useState } from "react";
import { Crown, Shield, Zap, Lock, Eye, EyeOff, X, AlertCircle } from "lucide-react";
import type { User } from "@/lib/types";
import { REGISTERED_USERS } from "@/lib/mock-data";

interface LoginScreenProps {
  onLogin: (userId: string) => void;
}

const ROLE_META = {
  owner:   { label: "オーナー",     badge: "Super Admin",    icon: Crown,  color: "#f59e0b" },
  manager: { label: "マネージャー", badge: "Store Manager",  icon: Shield, color: "#60a5fa" },
  staff:   { label: "スタッフ",     badge: "Staff",          icon: Zap,    color: "#a78bfa" },
} as const;

// ─── パスワードモーダル ───────────────────────────────────
function PasswordModal({
  user,
  onSuccess,
  onClose,
}: {
  user: User;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const meta = ROLE_META[user.role];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === user.password) {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setPw("");
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--c-bg2)",
          border: `1px solid ${error ? "#f8717140" : "var(--c-border)"}`,
          borderRadius: 20,
          padding: "32px 28px",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          animation: shake ? "shake 0.4s ease" : undefined,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              background: `${meta.color}14`, border: `1px solid ${meta.color}30`,
            }}
          >
            {user.avatarEmoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--c-t0)" }}>{user.name}</div>
            <div style={{ fontSize: 11, color: meta.color, fontWeight: 600 }}>{meta.label}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8, cursor: "pointer",
              background: "var(--c-bg3)", border: "1px solid var(--c-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={14} color="var(--c-t2)" />
          </button>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Lock size={13} color="var(--c-t2)" />
            <span style={{ fontSize: 12, color: "var(--c-t1)", fontWeight: 600 }}>パスワード</span>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ position: "relative" }}>
              <input
                type={show ? "text" : "password"}
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(false); }}
                placeholder="パスワードを入力"
                autoFocus
                style={{
                  width: "100%", padding: "11px 44px 11px 14px",
                  borderRadius: 10, fontSize: 14,
                  background: "var(--c-bg3)",
                  border: `1px solid ${error ? "#f87171" : "var(--c-border)"}`,
                  color: "var(--c-t0)", outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  display: "flex", alignItems: "center",
                }}
              >
                {show ? <EyeOff size={15} color="var(--c-t2)" /> : <Eye size={15} color="var(--c-t2)" />}
              </button>
            </div>

            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                marginTop: 8, fontSize: 12, color: "#f87171",
              }}>
                <AlertCircle size={12} />
                パスワードが正しくありません
              </div>
            )}

            <button
              type="submit"
              style={{
                marginTop: 16, width: "100%", padding: "12px",
                borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700,
                background: meta.color, color: "#000",
                border: "none", transition: "opacity 0.15s",
              }}
            >
              ログイン
            </button>
          </form>
        </div>

        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`}</style>
      </div>
    </div>
  );
}

// ─── ユーザーカード ──────────────────────────────────────
function UserCard({
  user,
  onClick,
}: {
  user: User;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const meta = ROLE_META[user.role];
  const isAdmin = user.role !== "staff";
  const xpPct = Math.round((user.xp / user.xpMax) * 100);

  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 16px", borderRadius: 14, cursor: "pointer",
        textAlign: "left", width: "100%",
        background: hov ? `linear-gradient(135deg, ${meta.color}10, var(--c-bg3))` : "var(--c-bg2)",
        border: `1px solid ${hov ? meta.color + "44" : "var(--c-border)"}`,
        boxShadow: hov ? `0 0 20px ${meta.color}14, 0 4px 16px rgba(0,0,0,0.3)` : "none",
        transform: hov ? "translateY(-2px)" : "none",
        transition: "all 0.18s ease",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, background: `${meta.color}14`,
          border: `1px solid ${hov ? meta.color + "40" : meta.color + "20"}`,
          boxShadow: hov ? `0 0 14px ${meta.color}25` : "none",
          transition: "all 0.18s",
        }}
      >
        {user.avatarEmoji ?? user.nickname[0]}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-t0)" }}>{user.name}</span>
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, padding: "1px 5px",
            borderRadius: 4, background: `${meta.color}18`,
            color: meta.color, border: `1px solid ${meta.color}30`,
          }}>
            Lv.{user.level}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "var(--c-t2)", marginBottom: 4 }}>{user.title}</div>
        {/* Mini XP bar */}
        <div style={{ height: 3, borderRadius: 2, background: "var(--c-bg3)", overflow: "hidden", width: 80 }}>
          <div style={{ height: "100%", width: `${xpPct}%`, background: meta.color, borderRadius: 2 }} />
        </div>
      </div>

      {/* Right: lock or arrow */}
      {isAdmin ? (
        <Lock size={14} color={hov ? meta.color : "var(--c-t2)"} style={{ flexShrink: 0, transition: "color 0.18s" }} />
      ) : (
        <div style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          background: hov ? meta.color : "var(--c-bg3)",
          border: `1px solid ${hov ? meta.color : "var(--c-border)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.18s",
        }}>
          <span style={{ fontSize: 10, color: hov ? "#000" : "var(--c-t2)" }}>→</span>
        </div>
      )}
    </button>
  );
}

// ─── メイン LoginScreen ───────────────────────────────────
export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [pwTarget, setPwTarget] = useState<User | null>(null);

  const admins = REGISTERED_USERS.filter((u) => u.role !== "staff");
  const staffs = REGISTERED_USERS.filter((u) => u.role === "staff");

  function handleCardClick(user: User) {
    if (user.role === "staff") {
      onLogin(user.id);
    } else {
      setPwTarget(user);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 20px", background: "var(--c-bg0)",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 45% at 50% -5%, rgba(245,158,11,0.08) 0%, transparent 65%)" }} />
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 50% 30% at 85% 85%, rgba(96,165,250,0.05) 0%, transparent 60%)" }} />

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 36, position: "relative", zIndex: 1 }}>
        <div style={{
          display: "inline-flex", width: 64, height: 64, borderRadius: 20, marginBottom: 14,
          background: "linear-gradient(135deg, var(--c-xp), #d97706)",
          alignItems: "center", justifyContent: "center", fontSize: 30,
          boxShadow: "0 0 40px rgba(245,158,11,0.35), 0 8px 24px rgba(0,0,0,0.5)",
        }}>
          ☕
        </div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "var(--c-t0)", letterSpacing: -0.8 }}>
          Fuwamaru <span style={{ color: "var(--c-xp)" }}>OS</span>
        </h1>
        <p style={{ marginTop: 6, fontSize: 12.5, color: "var(--c-t1)" }}>
          ゲーミフィケーション特化型 カフェ OS &nbsp;·&nbsp; v2.0
        </p>
      </div>

      {/* User list */}
      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        <p style={{
          textAlign: "center", fontSize: 10.5, color: "var(--c-t2)",
          letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 20,
        }}>
          — ログインするユーザーを選択 —
        </p>

        {/* 管理者 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 7, marginBottom: 10,
            fontSize: 10.5, fontWeight: 700, color: "var(--c-t2)",
            letterSpacing: 1, textTransform: "uppercase",
          }}>
            <Lock size={10} color="var(--c-t2)" />
            管理者 — パスワード必須
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {admins.map((u) => (
              <UserCard key={u.id} user={u} onClick={() => handleCardClick(u)} />
            ))}
          </div>
        </div>

        {/* スタッフ */}
        <div>
          <div style={{
            display: "flex", alignItems: "center", gap: 7, marginBottom: 10,
            fontSize: 10.5, fontWeight: 700, color: "var(--c-t2)",
            letterSpacing: 1, textTransform: "uppercase",
          }}>
            <Zap size={10} color="var(--c-t2)" />
            スタッフ
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {staffs.map((u) => (
              <UserCard key={u.id} user={u} onClick={() => handleCardClick(u)} />
            ))}
          </div>
        </div>
      </div>

      <p style={{ marginTop: 32, fontSize: 11, color: "var(--c-t2)", zIndex: 1, position: "relative" }}>
        © 2025 Fuwamaru Cafe &nbsp;·&nbsp; All rights reserved
      </p>

      {/* Password Modal */}
      {pwTarget && (
        <PasswordModal
          user={pwTarget}
          onSuccess={() => { onLogin(pwTarget.id); setPwTarget(null); }}
          onClose={() => setPwTarget(null)}
        />
      )}
    </div>
  );
}
