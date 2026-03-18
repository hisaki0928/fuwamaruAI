import type { ShiftEntry } from "./types";

const GIS_URL      = "https://accounts.google.com/gsi/client";
const GCAL_API     = "https://www.googleapis.com/calendar/v3";
const CALENDAR_ID  = "primary";
const TIMEZONE     = "Asia/Tokyo";
const SCOPE        = "https://www.googleapis.com/auth/calendar.events";

// ─── ICS 生成・ダウンロード ───────────────────────────────

function pad2(n: number) { return String(n).padStart(2, "0"); }

function toICSDateTime(date: string, time: string) {
  return date.replace(/-/g, "") + "T" + time.replace(/:/g, "") + "00";
}

export function generateICS(shifts: ShiftEntry[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fuwamaru OS//JA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-TIMEZONE:${TIMEZONE}`,
  ];

  for (const s of shifts) {
    if (s.status === "off") continue;
    const label = s.status === "confirmed" ? "確定" : "申請中";
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:fuwa-shift-${s.date}@fuwamaru-os`);
    if (s.start && s.end) {
      lines.push(`DTSTART;TZID=${TIMEZONE}:${toICSDateTime(s.date, s.start)}`);
      lines.push(`DTEND;TZID=${TIMEZONE}:${toICSDateTime(s.date, s.end)}`);
    } else {
      const next = new Date(s.date);
      next.setDate(next.getDate() + 1);
      const nd = `${next.getFullYear()}${pad2(next.getMonth() + 1)}${pad2(next.getDate())}`;
      lines.push(`DTSTART;VALUE=DATE:${s.date.replace(/-/g, "")}`);
      lines.push(`DTEND;VALUE=DATE:${nd}`);
    }
    lines.push(`SUMMARY:☕ Fuwamaru シフト（${label}）`);
    if (s.note) lines.push(`DESCRIPTION:${s.note}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadICS(shifts: ShiftEntry[], filename = "fuwamaru-shifts.ics") {
  const blob = new Blob([generateICS(shifts)], { type: "text/calendar;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Googleカレンダー 個別追加リンク ─────────────────────

export function buildGCalUrl(shift: ShiftEntry): string {
  const d = shift.date.replace(/-/g, "");
  const label = shift.status === "confirmed" ? "確定" : "申請中";
  let dates: string;
  if (shift.start && shift.end) {
    dates = `${d}T${shift.start.replace(":", "")}00/${d}T${shift.end.replace(":", "")}00`;
  } else {
    const next = new Date(shift.date);
    next.setDate(next.getDate() + 1);
    const nd = `${next.getFullYear()}${pad2(next.getMonth() + 1)}${pad2(next.getDate())}`;
    dates = `${d}/${nd}`;
  }
  return (
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(`☕ Fuwamaru シフト（${label}）`)}` +
    `&dates=${dates}` +
    `&details=${encodeURIComponent(shift.note ?? "Fuwamaru Cafe シフト")}` +
    `&ctz=Asia%2FTokyo`
  );
}

// ─── Google Identity Services (OAuth) ────────────────────

let gisReady = false;

export function loadGIS(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (gisReady || (window as any).google?.accounts) { gisReady = true; return Promise.resolve(); }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = GIS_URL;
    s.onload  = () => { gisReady = true; resolve(); };
    s.onerror = () => reject(new Error("Google Identity Services の読み込みに失敗しました"));
    document.head.appendChild(s);
  });
}

export function requestGoogleToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    if (!g?.accounts?.oauth2) { reject(new Error("GIS が読み込まれていません")); return; }
    const client = g.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (resp: { access_token?: string; error?: string }) => {
        if (resp.error) reject(new Error(resp.error));
        else            resolve(resp.access_token!);
      },
    });
    client.requestAccessToken();
  });
}

// ─── Googleカレンダーへ一括同期 ───────────────────────────

async function createEvent(token: string, shift: ShiftEntry): Promise<void> {
  const label = shift.status === "confirmed" ? "確定" : "申請中";
  let start: object, end: object;

  if (shift.start && shift.end) {
    start = { dateTime: `${shift.date}T${shift.start}:00`, timeZone: TIMEZONE };
    end   = { dateTime: `${shift.date}T${shift.end}:00`,   timeZone: TIMEZONE };
  } else {
    const next = new Date(shift.date);
    next.setDate(next.getDate() + 1);
    const nd = next.toISOString().slice(0, 10);
    start = { date: shift.date };
    end   = { date: nd };
  }

  const body = {
    summary: `☕ Fuwamaru シフト（${label}）`,
    description: `${shift.note ?? "Fuwamaru Cafe シフト"}\n[fuwa-shift-${shift.date}]`,
    start,
    end,
    colorId: shift.status === "confirmed" ? "2" : "5", // green / yellow
    reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 60 }] },
  };

  const res = await fetch(`${GCAL_API}/calendars/${CALENDAR_ID}/events`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message ?? `HTTP ${res.status}`);
  }
}

export async function syncShiftsToGoogle(
  token: string,
  shifts: ShiftEntry[],
): Promise<{ success: number; errors: number }> {
  const work = shifts.filter((s) => s.status !== "off");
  let success = 0, errors = 0;
  for (const s of work) {
    try   { await createEvent(token, s); success++; }
    catch { errors++; }
  }
  return { success, errors };
}
