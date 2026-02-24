import React from "react";
import "./shared.css";

const STATUS_COLORS = {
  ok: "#10B981",
  warning: "#F59E0B",
  critical: "#EF4444",
};

const STATUS_LABELS = {
  ok: "Bien",
  warning: "Atención",
  critical: "Urgente",
};

export default function HealthBadge({ status = "ok", size = "md", showLabel = false }) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.ok;
  const sizes = { sm: 12, md: 20, lg: 32 };
  const px = sizes[size] || sizes.md;

  return (
    <span className={`health-badge health-badge--${size}`} aria-label={STATUS_LABELS[status]}>
      <span
        className="health-badge__dot"
        style={{ width: px, height: px, backgroundColor: color }}
      />
      {showLabel && (
        <span className="health-badge__label" style={{ color }}>
          {STATUS_LABELS[status]}
        </span>
      )}
    </span>
  );
}
