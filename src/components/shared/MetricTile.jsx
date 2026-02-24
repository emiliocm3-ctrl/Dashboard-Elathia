import React from "react";
import { ASSETS } from "../../config/assets";
import "./shared.css";

const TREND_ARROWS = {
  up: "↑",
  down: "↓",
  stable: "→",
};

const TREND_LABELS = {
  up: "Subiendo",
  down: "Bajando",
  stable: "Estable",
};

export default function MetricTile({ icon, label, value, unit, trend, status = "ok" }) {
  const iconSrc = ASSETS.metricIcons?.[icon];

  return (
    <div className={`metric-tile metric-tile--${status}`}>
      {iconSrc && <img className="metric-tile__icon" src={iconSrc} alt="" />}
      <div className="metric-tile__body">
        <span className="metric-tile__value">
          {value}<span className="metric-tile__unit">{unit}</span>
        </span>
        <span className="metric-tile__label">{label}</span>
      </div>
      {trend && (
        <span className={`metric-tile__trend metric-tile__trend--${trend}`} aria-label={TREND_LABELS[trend]}>
          {TREND_ARROWS[trend]}
        </span>
      )}
    </div>
  );
}
