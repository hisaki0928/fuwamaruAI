import type {
  User, Mission, NavGroup, Badge, RankingEntry,
  DailyReport, ShiftEntry, TimeRecord, ShopItem,
  POSItem, InventoryItem, CommunityPost, WikiArticle, Proposal, Stat,
} from "./types";
import {
  LayoutDashboard, ShoppingCart, Calendar, Clock,
  FileText, Package, Trophy, Award, BarChart2,
  ShoppingBag, Users, BookOpen, ThumbsUp, Settings,
} from "lucide-react";

// ─────────────────────────────────────────────────────────
// 登録済みユーザー一覧（ログイン画面で表示）
// ─────────────────────────────────────────────────────────
export const REGISTERED_USERS: User[] = [
  // 管理者
  {
    id: "owner-1",
    name: "鈴木 健太",
    nickname: "健太",
    role: "owner",
    title: "カフェの創始者",
    level: 30,
    xp: 18500,
    xpMax: 20000,
    fp: 5200,
    streak: 30,
    themeColor: "#f59e0b",
    password: "owner1234",
    avatarEmoji: "👑",
  },
  {
    id: "manager-1",
    name: "山田 花子",
    nickname: "花子",
    role: "manager",
    title: "伝説のバリスタ",
    level: 20,
    xp: 8800,
    xpMax: 10000,
    fp: 2800,
    streak: 18,
    themeColor: "#60a5fa",
    password: "mgr1234",
    avatarEmoji: "🛡️",
  },
  // スタッフ
  {
    id: "staff-1",
    name: "田中 あかり",
    nickname: "あかり",
    role: "staff",
    title: "コーヒーの魔術師",
    level: 12,
    xp: 2450,
    xpMax: 3000,
    fp: 850,
    streak: 7,
    themeColor: "#a78bfa",
    avatarEmoji: "⚡",
  },
  {
    id: "staff-2",
    name: "佐藤 ひな",
    nickname: "ひな",
    role: "staff",
    title: "笑顔の接客王",
    level: 8,
    xp: 1200,
    xpMax: 1500,
    fp: 420,
    streak: 4,
    themeColor: "#f472b6",
    avatarEmoji: "🌸",
  },
  {
    id: "staff-3",
    name: "木村 そら",
    nickname: "そら",
    role: "staff",
    title: "ラテアートの新星",
    level: 5,
    xp: 600,
    xpMax: 800,
    fp: 180,
    streak: 2,
    themeColor: "#34d399",
    avatarEmoji: "🍃",
  },
  {
    id: "staff-4",
    name: "中村 りく",
    nickname: "りく",
    role: "staff",
    title: "まだ見ぬ才能",
    level: 3,
    xp: 200,
    xpMax: 400,
    fp: 60,
    streak: 1,
    themeColor: "#fb923c",
    avatarEmoji: "🔥",
  },
];

// ID → User のマップ
export const USERS_BY_ID: Record<string, User> = Object.fromEntries(
  REGISTERED_USERS.map((u) => [u.id, u])
);

// 後方互換（ダッシュボード等で role ベースで参照している箇所用）
export const MOCK_USERS: Record<string, User> = {
  owner: REGISTERED_USERS[0],
  manager: REGISTERED_USERS[1],
  staff: REGISTERED_USERS[2],
};

