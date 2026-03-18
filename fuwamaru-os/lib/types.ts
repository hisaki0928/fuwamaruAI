import type { LucideIcon } from "lucide-react";

// ─────────────────────────────────────────────────────────
// 権限ロール
// ─────────────────────────────────────────────────────────
export type Role = "owner" | "manager" | "staff";

// ─────────────────────────────────────────────────────────
// 画面遷移
// ─────────────────────────────────────────────────────────
export type Screen = "login" | "dashboard";

// ─────────────────────────────────────────────────────────
// ナビゲーション ID（全機能を網羅）
// ─────────────────────────────────────────────────────────
export type NavId =
  | "dashboard"
  // 実務
  | "pos"
  | "shift"
  | "timeclock"
  | "report"
  | "inventory"
  // ゲーム
  | "missions"
  | "badges"
  | "ranking"
  | "shop"
  // コミュニティ
  | "community"
  | "wiki"
  | "vote"
  // システム
  | "settings"
  | "admin";

// ─────────────────────────────────────────────────────────
// ユーザー
// ─────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  nickname: string;
  role: Role;
  title: string;
  level: number;
  xp: number;
  xpMax: number;
  fp: number;
  streak: number;
  themeColor: string;
  password?: string;       // オーナー・マネージャーのみ設定
  avatarEmoji?: string;    // カスタム絵文字アバター
}

// ─────────────────────────────────────────────────────────
// ミッション
// ─────────────────────────────────────────────────────────
export type MissionType = "DAILY" | "WEEKLY" | "SPECIAL";
export type Difficulty = "EASY" | "NORMAL" | "HARD" | "LEGENDARY";

export interface Mission {
  id: number;
  title: string;
  description: string;
  xpReward: number;
  fpReward: number;
  progress: number;
  total: number;
  type: MissionType;
  difficulty: Difficulty;
  claimed?: boolean;
}

// ─────────────────────────────────────────────────────────
// バッジ
// ─────────────────────────────────────────────────────────
export type BadgeCategory = "接客" | "バリスタ" | "チームワーク" | "継続" | "特別";

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: BadgeCategory;
  earned: boolean;
  earnedAt?: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  xpReward: number;
}

// ─────────────────────────────────────────────────────────
// ランキング
// ─────────────────────────────────────────────────────────
export type RankType = "xp" | "fp" | "streak";

export interface RankingEntry {
  userId: string;
  name: string;
  nickname: string;
  level: number;
  avatarEmoji: string;
  themeColor: string;
  xp: number;
  fp: number;
  streak: number;
}

// ─────────────────────────────────────────────────────────
// 日報
// ─────────────────────────────────────────────────────────
export interface ReportScore {
  customer: number;    // 接客力
  proposal: number;   // 提案力
  teamwork: number;   // チームワーク
  growth: number;     // 成長意欲
  total: number;
}

export interface DailyReport {
  id: string;
  date: string;
  content: string;
  score?: ReportScore;
  xpEarned?: number;
  submittedAt?: string;
}

// ─────────────────────────────────────────────────────────
// シフト
// ─────────────────────────────────────────────────────────
export type ShiftStatus = "confirmed" | "pending" | "off";

export interface ShiftEntry {
  date: string;        // YYYY-MM-DD
  start?: string;      // HH:MM
  end?: string;        // HH:MM
  status: ShiftStatus;
  note?: string;
}

// ─────────────────────────────────────────────────────────
// タイムカード
// ─────────────────────────────────────────────────────────
export interface TimeRecord {
  date: string;
  clockIn: string;
  clockOut?: string;
  breakMinutes: number;
  totalMinutes?: number;
}

// ─────────────────────────────────────────────────────────
// FP ショップ
// ─────────────────────────────────────────────────────────
export type ShopCategory = "特典" | "アバター" | "称号" | "消耗品";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: ShopCategory;
  fpCost: number;
  limited?: boolean;
  soldOut?: boolean;
}

// ─────────────────────────────────────────────────────────
// POS レジ
// ─────────────────────────────────────────────────────────
export type POSCategory = "ドリンク" | "フード" | "デザート";

// POS item → inventory ingredient mapping
export interface POSIngredient {
  inventoryId: string;  // InventoryItem.id
  amount: number;       // 1回の販売で消費する量
}

export interface POSItem {
  id: string;
  name: string;
  emoji: string;
  category: POSCategory;
  price: number;
  imageUrl?: string;          // base64 or URL
  ingredients?: POSIngredient[]; // 在庫連携
}

export interface CartItem {
  item: POSItem;
  qty: number;
}

// ─────────────────────────────────────────────────────────
// 在庫管理
// ─────────────────────────────────────────────────────────
export type InvCategory = "豆・粉" | "乳製品" | "シロップ" | "フード材料" | "カップ・器材";
export type StockStatus = "ok" | "low" | "critical";

export interface InventoryItem {
  id: string;
  name: string;
  category: InvCategory;
  stock: number;
  par: number;
  unit: string;
  status: StockStatus;
}

// ─────────────────────────────────────────────────────────
// コミュニティ
// ─────────────────────────────────────────────────────────
export type PostType = "normal" | "bonus" | "achievement" | "notice";

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorEmoji: string;
  type: PostType;
  content: string;
  time: string;
  likes: number;
  bonusAmount?: number;
  targetName?: string;
}

// ─────────────────────────────────────────────────────────
// Wiki
// ─────────────────────────────────────────────────────────
export type WikiCategory = "接客マニュアル" | "ドリンクレシピ" | "衛生管理" | "緊急対応" | "新人研修";

export interface WikiArticle {
  id: string;
  title: string;
  category: WikiCategory;
  summary: string;
  content: string;
  author: string;
  updatedAt: string;
  views: number;
}

// ─────────────────────────────────────────────────────────
// 投票・提案
// ─────────────────────────────────────────────────────────
export type ProposalStatus = "open" | "closed" | "implemented";

export interface Proposal {
  id: string;
  title: string;
  description: string;
  authorName: string;
  authorEmoji: string;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  createdAt: string;
  category: string;
}

// ─────────────────────────────────────────────────────────
// ナビゲーション
// ─────────────────────────────────────────────────────────
export interface NavItem {
  id: NavId;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  section: string | null;
  items: NavItem[];
}

// ─────────────────────────────────────────────────────────
// 統計カード
// ─────────────────────────────────────────────────────────
export interface Stat {
  label: string;
  value: string;
  sub: string;
  trend: "up" | "down" | "neutral";
}

// ─────────────────────────────────────────────────────────
// 在庫変更履歴
// ─────────────────────────────────────────────────────────
export interface InventoryLog {
  id: string;
  itemId: string;
  itemName: string;
  before: number;
  after: number;
  unit: string;
  changedAt: string;
  reason: "checkout" | "manual" | "adjustment";
}

// ─────────────────────────────────────────────────────────
// 提供待ち注文
// ─────────────────────────────────────────────────────────
export interface PendingOrder {
  id: string;
  orderNo: number;
  items: { name: string; emoji: string; qty: number }[];
  total: number;
  createdAt: string;
  status: "pending" | "served";
}

// ─────────────────────────────────────────────────────────
// アプリ状態
// ─────────────────────────────────────────────────────────
export interface AppState {
  screen: Screen;
  currentUser: User | null;
  activeNav: NavId;
}
