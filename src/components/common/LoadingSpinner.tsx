import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  label?: string;
  size?: number;
}

export default function LoadingSpinner({
  label = "Cargando datos...",
  size = 24,
}: LoadingSpinnerProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        gap: "0.75rem",
        color: "var(--text-secondary, #64748b)",
      }}
      role="status"
    >
      <Loader2
        size={size}
        className="animate-spin"
        style={{ animation: "spin 1s linear infinite", color: "var(--primary-color, #4f46e5)" }}
      />
      <span style={{ fontSize: "0.9rem" }}>{label}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

