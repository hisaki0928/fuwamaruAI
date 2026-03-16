interface CircleLevelProps {
  level: number;
  xp: number;
  xpMax: number;
  size?: number;
  strokeWidth?: number;
}

export function CircleLevel({
  level,
  xp,
  xpMax,
  size = 76,
  strokeWidth = 5,
}: CircleLevelProps) {
  const pct = xpMax > 0 ? xp / xpMax : 0;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        margin: "0 auto 14px",
      }}
    >
      {/* SVG ring */}
      <svg
        width={size}
        height={size}
        style={{
          transform: "rotate(-90deg)",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--c-bg3)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--c-xp)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${pct * circ} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
      </svg>

      {/* Center label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: "var(--c-xp)",
            letterSpacing: 1.2,
          }}
        >
          Lv
        </span>
        <span
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: "var(--c-t0)",
            lineHeight: 1,
          }}
        >
          {level}
        </span>
      </div>
    </div>
  );
}
