import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const sizeStyles = {
  sm: { padding: "0.35rem 0.65rem", fontSize: "0.8rem" },
  md: { padding: "0.5rem 1rem", fontSize: "0.875rem" },
  lg: { padding: "0.75rem 1.25rem", fontSize: "1rem" },
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  icon,
  children,
  className = "",
  style,
  ...props
}: ButtonProps) {
  const baseClass =
    variant === "primary"
      ? "primary-button"
      : variant === "danger"
      ? "danger-button"
      : "secondary-button";

  return (
    <button
      className={`${baseClass} ${className}`}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.65 : 1,
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
      ) : (
        icon
      )}
      <span>{children}</span>
    </button>
  );
}