// ─────────────────────────────────────────────────────────
// ミッション
// ─────────────────────────────────────────────────────────
export const MOCK_MISSIONS: Mission[] = [
  {
    id: 1, title: "ラテアート 3杯達成", type: "DAILY", difficulty: "EASY",
    description: "今日のラテアート目標をクリアしよう",
    xpReward: 50, fpReward: 20, progress: 2, total: 3,
  },
  {
    id: 2, title: "アップセル 5回成功", type: "DAILY", difficulty: "NORMAL",
    description: "デザートやサイズアップを提案しよう",
    xpReward: 100, fpReward: 40, progress: 3, total: 5,
  },
  {
    id: 3, title: "日報を提出する", type: "DAILY", difficulty: "EASY",
    description: "今日の業務振り返りを記録しよう",
    xpReward: 30, fpReward: 10, progress: 0, total: 1,
  },
  {
    id: 4, title: "来週のシフトを提出", type: "WEEKLY", difficulty: "NORMAL",
    description: "希望シフトを期限内に提出しよう",
    xpReward: 80, fpReward: 30, progress: 0, total: 1,
  },
  {
    id: 5, title: "接客評価 5つ星を 3回獲得", type: "WEEKLY", difficulty: "HARD",
    description: "お客様から満点評価をもらおう",
    xpReward: 200, fpReward: 80, progress: 1, total: 3,
  },
  {
    id: 6, title: "30日連続出勤", type: "SPECIAL", difficulty: "LEGENDARY",
    description: "伝説の皆勤賞を達成せよ",
    xpReward: 1000, fpReward: 500, progress: 7, total: 30,
  },
];

// ─────────────────────────────────────────────────────────
// バッジ
// ─────────────────────────────────────────────────────────
export const MOCK_BADGES: Badge[] = [
  { id: "b1", name: "接客マスター", emoji: "🏆", category: "接客", rarity: "RARE",
    description: "接客評価 5つ星を 10回達成", earned: true, earnedAt: "2025-03-10", xpReward: 200 },
  { id: "b2", name: "ファーストスター", emoji: "⭐", category: "継続", rarity: "COMMON",
    description: "初回ログインを達成", earned: true, earnedAt: "2025-01-15", xpReward: 50 },
  { id: "b3", name: "ラテアート師範", emoji: "🎨", category: "バリスタ", rarity: "EPIC",
    description: "ラテアートミッションを 50回クリア", earned: false, xpReward: 500 },
  { id: "b4", name: "7日連続", emoji: "🔥", category: "継続", rarity: "COMMON",
    description: "7日間連続でログイン", earned: true, earnedAt: "2025-03-11", xpReward: 100 },
  { id: "b5", name: "チームの要", emoji: "🤝", category: "チームワーク", rarity: "RARE",
    description: "ピアボーナスを 20回送る", earned: false, xpReward: 300 },
  { id: "b6", name: "AI高評価", emoji: "🤖", category: "継続", rarity: "RARE",
    description: "日報 AI スコア 90点以上を 5回達成", earned: false, xpReward: 250 },
  { id: "b7", name: "アップセル王", emoji: "💰", category: "接客", rarity: "EPIC",
    description: "アップセル成功率 80%以上を 1週間維持", earned: false, xpReward: 400 },
  { id: "b8", name: "伝説の皆勤", emoji: "👑", category: "継続", rarity: "LEGENDARY",
    description: "30日連続出勤を達成", earned: false, xpReward: 1000 },
  { id: "b9", name: "初日報", emoji: "📝", category: "継続", rarity: "COMMON",
    description: "初めて日報を提出", earned: true, earnedAt: "2025-01-16", xpReward: 30 },
  { id: "b10", name: "在庫マスター", emoji: "📦", category: "バリスタ", rarity: "RARE",
    description: "在庫カウントを 30回完了", earned: false, xpReward: 200 },
  { id: "b11", name: "提案の達人", emoji: "💡", category: "接客", rarity: "COMMON",
    description: "アップセルを 50回成功させる", earned: false, xpReward: 150 },
  { id: "b12", name: "チームMVP", emoji: "🌟", category: "チームワーク", rarity: "LEGENDARY",
    description: "月間ランキング1位を獲得", earned: false, xpReward: 800 },
];

