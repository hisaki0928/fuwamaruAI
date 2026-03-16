"use client";

import { useState } from "react";
import {
  User, Monitor, Coins, Bot, Webhook, ScrollText, ShieldAlert,
  Save, Eye, EyeOff, RefreshCw, Trash2, Plus, Check,
} from "lucide-react";
import type { User as UserType } from "@/lib/types";

interface SettingsProps { user: UserType; }

type SectionId = "profile" | "display" | "economy" | "ai" | "webhooks" | "audit" | "account";

const SECTIONS: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: "profile",  label: "プロフィール",   icon: User },
  { id: "display",  label: "表示設定",       icon: Monitor },
  { id: "economy",  label: "経済圏設定",     icon: Coins },
  { id: "ai",       label: "AI チューニング", icon: Bot },
  { id: "webhooks", label: "Webhook",        icon: Webhook },
  { id: "audit",    label: "監査ログ",       icon: ScrollText },
  { id: "account",  label: "アカウント",      icon: ShieldAlert },
];

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--c-border)" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-t0)" }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: "var(--c-t2)", marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
      background: value ? "var(--c-xp)" : "var(--c-bg3)",
      position: "relative", transition: "background 0.2s",
    }}>
      <div style={{
        position: "absolute", top: 3, left: value ? 21 : 3, width: 18, height: 18,
        borderRadius: "50%", background: "#fff", transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{
      padding: "7px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
      background: "var(--c-bg2)", border: "1px solid var(--c-border)", color: "var(--c-t0)", outline: "none",
    }}>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function SaveBtn() {
  const [saved, setSaved] = useState(false);
  return (
    <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} style={{
      display: "flex", alignItems: "center", gap: 6, padding: "9px 18px",
      borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700, border: "none",
      background: saved ? "var(--c-green)" : "var(--c-xp)",
      color: "#fff", transition: "background 0.2s",
    }}>
      {saved ? <Check size={14} /> : <Save size={14} />}
      {saved ? "保存しました" : "保存する"}
    </button>
  );
}

// ──── Sections ───────────────────────────────────────────────
function ProfileSection({ user }: { user: UserType }) {
  const [name, setName] = useState(user.name);
  const [nick, setNick] = useState(user.nickname);
  const [title, setTitle] = useState(user.title);
  const [emoji, setEmoji] = useState(user.avatarEmoji ?? "⚡");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, padding: "16px", background: "var(--c-bg2)", borderRadius: 12 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 16, fontSize: 30,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `${user.themeColor}12`, border: `1px solid ${user.themeColor}30`,
        }}>{emoji}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--c-t0)" }}>{name}</div>
          <div style={{ fontSize: 12, color: "var(--c-t2)" }}>Lv.{user.level} · {user.title}</div>
        </div>
      </div>
      {[
        { label: "表示名",     val: name,  set: setName },
        { label: "ニックネーム", val: nick,  set: setNick },
        { label: "肩書き",     val: title, set: setTitle },
      ].map(({ label, val, set }) => (
        <Row key={label} label={label}>
          <input value={val} onChange={(e) => set(e.target.value)} style={{
            padding: "7px 10px", borderRadius: 8, fontSize: 12, width: 180,
            background: "var(--c-bg2)", border: "1px solid var(--c-border)", color: "var(--c-t0)", outline: "none",
          }} />
        </Row>
      ))}
      <Row label="アバター絵文字" sub="プロフィールに表示される絵文字">
        <div style={{ display: "flex", gap: 6 }}>
          {["⚡","🌸","🍃","🔥","☕","🌟","🎯","🎨"].map((e) => (
            <button key={e} onClick={() => setEmoji(e)} style={{
              width: 32, height: 32, borderRadius: 8, border: `2px solid ${emoji === e ? "var(--c-xp)" : "var(--c-border)"}`,
              background: emoji === e ? "rgba(181,100,10,0.1)" : "var(--c-bg2)",
              cursor: "pointer", fontSize: 16,
            }}>{e}</button>
          ))}
        </div>
      </Row>
      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn />
      </div>
    </div>
  );
}

