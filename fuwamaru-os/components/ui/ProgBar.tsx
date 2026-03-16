interface ProgBarProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
  className?: string;
}

export function ProgBar({
  value,
  max,
  color = "var(--c-xp)",
  height = 5,
  className = "",
}: ProgBarProps) {
  const pct = Math.min(100, max > 0 ? Math.round((value / max) * 100) : 0);

  return (
    <div
      className={`rounded-full overflow-hidden flex-1 ${className}`}
      style={{ background: "var(--c-bg5)", height }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: height,
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}