// ─────────────────────────────────────────────────────────
// ランキング
// ─────────────────────────────────────────────────────────
export const MOCK_RANKING: RankingEntry[] = [
  { userId: "owner-1",   name: "鈴木 健太", nickname: "健太", level: 30, avatarEmoji: "👑", themeColor: "#f59e0b", xp: 18500, fp: 5200, streak: 30 },
  { userId: "manager-1", name: "山田 花子", nickname: "花子", level: 20, avatarEmoji: "🛡️", themeColor: "#60a5fa", xp: 8800,  fp: 2800, streak: 18 },
  { userId: "staff-1",   name: "田中 あかり", nickname: "あかり", level: 12, avatarEmoji: "⚡", themeColor: "#a78bfa", xp: 2450,  fp: 850,  streak: 7 },
  { userId: "staff-2",   name: "佐藤 ひな",   nickname: "ひな",  level: 8,  avatarEmoji: "🌸", themeColor: "#f472b6", xp: 1200,  fp: 420,  streak: 4 },
  { userId: "staff-3",   name: "木村 そら",   nickname: "そら",  level: 5,  avatarEmoji: "🍃", themeColor: "#34d399", xp: 600,   fp: 180,  streak: 2 },
  { userId: "staff-4",   name: "中村 りく",   nickname: "りく",  level: 3,  avatarEmoji: "🔥", themeColor: "#fb923c", xp: 200,   fp: 60,   streak: 1 },
];

// ─────────────────────────────────────────────────────────
// 日報履歴
// ─────────────────────────────────────────────────────────
export const MOCK_REPORTS: DailyReport[] = [
  {
    id: "r1", date: "2025-03-11",
    content: "今日はラテアートを3杯達成しました。お客様からも好評で嬉しかったです。アップセルは3/5で少し届きませんでした。明日はもっと積極的に提案します。",
    score: { customer: 88, proposal: 72, teamwork: 90, growth: 85, total: 84 },
    xpEarned: 45, submittedAt: "2025-03-11T18:30:00",
  },
  {
    id: "r2", date: "2025-03-10",
    content: "シフトが混んでいましたが、チームで協力して乗り切りました。在庫チェックも忘れずに完了。",
    score: { customer: 92, proposal: 78, teamwork: 95, growth: 88, total: 88 },
    xpEarned: 60, submittedAt: "2025-03-10T19:00:00",
  },
  {
    id: "r3", date: "2025-03-09",
    content: "新メニューの説明を積極的に行いました。お客様の反応が良くて自信になりました。",
    score: { customer: 95, proposal: 90, teamwork: 82, growth: 92, total: 90 },
    xpEarned: 75, submittedAt: "2025-03-09T18:45:00",
  },
];

// ─────────────────────────────────────────────────────────
// シフト（今月分）
// ─────────────────────────────────────────────────────────
export const MOCK_SHIFTS: ShiftEntry[] = [
  { date: "2025-03-03", start: "09:00", end: "17:00", status: "confirmed" },
  { date: "2025-03-04", start: "13:00", end: "21:00", status: "confirmed" },
  { date: "2025-03-05", status: "off" },
  { date: "2025-03-06", status: "off" },
  { date: "2025-03-07", start: "09:00", end: "17:00", status: "confirmed" },
  { date: "2025-03-08", start: "09:00", end: "17:00", status: "confirmed" },
  { date: "2025-03-10", start: "13:00", end: "21:00", status: "confirmed" },
  { date: "2025-03-11", start: "09:00", end: "17:00", status: "confirmed" },
  { date: "2025-03-12", start: "13:00", end: "21:00", status: "pending", note: "申請中" },
  { date: "2025-03-14", start: "09:00", end: "17:00", status: "confirmed" },
  { date: "2025-03-15", start: "09:00", end: "17:00", status: "confirmed" },
  { date: "2025-03-17", start: "13:00", end: "21:00", status: "confirmed" },
  { date: "2025-03-18", start: "09:00", end: "17:00", status: "confirmed" },
  { date: "2025-03-21", start: "09:00", end: "17:00", status: "confirmed" },
  { date: "2025-03-24", start: "13:00", end: "21:00", status: "confirmed" },
];

