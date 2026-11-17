import type { ReactNode } from "react";
import { statusClass } from "./status";

export function StatusPill({ status, label }: { status: string; label?: string }) {
  return <span className={statusClass(status)}>{label || status.replace(/_/g, " ")}</span>;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-page-head">
      <div>
        <span className="admin-eyebrow">{eyebrow}</span>
        <h1 className="admin-page-title">{title}</h1>
        {subtitle ? <p className="admin-page-sub">{subtitle}</p> : null}
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </header>
  );
}

export function MetricCard({
  icon,
  label,
  value,
  suffix,
  foot,
  tone = "accent",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  suffix?: ReactNode;
  foot?: ReactNode;
  tone?: "accent" | "green" | "blue" | "yellow" | "red";
}) {
  const colors: Record<string, { tone: string; soft: string }> = {
    accent: { tone: "var(--adm-accent)", soft: "var(--adm-accent-soft)" },
    green: { tone: "var(--adm-green)", soft: "var(--adm-green-soft)" },
    blue: { tone: "var(--adm-blue)", soft: "var(--adm-blue-soft)" },
    yellow: { tone: "var(--adm-yellow)", soft: "var(--adm-yellow-soft)" },
    red: { tone: "var(--adm-red)", soft: "var(--adm-red-soft)" },
  };
  const palette = colors[tone] || colors.accent;

  return (
    <article
      className="admin-metric"
      style={
        {
          "--tone": palette.tone,
          "--tone-soft": palette.soft,
        } as React.CSSProperties
      }
    >
      <div className="admin-metric-top">
        <span className="admin-metric-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="admin-metric-label">{label}</span>
      </div>
      <p className="admin-metric-value">
        {value}
        {suffix ? <small>{suffix}</small> : null}
      </p>
      {foot ? <div className="admin-metric-foot">{foot}</div> : null}
    </article>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="admin-empty">
      <strong>{title}</strong>
      {children ? <p>{children}</p> : null}
      {action ? <div style={{ marginTop: 14 }}>{action}</div> : null}
    </div>
  );
}

export function CardHead({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="admin-card-head">
      <div>
        <h2 className="admin-card-title">{title}</h2>
        {subtitle ? <p className="admin-card-sub">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