function DisplaySection() {
  const [lang, setLang] = useState("日本語");
  const [tz, setTz] = useState("Asia/Tokyo");
  const [compact, setCompact] = useState(false);
  const [anim, setAnim] = useState(true);
  const [sound, setSound] = useState(false);

  return (
    <div>
      <Row label="言語" sub="UIの表示言語">
        <Select value={lang} options={["日本語", "English"]} onChange={setLang} />
      </Row>
      <Row label="タイムゾーン" sub="シフト・タイムカードの基準">
        <Select value={tz} options={["Asia/Tokyo", "Asia/Seoul", "UTC"]} onChange={setTz} />
      </Row>
      <Row label="コンパクトモード" sub="サイドバーとカードをよりコンパクトに表示">
        <Toggle value={compact} onChange={setCompact} />
      </Row>
      <Row label="アニメーション" sub="XP獲得などのアニメーション効果">
        <Toggle value={anim} onChange={setAnim} />
      </Row>
      <Row label="通知サウンド" sub="バッジ獲得時にサウンドを再生">
        <Toggle value={sound} onChange={setSound} />
      </Row>
      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn />
      </div>
    </div>
  );
}

function EconomySection() {
  const [bonusCap, setBonusCap] = useState(50);
  const [dailyXP, setDailyXP] = useState(200);
  const [reportXP, setReportXP] = useState(30);
  const [autoReset, setAutoReset] = useState(true);

  return (
    <div>
      <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(181,100,10,0.08)", border: "1px solid rgba(181,100,10,0.2)", marginBottom: 20, fontSize: 12, color: "var(--c-xp)" }}>
        ⚠ 経済圏の設定変更はオーナー権限が必要です
      </div>
      {[
        { label: "ピアボーナス上限 (FP/日)", val: bonusCap, set: setBonusCap, min: 10, max: 200, step: 5 },
        { label: "デイリー最大獲得XP", val: dailyXP, set: setDailyXP, min: 50, max: 500, step: 10 },
        { label: "日報 XP ベース値", val: reportXP, set: setReportXP, min: 10, max: 100, step: 5 },
      ].map(({ label, val, set, min, max, step }) => (
        <Row key={label} label={label}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={(e) => set(Number(e.target.value))}
              style={{ width: 120, accentColor: "var(--c-xp)" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-xp)", minWidth: 36, textAlign: "right" }}>{val}</span>
          </div>
        </Row>
      ))}
      <Row label="月初 FP 自動リセット" sub="毎月1日に全員のFPをリセット">
        <Toggle value={autoReset} onChange={setAutoReset} />
      </Row>
      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn />
      </div>
    </div>
  );
}

function AISection() {
  const [strictness, setStrictness] = useState("標準");
  const [lang, setLang] = useState("です・ます調");
  const [fbDetail, setFbDetail] = useState(true);
  const [autoScore, setAutoScore] = useState(true);

  return (
    <div>
      <Row label="評価厳格度" sub="日報AI採点の厳しさ">
        <Select value={strictness} options={["優しい", "標準", "厳格"]} onChange={setStrictness} />
      </Row>
      <Row label="フィードバック文体" sub="AI生成コメントの文体">
        <Select value={lang} options={["です・ます調", "フレンドリー", "ビジネス"]} onChange={setLang} />
      </Row>
      <Row label="詳細フィードバック" sub="採点後に改善提案を表示">
        <Toggle value={fbDetail} onChange={setFbDetail} />
      </Row>
      <Row label="自動採点" sub="日報提出後に自動でAI採点">
        <Toggle value={autoScore} onChange={setAutoScore} />
      </Row>
      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn />
      </div>
    </div>
  );
}

function WebhooksSection() {
  const [hooks, setHooks] = useState([
    { id: "1", name: "Slack 通知", url: "https://hooks.slack.com/services/xxx", event: "badge_earned", active: true },
    { id: "2", name: "在庫アラート", url: "https://example.com/webhook", event: "inventory_low", active: false },
  ]);
  const [showPw, setShowPw] = useState<Record<string, boolean>>({});

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button style={{
          display: "flex", alignItems: "center", gap: 5, padding: "7px 14px",
          borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
          background: "var(--c-xp)", color: "#fff", border: "none",
        }}>
          <Plus size={13} /> Webhook を追加
        </button>
      </div>
      {hooks.map((h) => (
        <div key={h.id} style={{
          background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 12, padding: "14px 16px", marginBottom: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-t0)" }}>{h.name}</span>
            <Toggle value={h.active} onChange={(v) => setHooks((prev) => prev.map((x) => x.id === h.id ? { ...x, active: v } : x))} />
          </div>
          <div style={{ fontSize: 11, color: "var(--c-t2)", marginBottom: 4 }}>
            イベント: <span style={{ color: "var(--c-blue)", fontWeight: 600 }}>{h.event}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type={showPw[h.id] ? "text" : "password"}
              readOnly value={h.url}
              style={{
                flex: 1, padding: "6px 10px", borderRadius: 7, fontSize: 11,
                background: "var(--c-bg3)", border: "1px solid var(--c-border)", color: "var(--c-t1)", outline: "none",
              }}
            />
            <button onClick={() => setShowPw((p) => ({ ...p, [h.id]: !p[h.id] }))} style={{ background: "none", border: "none", cursor: "pointer" }}>
              {showPw[h.id] ? <EyeOff size={13} color="var(--c-t2)" /> : <Eye size={13} color="var(--c-t2)" />}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditSection() {
  const logs = [
    { time: "2025-03-12 09:01", user: "鈴木 健太", action: "ミッション設定を変更", level: "info" },
    { time: "2025-03-11 18:30", user: "田中 あかり", action: "日報を提出", level: "info" },
    { time: "2025-03-11 15:00", user: "山田 花子", action: "シフトを承認", level: "info" },
    { time: "2025-03-10 22:00", user: "鈴木 健太", action: "FP 上限を 50 → 60 に変更", level: "warn" },
    { time: "2025-03-09 08:55", user: "中村 りく", action: "ログイン", level: "info" },
    { time: "2025-03-08 20:30", user: "鈴木 健太", action: "ユーザー「中村 りく」を追加", level: "info" },
  ];

  const LEVEL_META = {
    info: { color: "var(--c-blue)" },
    warn: { color: "var(--c-xp)" },
    error: { color: "var(--c-red)" },
  };

  return (
    <div>
      <div style={{ background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "160px 1fr auto",
          padding: "9px 16px", borderBottom: "1px solid var(--c-border)",
          fontSize: 11, fontWeight: 700, color: "var(--c-t2)", textTransform: "uppercase",
        }}>
          <span>日時</span><span>操作</span><span>ユーザー</span>
        </div>
        {logs.map((log, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "160px 1fr auto", padding: "11px 16px", alignItems: "center",
            borderBottom: i < logs.length - 1 ? "1px solid var(--c-border)" : "none",
          }}>
            <span style={{ fontSize: 11.5, color: "var(--c-t2)", fontFamily: "monospace" }}>{log.time}</span>
            <span style={{ fontSize: 12.5, color: "var(--c-t0)" }}>
              <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: LEVEL_META[log.level as "info"].color, marginRight: 7 }} />
              {log.action}
            </span>
            <span style={{ fontSize: 11.5, color: "var(--c-t2)" }}>{log.user}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountSection({ user }: { user: UserType }) {
  const [showPwForm, setShowPwForm] = useState(false);
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");

  return (
    <div>
      <Row label="ロール" sub="システム上の権限">
        <span style={{
          padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
          background: "rgba(181,100,10,0.1)", color: "var(--c-xp)",
        }}>{user.role}</span>
      </Row>
      <Row label="パスワード変更" sub="セキュリティを定期的に更新しましょう">
        <button onClick={() => setShowPwForm(!showPwForm)} style={{
          padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
          background: "var(--c-bg2)", border: "1px solid var(--c-border)", color: "var(--c-t1)", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <RefreshCw size={12} /> 変更する
        </button>
      </Row>
      {showPwForm && (
        <div style={{ background: "var(--c-bg2)", borderRadius: 10, padding: "14px", margin: "0 0 4px" }}>
          {[
            { label: "現在のパスワード", val: curPw, set: setCurPw },
            { label: "新しいパスワード", val: newPw, set: setNewPw },
          ].map(({ label, val, set }) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-t2)", marginBottom: 4 }}>{label}</div>
              <input type="password" value={val} onChange={(e) => set(e.target.value)} style={{
                width: "100%", padding: "8px 10px", borderRadius: 8, fontSize: 13, boxSizing: "border-box",
                background: "var(--c-bg3)", border: "1px solid var(--c-border)", color: "var(--c-t0)", outline: "none",
              }} />
            </div>
          ))}
          <SaveBtn />
        </div>
      )}
      <Row label="データエクスポート" sub="全データをCSVでダウンロード">
        <button style={{
          padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
          background: "var(--c-bg2)", border: "1px solid var(--c-border)", color: "var(--c-t1)", cursor: "pointer",
        }}>エクスポート</button>
      </Row>
      <div style={{ marginTop: 24, padding: "16px", background: "rgba(181,40,40,0.06)", border: "1px solid rgba(181,40,40,0.2)", borderRadius: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-red)", marginBottom: 6 }}>危険ゾーン</div>
        <div style={{ fontSize: 12, color: "var(--c-t2)", marginBottom: 12 }}>アカウントを削除すると、すべてのデータが失われます。</div>
        <button style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
          borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
          background: "none", border: `1px solid var(--c-red)`, color: "var(--c-red)",
        }}>
          <Trash2 size={13} /> アカウントを削除
        </button>
      </div>
    </div>
  );
}

// ──── Main ───────────────────────────────────────────────────
export function Settings({ user }: SettingsProps) {
  const [section, setSection] = useState<SectionId>("profile");
  const active = SECTIONS.find((s) => s.id === section)!;

  function renderSection() {
    switch (section) {
      case "profile":  return <ProfileSection user={user} />;
      case "display":  return <DisplaySection />;
      case "economy":  return <EconomySection />;
      case "ai":       return <AISection />;
      case "webhooks": return <WebhooksSection />;
      case "audit":    return <AuditSection />;
      case "account":  return <AccountSection user={user} />;
    }
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 66px)", overflow: "hidden" }}>
      {/* Section nav */}
      <div style={{ width: 200, borderRight: "1px solid var(--c-border)", padding: "16px 8px", flexShrink: 0 }}>
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const isActive = section === id;
          return (
            <button key={id} onClick={() => setSection(id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 9,
              padding: "9px 12px", borderRadius: 9, cursor: "pointer", marginBottom: 2,
              background: isActive ? "rgba(181,100,10,0.1)" : "transparent",
              borderTop: "none", borderRight: "none", borderBottom: "none", textAlign: "left",
              borderLeft: `3px solid ${isActive ? "var(--c-xp)" : "transparent"}`,
              color: isActive ? "var(--c-xp)" : "var(--c-t1)",
              fontSize: 13, fontWeight: isActive ? 600 : 400, transition: "all 0.15s",
            }}>
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <active.icon size={18} color="var(--c-xp)" />
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "var(--c-t0)" }}>{active.label}</h2>
        </div>
        {renderSection()}
      </div>
    </div>
  );
}