// ─────────────────────────────────────────────────────────
// タイムカード
// ─────────────────────────────────────────────────────────
export const MOCK_TIME_RECORDS: TimeRecord[] = [
  { date: "2025-03-11", clockIn: "08:57", clockOut: "17:03", breakMinutes: 60, totalMinutes: 426 },
  { date: "2025-03-10", clockIn: "12:58", clockOut: "21:05", breakMinutes: 60, totalMinutes: 427 },
  { date: "2025-03-08", clockIn: "08:55", clockOut: "17:02", breakMinutes: 60, totalMinutes: 427 },
  { date: "2025-03-07", clockIn: "09:01", clockOut: "17:00", breakMinutes: 60, totalMinutes: 419 },
  { date: "2025-03-04", clockIn: "12:59", clockOut: "21:01", breakMinutes: 60, totalMinutes: 422 },
  { date: "2025-03-03", clockIn: "09:00", clockOut: "17:00", breakMinutes: 60, totalMinutes: 420 },
];

// ─────────────────────────────────────────────────────────
// FP ショップ
// ─────────────────────────────────────────────────────────
export const MOCK_SHOP_ITEMS: ShopItem[] = [
  { id: "s1", name: "早退申請チケット", emoji: "🎟️", category: "特典",
    description: "1回分の早退を申請できるチケット。緊急時に使用可。", fpCost: 300 },
  { id: "s2", name: "有給優先チケット", emoji: "📅", category: "特典",
    description: "希望日の有給を優先的に取得できる権利。", fpCost: 500 },
  { id: "s3", name: "ランチ奢り券", emoji: "🍱", category: "特典",
    description: "オーナーからランチを奢ってもらえる！", fpCost: 200, limited: true },
  { id: "s4", name: "称号「コーヒー仙人」", emoji: "🧙", category: "称号",
    description: "プロフィールに表示される特別な称号。", fpCost: 800 },
  { id: "s5", name: "称号「笑顔の王様」", emoji: "😄", category: "称号",
    description: "接客スキルの証明となる称号。", fpCost: 600 },
  { id: "s6", name: "アバター「ゴールドフレーム」", emoji: "✨", category: "アバター",
    description: "アバターにゴールドの縁取りが付く。", fpCost: 400 },
  { id: "s7", name: "XP ブースター (×2, 24h)", emoji: "⚡", category: "消耗品",
    description: "24時間、獲得XPが2倍になる。", fpCost: 150 },
  { id: "s8", name: "ミッション難易度DOWN", emoji: "🎯", category: "消耗品",
    description: "今日のミッション難易度を1段階下げる。", fpCost: 100 },
  { id: "s9", name: "ピアボーナス 2倍券", emoji: "💝", category: "消耗品",
    description: "次のピアボーナスの効果が2倍になる。", fpCost: 80 },
  { id: "s10", name: "誕生日特別メニュー権", emoji: "🎂", category: "特典",
    description: "誕生日月に限定メニューを1品追加できる。", fpCost: 1000, limited: true, soldOut: true },
];

// ─────────────────────────────────────────────────────────
// 統計カード
// ─────────────────────────────────────────────────────────
export const MOCK_STATS: Stat[] = [
  { label: "今日の売上", value: "¥47,280", sub: "+12% 前日比",  trend: "up" },
  { label: "接客件数",   value: "34件",    sub: "目標: 40件",   trend: "neutral" },
  { label: "チームXP",  value: "12,540",  sub: "今週獲得",    trend: "up" },
  { label: "連続出勤",  value: "7日",     sub: "ストリーク中", trend: "up" },
];

// ─────────────────────────────────────────────────────────
// 最近の活動
// ─────────────────────────────────────────────────────────
export const MOCK_ACTIVITY = [
  { text: "「接客マスター」バッジを獲得！",        time: "1時間前",   color: "#f59e0b" },
  { text: "ひなちゃんからピアボーナス +15 FP",    time: "3時間前",   color: "#a78bfa" },
  { text: "日報 AI スコア 88点 (+45 XP)",        time: "昨日 18:30", color: "#34d399" },
  { text: "デイリーミッション 3/4 完了",          time: "昨日 15:10", color: "#60a5fa" },
];

