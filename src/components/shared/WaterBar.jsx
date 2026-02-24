import React from "react";
import { useTranslation } from "react-i18next";
import "./shared.css";

const LEVEL_COLORS = {
  full: "#10B981",
  good: "#3B82F6",
  low: "#F59E0B",
  dry: "#EF4444",
  unknown: "#9CA3AF",
};

const LEVEL_GRADIENTS = {
  full: "linear-gradient(90deg, #34d399, #10B981)",
  good: "linear-gradient(90deg, #60a5fa, #3B82F6)",
  low: "linear-gradient(90deg, #fbbf24, #F59E0B)",
  dry: "linear-gradient(90deg, #f87171, #EF4444)",
  unknown: "linear-gradient(90deg, #d1d5db, #9CA3AF)",
};

export default function WaterBar({ level = "unknown", label = "--", percent = 0 }) {
  const { t } = useTranslation();
  const color = LEVEL_COLORS[level] || LEVEL_COLORS.unknown;
  const gradient = LEVEL_GRADIENTS[level] || LEVEL_GRADIENTS.unknown;
  const clampedPercent = Math.max(0, Math.min(100, percent));

  return (
    <div className="water-bar">
      <div className="water-bar__header">
        <span className="water-bar__title">💧 {t('metrics.waterAvailable')}</span>
        <span className="water-bar__label" style={{ color }}>{label}</span>
      </div>
      <div className="water-bar__track">
        <div
          className="water-bar__fill water-bar__fill--animated"
          style={{
            width: `${clampedPercent}%`,
            background: gradient,
          }}
        >
          {clampedPercent > 15 && (
            <span className="water-bar__droplet">💧</span>
          )}
        </div>
      </div>
      <div className="water-bar__labels">
        <span>{t('water.dry')}</span>
        <span>{t('water.low')}</span>
        <span>{t('water.good')}</span>
        <span>{t('water.full')}</span>
      </div>
    </div>
  );
}
