import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  eyebrowIcon?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  statusBadge?: ReactNode;
}

export default function PageHeader({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  actions,
  statusBadge,
}: PageHeaderProps) {
  return (
    <header className="page-heading" style={{ marginBottom: "1.5rem" }}>
      <div>
        {eyebrow && (
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {eyebrowIcon}
            <span>{eyebrow}</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <h1 style={{ margin: "0.25rem 0" }}>{title}</h1>
          {statusBadge}
        </div>
        {description && <p style={{ margin: 0, color: "var(--text-secondary, #64748b)" }}>{description}</p>}
      </div>
      {actions && <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>{actions}</div>}
    </header>
  );
}