// ─────────────────────────────────────────────────────────
// POS メニュー
// ─────────────────────────────────────────────────────────
export const MOCK_POS_ITEMS: POSItem[] = [
  { id: "p1",  name: "エスプレッソ",       emoji: "☕", category: "ドリンク",  price: 350 },
  { id: "p2",  name: "カフェラテ",          emoji: "🥛", category: "ドリンク",  price: 480 },
  { id: "p3",  name: "カプチーノ",          emoji: "☕", category: "ドリンク",  price: 480 },
  { id: "p4",  name: "アメリカーノ",        emoji: "☕", category: "ドリンク",  price: 400 },
  { id: "p5",  name: "抹茶ラテ",            emoji: "🍵", category: "ドリンク",  price: 520 },
  { id: "p6",  name: "チャイティーラテ",    emoji: "🍵", category: "ドリンク",  price: 520 },
  { id: "p7",  name: "アイスコーヒー",      emoji: "🧊", category: "ドリンク",  price: 430 },
  { id: "p8",  name: "レモネード",          emoji: "🍋", category: "ドリンク",  price: 450 },
  { id: "p9",  name: "クロワッサン",        emoji: "🥐", category: "フード",    price: 280 },
  { id: "p10", name: "アボカドトースト",    emoji: "🥑", category: "フード",    price: 780 },
  { id: "p11", name: "バナナマフィン",      emoji: "🧁", category: "フード",    price: 320 },
  { id: "p12", name: "チキンサンド",        emoji: "🥪", category: "フード",    price: 680 },
  { id: "p13", name: "チーズケーキ",        emoji: "🍰", category: "デザート",  price: 480 },
  { id: "p14", name: "ティラミス",          emoji: "🍮", category: "デザート",  price: 520 },
  { id: "p15", name: "クレームブリュレ",    emoji: "🍮", category: "デザート",  price: 550 },
  { id: "p16", name: "アイスクリーム",      emoji: "🍨", category: "デザート",  price: 380 },
];

// ─────────────────────────────────────────────────────────
// 在庫
// ─────────────────────────────────────────────────────────
export const MOCK_INVENTORY: InventoryItem[] = [
  { id: "i1",  name: "エチオピア エスプレッソ豆", category: "豆・粉",    stock: 3,  par: 10, unit: "kg",   status: "critical" },
  { id: "i2",  name: "コロンビア ドリップ豆",     category: "豆・粉",    stock: 6,  par: 10, unit: "kg",   status: "low" },
  { id: "i3",  name: "デカフェ豆",               category: "豆・粉",    stock: 4,  par: 5,  unit: "kg",   status: "ok" },
  { id: "i4",  name: "全乳 (1L パック)",          category: "乳製品",    stock: 24, par: 30, unit: "本",   status: "low" },
  { id: "i5",  name: "オーツミルク",             category: "乳製品",    stock: 12, par: 15, unit: "本",   status: "ok" },
  { id: "i6",  name: "生クリーム (200ml)",        category: "乳製品",    stock: 8,  par: 10, unit: "本",   status: "ok" },
  { id: "i7",  name: "バニラシロップ",           category: "シロップ",  stock: 2,  par: 6,  unit: "本",   status: "critical" },
  { id: "i8",  name: "キャラメルソース",         category: "シロップ",  stock: 4,  par: 6,  unit: "本",   status: "low" },
  { id: "i9",  name: "抹茶パウダー",             category: "シロップ",  stock: 5,  par: 5,  unit: "袋",   status: "ok" },
  { id: "i10", name: "クロワッサン生地",         category: "フード材料", stock: 20, par: 30, unit: "個",  status: "low" },
  { id: "i11", name: "紙カップ M (50枚入)",       category: "カップ・器材", stock: 8, par: 10, unit: "袋", status: "ok" },
  { id: "i12", name: "紙カップ L (50枚入)",       category: "カップ・器材", stock: 3, par: 10, unit: "袋", status: "critical" },
];

