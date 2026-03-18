"use client";

import { useState } from "react";
import {
  Calendar, ChevronLeft, ChevronRight, X,
  Download, CheckCircle2, AlertCircle, Loader2, ExternalLink,
} from "lucide-react";
import type { ShiftEntry, ShiftStatus } from "@/lib/types";
import { useStore } from "@/lib/store";
import {
  downloadICS,
  buildGCalUrl,
  loadGIS,
  requestGoogleToken,
  syncShiftsToGoogle,
} from "@/lib/google-calendar";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const STATUS_META = {
  confirmed: { label: "確定",   color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  pending:   { label: "申請中", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  off:       { label: "休み",   color: "var(--c-t2)", bg: "var(--c-bg3)" },
} as const;

const SHIFT_STATUS_OPTIONS: ShiftStatus[] = ["confirmed", "pending", "off"];
const GCAL_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
type SyncState = "idle" | "loading" | "success" | "error";

function GIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export function Shift() {
  const { shifts, setShifts } = useStore();

  const [year,  setYear]  = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // シフト編集モーダル
  const [modalDate,   setModalDate]   = useState<string | null>(null);
  const [modalStart,  setModalStart]  = useState("09:00");
  const [modalEnd,    setModalEnd]    = useState("17:00");
  const [modalStatus, setModalStatus] = useState<ShiftStatus>("confirmed");
  const [modalNote,   setModalNote]   = useState("");
  const [gcalLink,    setGcalLink]    = useState("");

  // Google Calendar 同期状態
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncMsg,   setSyncMsg]   = useState("");
  const [gcalToken, setGcalToken] = useState("");

  const firstDay    = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const shiftMap    = Object.fromEntries(shifts.map((s) => [s.date, s]));
  const todayStr    = new Date().toISOString().slice(0, 10);
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
  const monthShifts = shifts.filter((s) => s.date.startsWith(monthPrefix));
  const totalWork   = monthShifts.filter((s) => s.status !== "off").length;

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function openModal(dateStr: string) {
    const ex = shiftMap[dateStr];
    if (ex) {
      setModalStart(ex.start ?? "09:00");
      setModalEnd(ex.end ?? "17:00");
      setModalStatus(ex.status);
      setModalNote(ex.note ?? "");
      setGcalLink(buildGCalUrl(ex));
    } else {
      setModalStart("09:00");
      setModalEnd("17:00");
      setModalStatus("confirmed");
      setModalNote("");
      setGcalLink("");
    }
    setModalDate(dateStr);
  }

  function saveShift() {
    if (!modalDate) return;
    const entry: ShiftEntry = {
      date: modalDate,
      status: modalStatus,
      ...(modalStatus !== "off" ? { start: modalStart, end: modalEnd } : {}),
      ...(modalNote ? { note: modalNote } : {}),
    };
    if (shiftMap[modalDate]) {
      setShifts(shifts.map((s) => s.date === modalDate ? entry : s));
    } else {
      setShifts([...shifts, entry]);
    }
    if (entry.status !== "off") setGcalLink(buildGCalUrl(entry));
    setModalDate(null);
  }

  function deleteShift() {
    if (!modalDate) return;
    setShifts(shifts.filter((s) => s.date !== modalDate));
    setModalDate(null);
  }

  // ICS ダウンロード（今月分）
  function handleICS() {
    downloadICS(monthShifts, `fuwamaru-${year}${String(month).padStart(2, "0")}.ics`);
  }

  // Google Calendar 一括同期
  async function handleGoogleSync() {
    const workShifts = monthShifts.filter((s) => s.status !== "off");
    if (!GCAL_CLIENT_ID) {
      setSyncState("error");
      setSyncMsg("NEXT_PUBLIC_GOOGLE_CLIENT_ID が未設定です。下記セットアップを確認してください。");
      return;
    }
    if (workShifts.length === 0) {
      setSyncState("error");
      setSyncMsg("同期するシフトがありません。");
      setTimeout(() => { setSyncState("idle"); setSyncMsg(""); }, 3000);
      return;
    }
    setSyncState("loading");
    setSyncMsg("Google アカウントに接続中...");
    try {
      await loadGIS();
      let token = gcalToken;
      if (!token) {
        token = await requestGoogleToken(GCAL_CLIENT_ID);
        setGcalToken(token);
      }
      setSyncMsg(`${workShifts.length}件のシフトを同期中...`);
      const { success, errors } = await syncShiftsToGoogle(token, workShifts);
      setSyncState("success");
      setSyncMsg(
        errors === 0
          ? `✅ ${success}件のシフトをGoogleカレンダーに追加しました！`
          : `⚠️ ${success}件成功、${errors}件エラー`
      );
      setTimeout(() => { setSyncState("idle"); setSyncMsg(""); }, 6000);
    } catch (e) {
      setSyncState("error");
      setSyncMsg(e instanceof Error ? e.message : "同期に失敗しました");
      setTimeout(() => { setSyncState("idle"); setSyncMsg(""); }, 8000);
    }
  }

  const syncColor =
    syncState === "success" ? "#34d399" :
    syncState === "error"   ? "#f87171" : "#4285F4";

  return (
    <div style={{ padding: "24px", maxWidth: 760 }}>

      {/* ── ヘッダー ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Calendar size={18} color="var(--c-blue)" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--c-t0)" }}>シフト管理</h1>
            <p style={{ margin: 0, fontSize: 12, color: "var(--c-t2)" }}>
              今月の勤務: {totalWork}日 · 日付をクリックで編集
            </p>
          </div>
        </div>

        {/* エクスポートボタン */}
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={handleICS} style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "7px 12px", borderRadius: 8, cursor: "pointer",
            fontSize: 12, fontWeight: 600,
            background: "var(--c-bg2)", border: "1px solid var(--c-border)", color: "var(--c-t1)",
          }}>
            <Download size={13} /> ICS
          </button>

          <button
            onClick={handleGoogleSync}
            disabled={syncState === "loading"}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 8, cursor: syncState === "loading" ? "not-allowed" : "pointer",
              fontSize: 12, fontWeight: 700, border: "none",
              background: `${syncColor}18`,
              color: syncColor,
              outline: `1px solid ${syncColor}40`,
              transition: "all 0.15s",
            }}
          >
            {syncState === "loading" ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
            : syncState === "success" ? <CheckCircle2 size={13} />
            : syncState === "error"   ? <AlertCircle size={13} />
            : <GIcon />}
            {syncState === "loading" ? "同期中..." : "Googleカレンダー"}
          </button>
        </div>
      </div>

      {/* 同期ステータスメッセージ */}
      {syncMsg && (
        <div style={{
          marginBottom: 14, padding: "10px 14px", borderRadius: 9, fontSize: 12,
          background: `${syncColor}10`, border: `1px solid ${syncColor}30`, color: syncColor,
        }}>
          {syncMsg}
          {syncState === "error" && !GCAL_CLIENT_ID && (
            <div style={{ marginTop: 8, fontSize: 11, color: "var(--c-t2)", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--c-t1)" }}>🔧 セットアップ手順</strong><br/>
              1. <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#4285F4" }}>Google Cloud Console</a> でプロジェクトを作成<br/>
              2. 「APIとサービス」→「Google Calendar API」を有効化<br/>
              3. 「認証情報」→「OAuthクライアントID」を作成（種類: ウェブアプリ）<br/>
              4. 「承認済みのJavaScriptオリジン」にサイトのURLを追加<br/>
              5. プロジェクトルートの <code style={{ background: "var(--c-bg3)", padding: "1px 5px", borderRadius: 3 }}>.env.local</code> に追記:<br/>
              <code style={{ background: "var(--c-bg3)", padding: "3px 8px", borderRadius: 4, display: "inline-block", marginTop: 4 }}>
                NEXT_PUBLIC_GOOGLE_CLIENT_ID=あなたのクライアントID
              </code>
            </div>
          )}
        </div>
      )}

      {/* 月ナビゲーター */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 12,
        padding: "12px 16px", marginBottom: 16,
      }}>
        <button onClick={prevMonth} style={{
          width: 32, height: 32, borderRadius: 8, background: "var(--c-bg3)",
          border: "1px solid var(--c-border)", display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer",
        }}>
          <ChevronLeft size={15} color="var(--c-t1)" />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--c-t0)" }}>
          {year}年 {month}月
        </span>
        <button onClick={nextMonth} style={{
          width: 32, height: 32, borderRadius: 8, background: "var(--c-bg3)",
          border: "1px solid var(--c-border)", display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer",
        }}>
          <ChevronRight size={15} color="var(--c-t1)" />
        </button>
      </div>

      {/* カレンダー */}
      <div style={{ background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {WEEKDAYS.map((d, i) => (
            <div key={d} style={{
              padding: "10px 4px", textAlign: "center", fontSize: 11, fontWeight: 700,
              color: i === 0 ? "#f87171" : i === 6 ? "#60a5fa" : "var(--c-t2)",
              borderBottom: "1px solid var(--c-border)",
            }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells.map((day, idx) => {
            if (!day) return (
              <div key={`e-${idx}`} style={{
                minHeight: 72, borderBottom: "1px solid var(--c-border)",
                borderRight: idx % 7 !== 6 ? "1px solid var(--c-border)" : "none",
              }} />
            );
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const shift   = shiftMap[dateStr];
            const dow     = (firstDay + day - 1) % 7;
            const isToday = dateStr === todayStr;
            return (
              <div
                key={day}
                onClick={() => openModal(dateStr)}
                style={{
                  minHeight: 72, padding: "8px 6px", cursor: "pointer",
                  borderBottom: "1px solid var(--c-border)",
                  borderRight: (firstDay + day - 1) % 7 !== 6 ? "1px solid var(--c-border)" : "none",
                  background: isToday ? "rgba(245,158,11,0.05)" : "transparent",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = isToday ? "rgba(245,158,11,0.05)" : "transparent"; }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 6, marginBottom: 4,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isToday ? "var(--c-xp)" : "transparent",
                  fontSize: 12, fontWeight: isToday ? 800 : 500,
                  color: isToday ? "#000" : dow === 0 ? "#f87171" : dow === 6 ? "#60a5fa" : "var(--c-t1)",
                }}>{day}</div>
                {shift && (
                  <div style={{
                    borderRadius: 5, padding: "3px 5px",
                    background: STATUS_META[shift.status].bg, fontSize: 9.5, lineHeight: 1.4,
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

      {/* 凡例 */}
      <div style={{ display: "flex", gap: 16, marginTop: 14, alignItems: "center" }}>
        {(Object.entries(STATUS_META) as [ShiftStatus, (typeof STATUS_META)[ShiftStatus]][]).map(([key, meta]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: meta.bg, border: `1px solid ${meta.color}40` }} />
            <span style={{ fontSize: 11, color: "var(--c-t2)" }}>{meta.label}</span>
          </div>
        ))}
        <span style={{ fontSize: 11, color: "var(--c-t2)", marginLeft: "auto" }}>
          ※ ICS = Apple/Google/Outlook カレンダー共通形式
        </span>
      </div>

      {/* ── 編集モーダル ── */}
      {modalDate && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 200, backdropFilter: "blur(4px)",
            background: "rgba(0,0,0,0.55)", display: "flex",
            alignItems: "center", justifyContent: "center", padding: 16,
          }}
          onClick={() => setModalDate(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--c-bg0)", borderRadius: 16, width: "100%", maxWidth: 400,
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)", overflow: "hidden",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px 12px", borderBottom: "1px solid var(--c-border)",
            }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--c-t0)" }}>
                シフト編集 — {modalDate}
              </span>
              <button onClick={() => setModalDate(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={16} color="var(--c-t2)" />
              </button>
            </div>
            <div style={{ padding: "16px 20px 20px" }}>
              {/* ステータス */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--c-t2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>ステータス</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {SHIFT_STATUS_OPTIONS.map((s) => (
                    <button key={s} onClick={() => setModalStatus(s)} style={{
                      flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
                      cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.12s",
                      background: modalStatus === s ? STATUS_META[s].bg   : "var(--c-bg2)",
                      color:      modalStatus === s ? STATUS_META[s].color : "var(--c-t1)",
                      outline:    modalStatus === s ? `1px solid ${STATUS_META[s].color}50` : "none",
                    }}>
                      {STATUS_META[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 時間 */}
              {modalStatus !== "off" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  {([["開始時間", modalStart, setModalStart], ["終了時間", modalEnd, setModalEnd]] as const).map(([label, val, set]) => (
                    <div key={label}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--c-t2)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</div>
                      <input type="time" value={val} onChange={(e) => set(e.target.value)} style={{
                        width: "100%", padding: "8px 10px", borderRadius: 8, fontSize: 13, boxSizing: "border-box",
                        background: "var(--c-bg2)", border: "1px solid var(--c-border)", color: "var(--c-t0)", outline: "none",
                      }} />
                    </div>
                  ))}
                </div>
              )}

              {/* メモ */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--c-t2)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.6 }}>メモ（任意）</div>
                <input type="text" value={modalNote} onChange={(e) => setModalNote(e.target.value)}
                  placeholder="例：申請中、研修など"
                  style={{
                    width: "100%", padding: "8px 10px", borderRadius: 8, fontSize: 13, boxSizing: "border-box",
                    background: "var(--c-bg2)", border: "1px solid var(--c-border)", color: "var(--c-t0)", outline: "none",
                  }}
                />
              </div>

              {/* 保存・削除ボタン */}
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button onClick={saveShift} style={{
                  flex: 1, padding: "10px", borderRadius: 9, border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 700, background: "var(--c-xp)", color: "#fff",
                }}>保存する</button>
                {shiftMap[modalDate] && (
                  <button onClick={deleteShift} style={{
                    padding: "10px 14px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700,
                    background: "transparent", border: "1px solid var(--c-red)", color: "var(--c-red)",
                  }}>削除</button>
                )}
              </div>

              {/* Googleカレンダーに個別追加 */}
              {gcalLink && (
                <a href={gcalLink} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "8px 12px", borderRadius: 9, textDecoration: "none",
                  background: "rgba(66,133,244,0.08)", border: "1px solid rgba(66,133,244,0.25)",
                  fontSize: 12, fontWeight: 600, color: "#4285F4",
                }}>
                  <GIcon /> Googleカレンダーに追加 <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
