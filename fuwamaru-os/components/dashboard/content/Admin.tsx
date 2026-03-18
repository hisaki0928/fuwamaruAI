"use client";

import { useState, useRef } from "react";
import {
  Database, Plus, Pencil, Trash2, X, ImagePlus,
  ShoppingCart, ShoppingBag, Trophy, Award, Package, BookOpen, ThumbsUp, KeyRound,
} from "lucide-react";
import type {
  POSItem, POSIngredient, ShopItem, Mission, Badge, InventoryItem, WikiArticle, Proposal,
  POSCategory, ShopCategory, MissionType, Difficulty, BadgeCategory,
  InvCategory, StockStatus, WikiCategory, ProposalStatus,
} from "@/lib/types";
import { useStore } from "@/lib/store";
import { REGISTERED_USERS } from "@/lib/mock-data";

// ── ID helper ──────────────────────────────────────────────
function uid() { return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

// ─────────────────────────────────────────────────────────
// Tab config
// ─────────────────────────────────────────────────────────
const TABS = [
  { id: "pos",       label: "POSメニュー",  icon: ShoppingCart },
  { id: "shop",      label: "FPショップ",   icon: ShoppingBag  },
  { id: "missions",  label: "ミッション",   icon: Trophy       },
  { id: "badges",    label: "バッジ",       icon: Award        },
  { id: "inventory", label: "在庫",         icon: Package      },
  { id: "wiki",      label: "Wiki",         icon: BookOpen     },
  { id: "proposals", label: "投票・提案",   icon: ThumbsUp     },
  { id: "passwords", label: "パスワード管理", icon: KeyRound   },
] as const;
type TabId = typeof TABS[number]["id"];

// ─────────────────────────────────────────────────────────
// Shared UI
// ─────────────────────────────────────────────────────────
function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.45)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: "var(--c-bg0)", borderRadius: 14, width: "100%", maxWidth: 540,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
      }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function MHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 20px 12px", borderBottom: "1px solid var(--c-border)",
    }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: "var(--c-t0)" }}>{title}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-t2)" }}>
        <X size={16} />
      </button>
    </div>
  );
}

const fi: React.CSSProperties = {
  width: "100%", padding: "9px 11px", borderRadius: 8, fontSize: 13,
  background: "var(--c-bg2)", border: "1px solid var(--c-border)",
  color: "var(--c-t0)", outline: "none", boxSizing: "border-box",
};

function FL({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--c-t2)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
function FTxt({ v, s, ph }: { v: string; s: (x: string) => void; ph?: string }) {
  return <input value={v} onChange={(e) => s(e.target.value)} placeholder={ph} style={fi} />;
}
function FNum({ v, s }: { v: number; s: (x: number) => void }) {
  return <input type="number" value={v} onChange={(e) => s(Number(e.target.value))} style={fi} />;
}
function FArea({ v, s }: { v: string; s: (x: string) => void }) {
  return <textarea value={v} onChange={(e) => s(e.target.value)} rows={3} style={{ ...fi, resize: "vertical" }} />;
}
function FSel({ v, s, opts }: { v: string; s: (x: string) => void; opts: string[] }) {
  return <select value={v} onChange={(e) => s(e.target.value)} style={fi}>{opts.map((o) => <option key={o}>{o}</option>)}</select>;
}
function FChk({ v, s, label }: { v: boolean; s: (x: boolean) => void; label: string }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13, color: "var(--c-t0)" }}>
      <input type="checkbox" checked={v} onChange={(e) => s(e.target.checked)} />
      {label}
    </label>
  );
}

function FImg({ v, s }: { v?: string; s: (x: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { alert("2MB以下の画像を使ってください"); return; }
    const r = new FileReader();
    r.onload = () => s(r.result as string);
    r.readAsDataURL(f);
  }
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <input ref={ref} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
      {v && <img src={v} alt="" style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", border: "1px solid var(--c-border)", flexShrink: 0 }} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button type="button" onClick={() => ref.current?.click()} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "7px 12px",
          borderRadius: 8, border: "1px dashed var(--c-border)", background: "var(--c-bg2)",
          cursor: "pointer", fontSize: 12, color: "var(--c-t1)",
        }}>
          <ImagePlus size={13} /> 画像を選ぶ（2MB以下）
        </button>
        {v && <button type="button" onClick={() => s("")} style={{ fontSize: 11, color: "var(--c-red)", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
          削除
        </button>}
      </div>
    </div>
  );
}

function SaveBtn({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid var(--c-border)", marginTop: 16 }}>
      <button onClick={onClick} style={{
        padding: "10px 24px", borderRadius: 9, border: "none", cursor: "pointer",
        fontSize: 13, fontWeight: 700, background: "var(--c-xp)", color: "#fff",
      }}>保存する</button>
    </div>
  );
}

function ItemRow({ left, right, onEdit, onDel }: {
  left: React.ReactNode; right?: React.ReactNode;
  onEdit: () => void; onDel: () => void;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
      background: "var(--c-bg2)", borderRadius: 10, border: "1px solid var(--c-border)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>{left}</div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
      <button onClick={onEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-t2)", padding: 5 }}><Pencil size={13} /></button>
      <button onClick={onDel}  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-red)",  padding: 5 }}><Trash2  size={13} /></button>
    </div>
  );
}