// ─────────────────────────────────────────────────────────
// コミュニティ投稿
// ─────────────────────────────────────────────────────────
export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  { id: "c1", authorId: "staff-2", authorName: "佐藤 ひな", authorEmoji: "🌸", type: "bonus",
    content: "今日も素敵なラテアート！ありがとう😊", time: "30分前", likes: 4,
    bonusAmount: 15, targetName: "田中 あかり" },
  { id: "c2", authorId: "staff-1", authorName: "田中 あかり", authorEmoji: "⚡", type: "achievement",
    content: "7日連続出勤バッジをゲットしました🔥 来月も続けるぞ！", time: "1時間前", likes: 6 },
  { id: "c3", authorId: "manager-1", authorName: "山田 花子", authorEmoji: "🛡️", type: "notice",
    content: "【お知らせ】来週水曜日は仕込みが早いため、9時に全員集合をお願いします。", time: "2時間前", likes: 2 },
  { id: "c4", authorId: "staff-3", authorName: "木村 そら", authorEmoji: "🍃", type: "normal",
    content: "新しいラテアートの型を覚えました！明日みなさんに披露します🎨", time: "3時間前", likes: 5 },
  { id: "c5", authorId: "staff-1", authorName: "田中 あかり", authorEmoji: "⚡", type: "bonus",
    content: "いつもシフト調整ありがとう！助かってます", time: "昨日", likes: 3,
    bonusAmount: 10, targetName: "山田 花子" },
  { id: "c6", authorId: "owner-1", authorName: "鈴木 健太", authorEmoji: "👑", type: "notice",
    content: "【重要】今月の売上目標まであと15%！みんなで頑張りましょう💪", time: "昨日", likes: 8 },
];

// ─────────────────────────────────────────────────────────
// Wiki 記事
// ─────────────────────────────────────────────────────────
export const MOCK_WIKI_ARTICLES: WikiArticle[] = [
  { id: "w1", title: "はじめての接客マニュアル", category: "接客マニュアル",
    summary: "Fuwamaru Cafe の接客の基本を学ぼう。笑顔・挨拶・お見送りの3ステップ。",
    content: "## 接客の基本\n\n### 1. 笑顔\n常に笑顔で対応しましょう...",
    author: "山田 花子", updatedAt: "2025-03-01", views: 42 },
  { id: "w2", title: "エスプレッソの淹れ方", category: "ドリンクレシピ",
    summary: "正しいエスプレッソの抽出方法。豆の量・グラインド・抽出時間の調整法。",
    content: "## エスプレッソ基本レシピ\n\n### 材料\n- 豆: 18g\n- 抽出量: 36ml\n- 時間: 25〜30秒",
    author: "鈴木 健太", updatedAt: "2025-02-15", views: 65 },
  { id: "w3", title: "ラテアートの基礎", category: "ドリンクレシピ",
    summary: "スチームミルクの作り方からハートの描き方まで、ラテアート入門。",
    content: "## ラテアート入門\n\nまず正しいスチームを覚えましょう...",
    author: "田中 あかり", updatedAt: "2025-03-05", views: 58 },
  { id: "w4", title: "衛生管理チェックリスト", category: "衛生管理",
    summary: "開店前・営業中・閉店後の衛生チェック項目一覧。",
    content: "## 開店前チェック\n\n- [ ] 手洗い\n- [ ] エプロン着用\n- [ ] 器材洗浄確認",
    author: "山田 花子", updatedAt: "2025-01-20", views: 31 },
  { id: "w5", title: "クレーム対応マニュアル", category: "緊急対応",
    summary: "お客様からのクレームへの対応手順。初動対応から上長への報告まで。",
    content: "## クレーム対応の基本\n\n1. 傾聴する\n2. 謝罪する\n3. 解決策を提案する",
    author: "鈴木 健太", updatedAt: "2025-02-28", views: 28 },
  { id: "w6", title: "新人研修スケジュール", category: "新人研修",
    summary: "入社から1ヶ月間の研修カリキュラム。OJTと自習のバランス。",
    content: "## 研修プログラム\n\n### 1週目: 基礎知識\n- 接客マニュアル読み込み...",
    author: "山田 花子", updatedAt: "2025-03-10", views: 19 },
];

