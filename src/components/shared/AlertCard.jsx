import React from "react";
import "./shared.css";

const SEVERITY_ICONS = {
  warning: "⚠",
  critical: "⛔",
};

export default function AlertCard({ severity = "warning", message }) {
  if (!message) return null;
  return (
    <div className={`alert-card alert-card--${severity}`}>
      <span className="alert-card__icon">{SEVERITY_ICONS[severity] || "⚠"}</span>
      <span className="alert-card__message">{message}</span>
    </div>
  );
}
