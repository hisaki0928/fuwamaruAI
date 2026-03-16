import { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  color: string;
  size?: "sm" | "md";
}

export function Chip({ children, color, size = "sm" }: ChipProps) {
  const padding = size === "md" ? "2px 9px" : "1px 6px";
  const fontSize = size === "md" ? 11 : 10;

  return (
    <span
      style={{
        background: `${color}18`,
        color,
        border: `1px solid ${color}38`,
        borderRadius: 4,
        padding,
        fontSize,
        fontWeight: 700,
        letterSpacing: 0.8,
        whiteSpace: "nowrap",
        lineHeight: 1.6,
      }}
    >
      {children}
    </span>
  );
}
