import type { ReactNode } from "react";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  children: ReactNode;
  tone?: StatusTone;
  icon?: ReactNode;
  className?: string;
}

const toneStyles: Record<StatusTone, { bg: string; text: string; border: string }> = {
  success: { bg: "rgba(16, 185, 129, 0.12)", text: "#059669", border: "rgba(16, 185, 129, 0.25)" },
  warning: { bg: "rgba(245, 158, 11, 0.12)", text: "#d97706", border: "rgba(245, 158, 11, 0.25)" },
  danger: { bg: "rgba(239, 68, 68, 0.12)", text: "#dc2626", border: "rgba(239, 68, 68, 0.25)" },
  info: { bg: "rgba(14, 165, 233, 0.12)", text: "#0284c7", border: "rgba(14, 165, 233, 0.25)" },
  neutral: { bg: "rgba(100, 116, 139, 0.12)", text: "#475569", border: "rgba(100, 116, 139, 0.25)" },
};

export default function StatusBadge({
  children,
  tone = "neutral",
  icon,
  className = "",
}: StatusBadgeProps) {
  const style = toneStyles[tone];

  return (
    <span
      className={`status-badge ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.2rem 0.6rem",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        lineHeight: 1.2,
      }}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}