// ─────────────────────────────────────────────────────────
// 投票・提案
// ─────────────────────────────────────────────────────────
export const MOCK_PROPOSALS: Proposal[] = [
  { id: "v1", title: "営業後のスタッフ全員ミーティング（週1回）",
    description: "毎週金曜の閉店後15分、チーム全体で振り返りをしたい。課題共有とモチベーション維持に繋がると思います。",
    authorName: "田中 あかり", authorEmoji: "⚡", status: "open",
    votesFor: 4, votesAgainst: 1, createdAt: "2025-03-10", category: "チーム" },
  { id: "v2", title: "ビーガンメニューを1品追加する",
    description: "最近ビーガン・ヴィーガン需要が増えています。植物性ミルクを使ったスイーツを1品追加してはどうでしょうか。",
    authorName: "木村 そら", authorEmoji: "🍃", status: "open",
    votesFor: 5, votesAgainst: 0, createdAt: "2025-03-08", category: "メニュー" },
  { id: "v3", title: "ユニフォームのデザイン変更",
    description: "今のユニフォームは少し暗い印象があります。クリーム系の明るい色にリニューアルしたい。",
    authorName: "佐藤 ひな", authorEmoji: "🌸", status: "open",
    votesFor: 3, votesAgainst: 2, createdAt: "2025-03-05", category: "環境" },
  { id: "v4", title: "BGM プレイリストをスタッフで持ち回り制に",
    description: "毎週1人がプレイリストを担当。店の雰囲気づくりに参加できて楽しそう！",
    authorName: "佐藤 ひな", authorEmoji: "🌸", status: "implemented",
    votesFor: 6, votesAgainst: 0, createdAt: "2025-02-20", category: "環境" },
  { id: "v5", title: "スタッフ割引を20%から30%に引き上げ",
    description: "他店との比較でも30%が標準的です。コーヒー好きが集まりやすくなります。",
    authorName: "中村 りく", authorEmoji: "🔥", status: "closed",
    votesFor: 4, votesAgainst: 3, createdAt: "2025-02-01", category: "待遇" },
];

// ─────────────────────────────────────────────────────────
// ナビゲーション（全機能）
// ─────────────────────────────────────────────────────────
export const NAV_GROUPS: NavGroup[] = [
  {
    section: null,
    items: [{ id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard }],
  },
  {
    section: "実務",
    items: [
      { id: "pos",       label: "POS レジ",   icon: ShoppingCart },
      { id: "shift",     label: "シフト管理", icon: Calendar },
      { id: "timeclock", label: "タイムカード", icon: Clock },
      { id: "report",    label: "日報 AI 評価", icon: FileText },
      { id: "inventory", label: "在庫管理",   icon: Package },
    ],
  },
  {
    section: "ゲーム",
    items: [
      { id: "missions", label: "ミッション",  icon: Trophy },
      { id: "badges",   label: "バッジ・実績", icon: Award },
      { id: "ranking",  label: "ランキング",  icon: BarChart2 },
      { id: "shop",     label: "FP ショップ", icon: ShoppingBag },
    ],
  },
  {
    section: "コミュニティ",
    items: [
      { id: "community", label: "コミュニティ", icon: Users },
      { id: "wiki",      label: "Wiki ナレッジ", icon: BookOpen },
      { id: "vote",      label: "投票・提案",    icon: ThumbsUp },
    ],
  },
  {
    section: null,
    items: [{ id: "settings", label: "設定", icon: Settings }],
  },
];