function TabHeader({ title, count, onAdd }: { title: string; count: number; onAdd: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--c-t0)" }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--c-t2)", marginTop: 2 }}>{count}件</div>
      </div>
      <button onClick={onAdd} style={{
        display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
        borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
        background: "var(--c-xp)", color: "#fff",
      }}>
        <Plus size={13} /> 追加
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// POS メニュー
// ─────────────────────────────────────────────────────────
const POS_CATS: POSCategory[] = ["ドリンク", "フード", "デザート"];

function POSTab() {
  const { posItems, setPosItems, inventory } = useStore();
  const [modal, setModal] = useState<POSItem | "new" | null>(null);

  const blank: POSItem = { id: "", name: "", emoji: "☕", category: "ドリンク", price: 500, ingredients: [] };
  const [draft, setDraft] = useState<POSItem>(blank);

  function openAdd() { setDraft({ ...blank, id: uid() }); setModal("new"); }
  function openEdit(item: POSItem) { setDraft({ ...item, ingredients: item.ingredients ?? [] }); setModal(item); }
  function save() {
    if (!draft.name.trim()) return;
    if (modal === "new") setPosItems([...posItems, draft]);
    else setPosItems(posItems.map((p) => p.id === draft.id ? draft : p));
    setModal(null);
  }
  function del(id: string) { if (confirm("削除しますか？")) setPosItems(posItems.filter((p) => p.id !== id)); }

  const set = <K extends keyof POSItem>(k: K, v: POSItem[K]) => setDraft((d) => ({ ...d, [k]: v }));

  // Ingredient helpers
  function addIngredient() {
    if (inventory.length === 0) return;
    setDraft((d) => ({ ...d, ingredients: [...(d.ingredients ?? []), { inventoryId: inventory[0].id, amount: 1 }] }));
  }
  function setIngredient(idx: number, field: "inventoryId" | "amount", val: string | number) {
    setDraft((d) => ({
      ...d,
      ingredients: (d.ingredients ?? []).map((ing, i) => i === idx ? { ...ing, [field]: val } : ing),
    }));
  }
  function removeIngredient(idx: number) {
    setDraft((d) => ({ ...d, ingredients: (d.ingredients ?? []).filter((_, i) => i !== idx) }));
  }

  return (
    <div>
      <TabHeader title="POSメニュー" count={posItems.length} onAdd={openAdd} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {posItems.map((item) => (
          <ItemRow
            key={item.id}
            left={
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {item.imageUrl
                  ? <img src={item.imageUrl} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
                  : <span style={{ fontSize: 24, lineHeight: 1 }}>{item.emoji}</span>
                }
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-t0)" }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "var(--c-t2)" }}>
                    {item.category} · ¥{item.price.toLocaleString()}
                    {(item.ingredients?.length ?? 0) > 0 && (
                      <span style={{ color: "var(--c-green)", marginLeft: 6 }}>
                        📦 在庫連携 {item.ingredients!.length}品目
                      </span>
                    )}
                  </div>
                </div>
              </div>
            }
            onEdit={() => openEdit(item)}
            onDel={() => del(item.id)}
          />
        ))}
      </div>

      {modal !== null && (
        <Overlay onClose={() => setModal(null)}>
          <MHead title={modal === "new" ? "メニュー追加" : "メニュー編集"} onClose={() => setModal(null)} />
          <div style={{ padding: "16px 20px" }}>
            <FL label="商品名"><FTxt v={draft.name} s={(v) => set("name", v)} ph="エスプレッソ" /></FL>
            <FL label="絵文字（画像がない場合に表示）"><FTxt v={draft.emoji} s={(v) => set("emoji", v)} ph="☕" /></FL>
            <FL label="カテゴリー"><FSel v={draft.category} s={(v) => set("category", v as POSCategory)} opts={POS_CATS} /></FL>
            <FL label="価格（税抜）"><FNum v={draft.price} s={(v) => set("price", v)} /></FL>
            <FL label="商品画像（オプション）"><FImg v={draft.imageUrl} s={(v) => set("imageUrl", v)} /></FL>

            {/* 在庫連携 */}
            <FL label="在庫連携（販売時に消費される在庫）">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(draft.ingredients ?? []).map((ing, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select
                      value={ing.inventoryId}
                      onChange={(e) => setIngredient(idx, "inventoryId", e.target.value)}
                      style={{ ...fi, flex: 1 }}
                    >
                      {inventory.map((inv) => (
                        <option key={inv.id} value={inv.id}>{inv.name}（{inv.unit}）</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={ing.amount}
                      onChange={(e) => setIngredient(idx, "amount", Number(e.target.value))}
                      style={{ ...fi, width: 72 }}
                    />
                    <button onClick={() => removeIngredient(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-red)", padding: 4 }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {inventory.length > 0 && (
                  <button onClick={addIngredient} style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                    borderRadius: 7, border: "1px dashed var(--c-border)", background: "transparent",
                    cursor: "pointer", fontSize: 12, color: "var(--c-t1)",
                  }}>
                    <Plus size={12} /> 在庫アイテムを追加
                  </button>
                )}
                {inventory.length === 0 && (
                  <p style={{ margin: 0, fontSize: 12, color: "var(--c-t2)" }}>在庫タブでアイテムを先に登録してください</p>
                )}
              </div>
            </FL>

            <SaveBtn onClick={save} />
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FP ショップ
// ─────────────────────────────────────────────────────────
const SHOP_CATS: ShopCategory[] = ["特典", "称号", "アバター", "消耗品"];

function ShopTab() {
  const { shopItems, setShopItems } = useStore();
  const [modal, setModal] = useState<ShopItem | "new" | null>(null);

  const blank: ShopItem = { id: "", name: "", description: "", emoji: "🎁", category: "特典", fpCost: 100 };
  const [draft, setDraft] = useState<ShopItem>(blank);

  function openAdd() { setDraft({ ...blank, id: uid() }); setModal("new"); }
  function openEdit(item: ShopItem) { setDraft({ ...item }); setModal(item); }
  function save() {
    if (!draft.name.trim()) return;
    if (modal === "new") setShopItems([...shopItems, draft]);
    else setShopItems(shopItems.map((s) => s.id === draft.id ? draft : s));
    setModal(null);
  }
  function del(id: string) { if (confirm("削除しますか？")) setShopItems(shopItems.filter((s) => s.id !== id)); }

  const set = <K extends keyof ShopItem>(k: K, v: ShopItem[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div>
      <TabHeader title="FPショップアイテム" count={shopItems.length} onAdd={openAdd} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {shopItems.map((item) => (
          <ItemRow
            key={item.id}
            left={
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{item.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-t0)" }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "var(--c-t2)" }}>{item.category} · {item.fpCost} FP</div>
                </div>
              </div>
            }
            right={item.limited && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, background: "rgba(181,100,10,0.12)", color: "var(--c-xp)", fontWeight: 700 }}>LIMITED</span>}
            onEdit={() => openEdit(item)}
            onDel={() => del(item.id)}
          />
        ))}
      </div>

      {modal !== null && (
        <Overlay onClose={() => setModal(null)}>
          <MHead title={modal === "new" ? "アイテム追加" : "アイテム編集"} onClose={() => setModal(null)} />
          <div style={{ padding: "16px 20px" }}>
            <FL label="名前"><FTxt v={draft.name} s={(v) => set("name", v)} /></FL>
            <FL label="絵文字"><FTxt v={draft.emoji} s={(v) => set("emoji", v)} /></FL>
            <FL label="説明"><FTxt v={draft.description} s={(v) => set("description", v)} /></FL>
            <FL label="カテゴリー"><FSel v={draft.category} s={(v) => set("category", v as ShopCategory)} opts={SHOP_CATS} /></FL>
            <FL label="FPコスト"><FNum v={draft.fpCost} s={(v) => set("fpCost", v)} /></FL>
            <FL label="オプション">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <FChk v={draft.limited ?? false} s={(v) => set("limited", v)} label="期間限定" />
                <FChk v={draft.soldOut ?? false} s={(v) => set("soldOut", v)} label="売り切れ" />
              </div>
            </FL>
            <SaveBtn onClick={save} />
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ミッション
// ─────────────────────────────────────────────────────────
const MISSION_TYPES: MissionType[] = ["DAILY", "WEEKLY", "SPECIAL"];
const DIFFICULTIES: Difficulty[]   = ["EASY", "NORMAL", "HARD", "LEGENDARY"];

const DIFF_COLORS: Record<Difficulty, string> = {
  EASY: "var(--c-green)", NORMAL: "var(--c-blue)", HARD: "var(--c-orange)", LEGENDARY: "var(--c-fp)",
};

function MissionsTab() {
  const { missions, setMissions } = useStore();
  const [modal, setModal] = useState<Mission | "new" | null>(null);

  const blank: Mission = { id: 0, title: "", description: "", xpReward: 50, fpReward: 10,
    progress: 0, total: 5, type: "DAILY", difficulty: "NORMAL" };
  const [draft, setDraft] = useState<Mission>(blank);

  function openAdd() { setDraft({ ...blank, id: Date.now() }); setModal("new"); }
  function openEdit(m: Mission) { setDraft({ ...m }); setModal(m); }
  function save() {
    if (!draft.title.trim()) return;
    if (modal === "new") setMissions([...missions, draft]);
    else setMissions(missions.map((m) => m.id === draft.id ? draft : m));
    setModal(null);
  }
  function del(id: number) { if (confirm("削除しますか？")) setMissions(missions.filter((m) => m.id !== id)); }

  const set = <K extends keyof Mission>(k: K, v: Mission[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div>
      <TabHeader title="ミッション" count={missions.length} onAdd={openAdd} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {missions.map((m) => (
          <ItemRow
            key={m.id}
            left={
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-t0)", marginBottom: 2 }}>{m.title}</div>
                <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
                  <span style={{ color: "var(--c-t2)" }}>{m.type}</span>
                  <span style={{ color: DIFF_COLORS[m.difficulty], fontWeight: 700 }}>{m.difficulty}</span>
                  <span style={{ color: "var(--c-xp)" }}>+{m.xpReward} XP</span>
                  <span style={{ color: "var(--c-fp)" }}>+{m.fpReward} FP</span>
                </div>
              </div>
            }
            onEdit={() => openEdit(m)}
            onDel={() => del(m.id)}
          />
        ))}
      </div>

      {modal !== null && (
        <Overlay onClose={() => setModal(null)}>
          <MHead title={modal === "new" ? "ミッション追加" : "ミッション編集"} onClose={() => setModal(null)} />
          <div style={{ padding: "16px 20px" }}>
            <FL label="タイトル"><FTxt v={draft.title} s={(v) => set("title", v)} /></FL>
            <FL label="説明"><FTxt v={draft.description} s={(v) => set("description", v)} /></FL>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FL label="タイプ"><FSel v={draft.type} s={(v) => set("type", v as MissionType)} opts={MISSION_TYPES} /></FL>
              <FL label="難易度"><FSel v={draft.difficulty} s={(v) => set("difficulty", v as Difficulty)} opts={DIFFICULTIES} /></FL>
              <FL label="XP報酬"><FNum v={draft.xpReward} s={(v) => set("xpReward", v)} /></FL>
              <FL label="FP報酬"><FNum v={draft.fpReward} s={(v) => set("fpReward", v)} /></FL>
              <FL label="目標数"><FNum v={draft.total} s={(v) => set("total", v)} /></FL>
              <FL label="現在の進捗"><FNum v={draft.progress} s={(v) => set("progress", v)} /></FL>
            </div>
            <SaveBtn onClick={save} />
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// バッジ
// ─────────────────────────────────────────────────────────
const BADGE_CATS: BadgeCategory[] = ["接客", "バリスタ", "チームワーク", "継続", "特別"];
const BADGE_RARITIES = ["COMMON", "RARE", "EPIC", "LEGENDARY"] as const;

const RARITY_COLORS: Record<string, string> = {
  COMMON: "var(--c-t2)", RARE: "var(--c-blue)", EPIC: "var(--c-fp)", LEGENDARY: "var(--c-xp)",
};

function BadgesTab() {
  const { badges, setBadges } = useStore();
  const [modal, setModal] = useState<Badge | "new" | null>(null);

  const blank: Badge = { id: "", name: "", description: "", emoji: "🏆", category: "接客",
    earned: false, rarity: "COMMON", xpReward: 100 };
  const [draft, setDraft] = useState<Badge>(blank);

  function openAdd() { setDraft({ ...blank, id: uid() }); setModal("new"); }
  function openEdit(b: Badge) { setDraft({ ...b }); setModal(b); }
  function save() {
    if (!draft.name.trim()) return;
    if (modal === "new") setBadges([...badges, draft]);
    else setBadges(badges.map((b) => b.id === draft.id ? draft : b));
    setModal(null);
  }
  function del(id: string) { if (confirm("削除しますか？")) setBadges(badges.filter((b) => b.id !== id)); }

  const set = <K extends keyof Badge>(k: K, v: Badge[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div>
      <TabHeader title="バッジ・実績" count={badges.length} onAdd={openAdd} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {badges.map((b) => (
          <ItemRow
            key={b.id}
            left={
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{b.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-t0)", marginBottom: 2 }}>{b.name}</div>
                  <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
                    <span style={{ color: "var(--c-t2)" }}>{b.category}</span>
                    <span style={{ color: RARITY_COLORS[b.rarity], fontWeight: 700 }}>{b.rarity}</span>
                    <span style={{ color: "var(--c-xp)" }}>+{b.xpReward} XP</span>
                  </div>
                </div>
              </div>
            }
            right={b.earned
              ? <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, background: "rgba(30,122,69,0.12)", color: "var(--c-green)", fontWeight: 700 }}>獲得済</span>
              : null
            }
            onEdit={() => openEdit(b)}
            onDel={() => del(b.id)}
          />
        ))}
      </div>

      {modal !== null && (
        <Overlay onClose={() => setModal(null)}>
          <MHead title={modal === "new" ? "バッジ追加" : "バッジ編集"} onClose={() => setModal(null)} />
          <div style={{ padding: "16px 20px" }}>
            <FL label="名前"><FTxt v={draft.name} s={(v) => set("name", v)} /></FL>
            <FL label="絵文字"><FTxt v={draft.emoji} s={(v) => set("emoji", v)} /></FL>
            <FL label="説明"><FTxt v={draft.description} s={(v) => set("description", v)} /></FL>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FL label="カテゴリー"><FSel v={draft.category} s={(v) => set("category", v as BadgeCategory)} opts={BADGE_CATS} /></FL>
              <FL label="レアリティ"><FSel v={draft.rarity} s={(v) => set("rarity", v as Badge["rarity"])} opts={[...BADGE_RARITIES]} /></FL>
              <FL label="XP報酬"><FNum v={draft.xpReward} s={(v) => set("xpReward", v)} /></FL>
            </div>
            <FL label="オプション"><FChk v={draft.earned} s={(v) => set("earned", v)} label="獲得済みにする" /></FL>
            <SaveBtn onClick={save} />
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 在庫管理
// ─────────────────────────────────────────────────────────
const INV_CATS: InvCategory[] = ["豆・粉", "乳製品", "シロップ", "フード材料", "カップ・器材"];
const INV_STATUS: StockStatus[] = ["ok", "low", "critical"];
const STATUS_COLORS: Record<StockStatus, string> = {
  ok: "var(--c-green)", low: "var(--c-orange)", critical: "var(--c-red)",
};
const STATUS_LABELS: Record<StockStatus, string> = { ok: "正常", low: "少ない", critical: "危険" };

function InventoryTab() {
  const { inventory, setInventory } = useStore();
  const [modal, setModal] = useState<InventoryItem | "new" | null>(null);

  const blank: InventoryItem = { id: "", name: "", category: "豆・粉", stock: 0, par: 10, unit: "kg", status: "ok" };
  const [draft, setDraft] = useState<InventoryItem>(blank);

  function openAdd() { setDraft({ ...blank, id: uid() }); setModal("new"); }
  function openEdit(i: InventoryItem) { setDraft({ ...i }); setModal(i); }
  function save() {
    if (!draft.name.trim()) return;
    if (modal === "new") setInventory([...inventory, draft]);
    else setInventory(inventory.map((i) => i.id === draft.id ? draft : i));
    setModal(null);
  }
  function del(id: string) { if (confirm("削除しますか？")) setInventory(inventory.filter((i) => i.id !== id)); }

  const set = <K extends keyof InventoryItem>(k: K, v: InventoryItem[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div>
      <TabHeader title="在庫アイテム" count={inventory.length} onAdd={openAdd} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {inventory.map((item) => (
          <ItemRow
            key={item.id}
            left={
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-t0)", marginBottom: 2 }}>{item.name}</div>
                <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
                  <span style={{ color: "var(--c-t2)" }}>{item.category}</span>
                  <span style={{ color: "var(--c-t1)" }}>{item.stock}/{item.par} {item.unit}</span>
                  <span style={{ color: STATUS_COLORS[item.status], fontWeight: 700 }}>{STATUS_LABELS[item.status]}</span>
                </div>
              </div>
            }
            onEdit={() => openEdit(item)}
            onDel={() => del(item.id)}
          />
        ))}
      </div>

      {modal !== null && (
        <Overlay onClose={() => setModal(null)}>
          <MHead title={modal === "new" ? "在庫アイテム追加" : "在庫アイテム編集"} onClose={() => setModal(null)} />
          <div style={{ padding: "16px 20px" }}>
            <FL label="品名"><FTxt v={draft.name} s={(v) => set("name", v)} /></FL>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FL label="カテゴリー"><FSel v={draft.category} s={(v) => set("category", v as InvCategory)} opts={INV_CATS} /></FL>
              <FL label="単位"><FTxt v={draft.unit} s={(v) => set("unit", v)} ph="kg / 個 / 袋" /></FL>
              <FL label="現在の在庫"><FNum v={draft.stock} s={(v) => set("stock", v)} /></FL>
              <FL label="基準在庫（PAR）"><FNum v={draft.par} s={(v) => set("par", v)} /></FL>
              <FL label="ステータス"><FSel v={draft.status} s={(v) => set("status", v as StockStatus)} opts={INV_STATUS} /></FL>
            </div>
            <SaveBtn onClick={save} />
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Wiki
// ─────────────────────────────────────────────────────────
const WIKI_CATS: WikiCategory[] = ["接客マニュアル", "ドリンクレシピ", "衛生管理", "緊急対応", "新人研修"];

function WikiTab() {
  const { wiki, setWiki } = useStore();
  const [modal, setModal] = useState<WikiArticle | "new" | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const blank: WikiArticle = { id: "", title: "", category: "接客マニュアル", summary: "", content: "", author: "", updatedAt: today, views: 0 };
  const [draft, setDraft] = useState<WikiArticle>(blank);

  function openAdd() { setDraft({ ...blank, id: uid() }); setModal("new"); }
  function openEdit(a: WikiArticle) { setDraft({ ...a }); setModal(a); }
  function save() {
    if (!draft.title.trim()) return;
    if (modal === "new") setWiki([...wiki, draft]);
    else setWiki(wiki.map((w) => w.id === draft.id ? draft : w));
    setModal(null);
  }
  function del(id: string) { if (confirm("削除しますか？")) setWiki(wiki.filter((w) => w.id !== id)); }

  const set = <K extends keyof WikiArticle>(k: K, v: WikiArticle[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div>
      <TabHeader title="Wikiナレッジ" count={wiki.length} onAdd={openAdd} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {wiki.map((a) => (
          <ItemRow
            key={a.id}
            left={
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-t0)", marginBottom: 2 }}>{a.title}</div>
                <div style={{ display: "flex", gap: 8, fontSize: 11, color: "var(--c-t2)" }}>
                  <span>{a.category}</span>
                  <span>✍ {a.author}</span>
                  <span>{a.updatedAt}</span>
                </div>
              </div>
            }
            onEdit={() => openEdit(a)}
            onDel={() => del(a.id)}
          />
        ))}
      </div>

      {modal !== null && (
        <Overlay onClose={() => setModal(null)}>
          <MHead title={modal === "new" ? "記事追加" : "記事編集"} onClose={() => setModal(null)} />
          <div style={{ padding: "16px 20px" }}>
            <FL label="タイトル"><FTxt v={draft.title} s={(v) => set("title", v)} /></FL>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FL label="カテゴリー"><FSel v={draft.category} s={(v) => set("category", v as WikiCategory)} opts={WIKI_CATS} /></FL>
              <FL label="著者"><FTxt v={draft.author} s={(v) => set("author", v)} /></FL>
              <FL label="更新日"><FTxt v={draft.updatedAt} s={(v) => set("updatedAt", v)} ph="2025-03-01" /></FL>
            </div>
            <FL label="概要（一覧に表示）"><FTxt v={draft.summary} s={(v) => set("summary", v)} /></FL>
            <FL label="本文"><FArea v={draft.content} s={(v) => set("content", v)} /></FL>
            <SaveBtn onClick={save} />
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 投票・提案
// ─────────────────────────────────────────────────────────
const PROPOSAL_STATUS: ProposalStatus[] = ["open", "closed", "implemented"];
const STATUS_META: Record<ProposalStatus, { label: string; color: string }> = {
  open:        { label: "投票中",   color: "var(--c-green)"  },
  closed:      { label: "終了",     color: "var(--c-t2)"     },
  implemented: { label: "実施済み", color: "var(--c-blue)"   },
};

function ProposalsTab() {
  const { proposals, setProposals } = useStore();
  const [modal, setModal] = useState<Proposal | "new" | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const blank: Proposal = { id: "", title: "", description: "", authorName: "", authorEmoji: "💡",
    status: "open", votesFor: 0, votesAgainst: 0, createdAt: today, category: "その他" };
  const [draft, setDraft] = useState<Proposal>(blank);

  function openAdd() { setDraft({ ...blank, id: uid() }); setModal("new"); }
  function openEdit(p: Proposal) { setDraft({ ...p }); setModal(p); }
  function save() {
    if (!draft.title.trim()) return;
    if (modal === "new") setProposals([...proposals, draft]);
    else setProposals(proposals.map((p) => p.id === draft.id ? draft : p));
    setModal(null);
  }
  function del(id: string) { if (confirm("削除しますか？")) setProposals(proposals.filter((p) => p.id !== id)); }

  const set = <K extends keyof Proposal>(k: K, v: Proposal[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div>
      <TabHeader title="投票・提案" count={proposals.length} onAdd={openAdd} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {proposals.map((p) => (
          <ItemRow
            key={p.id}
            left={
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-t0)", marginBottom: 2 }}>{p.title}</div>
                <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
                  <span style={{ color: "var(--c-t2)" }}>{p.category}</span>
                  <span style={{ color: STATUS_META[p.status].color, fontWeight: 700 }}>{STATUS_META[p.status].label}</span>
                  <span style={{ color: "var(--c-green)" }}>👍 {p.votesFor}</span>
                  <span style={{ color: "var(--c-red)" }}>👎 {p.votesAgainst}</span>
                </div>
              </div>
            }
            onEdit={() => openEdit(p)}
            onDel={() => del(p.id)}
          />
        ))}
      </div>

      {modal !== null && (
        <Overlay onClose={() => setModal(null)}>
          <MHead title={modal === "new" ? "提案追加" : "提案編集"} onClose={() => setModal(null)} />
          <div style={{ padding: "16px 20px" }}>
            <FL label="タイトル"><FTxt v={draft.title} s={(v) => set("title", v)} /></FL>
            <FL label="説明"><FArea v={draft.description} s={(v) => set("description", v)} /></FL>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FL label="カテゴリー"><FTxt v={draft.category} s={(v) => set("category", v)} ph="メニュー / 環境 / チーム..." /></FL>
              <FL label="ステータス"><FSel v={draft.status} s={(v) => set("status", v as ProposalStatus)} opts={PROPOSAL_STATUS} /></FL>
              <FL label="提案者名"><FTxt v={draft.authorName} s={(v) => set("authorName", v)} /></FL>
              <FL label="提案者絵文字"><FTxt v={draft.authorEmoji} s={(v) => set("authorEmoji", v)} /></FL>
              <FL label="賛成票"><FNum v={draft.votesFor} s={(v) => set("votesFor", v)} /></FL>
              <FL label="反対票"><FNum v={draft.votesAgainst} s={(v) => set("votesAgainst", v)} /></FL>
            </div>
            <SaveBtn onClick={save} />
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// パスワード管理
// ─────────────────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
  owner: "オーナー", manager: "マネージャー", staff: "スタッフ",
};
const ROLE_COLORS: Record<string, string> = {
  owner: "#f59e0b", manager: "#60a5fa", staff: "#a78bfa",
};

function PasswordsTab() {
  const { passwords, setPasswords } = useStore();
  const [editId, setEditId]     = useState<string | null>(null);
  const [newPw, setNewPw]       = useState("");
  const [savedId, setSavedId]   = useState<string | null>(null);

  function handleSet(userId: string) {
    const updated = { ...passwords, [userId]: newPw };
    setPasswords(updated);
    setEditId(null);
    setNewPw("");
    setSavedId(userId);
    setTimeout(() => setSavedId(null), 2000);
  }

  function handleReset(userId: string) {
    if (!confirm(`${REGISTERED_USERS.find((u) => u.id === userId)?.name} のパスワードをリセットしますか？`)) return;
    const updated = { ...passwords };
    delete updated[userId];
    setPasswords(updated);
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--c-t0)" }}>パスワード管理</div>
        <div style={{ fontSize: 12, color: "var(--c-t2)", marginTop: 2 }}>
          全ユーザーのパスワード状況を確認・変更・リセットできます
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {REGISTERED_USERS.map((user) => {
          const hasPw = !!passwords[user.id];
          const isEditing = editId === user.id;
          const justSaved = savedId === user.id;
          return (
            <div key={user.id} style={{
              background: "var(--c-bg2)", borderRadius: 10, border: "1px solid var(--c-border)",
              padding: "12px 14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{user.avatarEmoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-t0)" }}>{user.name}</div>
                  <div style={{ display: "flex", gap: 8, fontSize: 11, marginTop: 2 }}>
                    <span style={{ color: ROLE_COLORS[user.role], fontWeight: 700 }}>{ROLE_LABELS[user.role]}</span>
                    <span style={{
                      color: hasPw ? "var(--c-green)" : "var(--c-t2)",
                      fontWeight: hasPw ? 700 : 400,
                    }}>
                      {hasPw ? "パスワード設定済" : "未設定（直接ログイン）"}
                    </span>
                    {justSaved && <span style={{ color: "var(--c-green)", fontWeight: 700 }}>保存しました</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => { setEditId(isEditing ? null : user.id); setNewPw(""); }}
                    style={{
                      padding: "5px 10px", borderRadius: 7, border: "1px solid var(--c-border)",
                      background: isEditing ? "var(--c-xp)" : "var(--c-bg3)",
                      color: isEditing ? "#fff" : "var(--c-t1)",
                      cursor: "pointer", fontSize: 11, fontWeight: 600,
                    }}
                  >
                    {isEditing ? "キャンセル" : hasPw ? "変更" : "設定"}
                  </button>
                  {hasPw && (
                    <button
                      onClick={() => handleReset(user.id)}
                      style={{
                        padding: "5px 10px", borderRadius: 7, border: `1px solid var(--c-red)`,
                        background: "transparent", color: "var(--c-red)",
                        cursor: "pointer", fontSize: 11, fontWeight: 600,
                      }}
                    >
                      リセット
                    </button>
                  )}
                </div>
              </div>
              {isEditing && (
                <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                  <input
                    type="text"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="新しいパスワードを入力"
                    style={{ ...fi, flex: 1 }}
                    onKeyDown={(e) => { if (e.key === "Enter" && newPw.length >= 4) handleSet(user.id); }}
                    autoFocus
                  />
                  <button
                    onClick={() => handleSet(user.id)}
                    disabled={newPw.length < 4}
                    style={{
                      padding: "8px 14px", borderRadius: 8, border: "none",
                      background: newPw.length >= 4 ? "var(--c-xp)" : "var(--c-bg3)",
                      color: newPw.length >= 4 ? "#fff" : "var(--c-t2)",
                      cursor: newPw.length >= 4 ? "pointer" : "not-allowed",
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}
                  >
                    保存
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main Admin screen
// ─────────────────────────────────────────────────────────
export function Admin() {
  const [tab, setTab] = useState<TabId>("pos");

  function renderTab() {
    switch (tab) {
      case "pos":       return <POSTab />;
      case "shop":      return <ShopTab />;
      case "missions":  return <MissionsTab />;
      case "badges":    return <BadgesTab />;
      case "inventory": return <InventoryTab />;
      case "wiki":      return <WikiTab />;
      case "proposals": return <ProposalsTab />;
      case "passwords": return <PasswordsTab />;
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: "rgba(90,40,176,0.1)", border: "1px solid rgba(90,40,176,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Database size={17} color="var(--c-fp)" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "var(--c-t0)" }}>データ管理</h1>
          <p style={{ margin: 0, fontSize: 12, color: "var(--c-t2)" }}>アイテム・ミッション・バッジなどの追加・編集・削除</p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24, padding: "10px", background: "var(--c-bg2)", borderRadius: 12 }}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
              borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: active ? 700 : 500,
              background: active ? "var(--c-xp)" : "transparent",
              color: active ? "#fff" : "var(--c-t1)",
              transition: "all 0.15s",
            }}>
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {renderTab()}
    </div>
  );
}
