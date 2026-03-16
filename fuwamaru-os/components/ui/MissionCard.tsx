import { CheckCircle, FileText, Calendar, Star, TrendingUp, Zap, Gem } from "lucide-react";
import type { Mission } from "@/lib/types";
import { Chip } from "./Chip";
import { ProgBar } from "./ProgBar";

// ミッションタイプ別アイコン
const MISSION_ICON_MAP: Record<string, React.ElementType> = {
  日報: FileText,
  シフト: Calendar,
  ラテ: Star,
  アップ: TrendingUp,
};

const DIFFICULTY_COLORS: Record<Mission["difficulty"], string> = {
  EASY: "#34d399",
  NORMAL: "#f59e0b",
  HARD: "#f97316",
  LEGENDARY: "#a78bfa",
};

const TYPE_COLORS: Record<Mission["type"], string> = {
  DAILY: "#60a5fa",
  WEEKLY: "#a78bfa",
  SPECIAL: "#f59e0b",
};

function getMissionIcon(title: string): React.ElementType {
  for (const [key, Icon] of Object.entries(MISSION_ICON_MAP)) {
    if (title.includes(key)) return Icon;
  }
  return Star;
}

interface MissionCardProps {
  mission: Mission;
}

export function MissionCard({ mission }: MissionCardProps) {
  const completed = mission.progress >= mission.total;
  const Icon = getMissionIcon(mission.title);
  const diffColor = DIFFICULTY_COLORS[mission.difficulty];
  const typeColor = TYPE_COLORS[mission.type];

  return (
    <div
      style={{
        background: completed ? `${DIFFICULTY_COLORS.EASY}08` : "var(--c-bg3)",
        border: `1px solid ${completed ? DIFFICULTY_COLORS.EASY + "38" : "var(--c-border)"}`,
        borderRadius: 11,
        padding: "14px 16px",
        transition: "border-color 0.2s",
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            flexShrink: 0,
            background: completed ? `${DIFFICULTY_COLORS.EASY}18` : "var(--c-xp)11",
            border: `1px solid ${completed ? DIFFICULTY_COLORS.EASY + "38" : "var(--c-xp)28"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {completed ? (
            <CheckCircle size={17} color={DIFFICULTY_COLORS.EASY} />
          ) : (
            <Icon size={17} color="var(--c-xp)" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: completed ? DIFFICULTY_COLORS.EASY : "var(--c-t0)",
              }}
            >
              {mission.title}
            </span>
            <Chip color={diffColor}>{mission.difficulty}</Chip>
            <Chip color={typeColor}>{mission.type}</Chip>
          </div>
          <p style={{ margin: "0 0 9px", fontSize: 11.5, color: "var(--c-t1)" }}>
            {mission.description}
          </p>
          <div className="flex items-center gap-2">
            <ProgBar
              value={mission.progress}
              max={mission.total}
              color={completed ? DIFFICULTY_COLORS.EASY : "var(--c-xp)"}
              height={4}
            />
            <span style={{ fontSize: 10.5, color: "var(--c-t2)", flexShrink: 0 }}>
              {mission.progress}/{mission.total}
            </span>
          </div>
        </div>

        {/* Rewards */}
        <div
          className="flex flex-col items-end gap-1"
          style={{ flexShrink: 0, paddingLeft: 4 }}
        >
          <div className="flex items-center gap-1">
            <Zap size={11} color="var(--c-xp)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--c-xp)" }}>
              +{mission.xpReward}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Gem size={11} color="var(--c-fp)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--c-fp)" }}>
              +{mission.fpReward}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
