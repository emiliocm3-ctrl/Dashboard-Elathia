import React from "react";
import { useTranslation } from "react-i18next";
import HealthBadge from "../shared/HealthBadge";
import {
  getOverallHealth,
  getHealthSummary,
  getAvgMetrics,
  formatValue,
} from "../../utils/formatters";
import "./user.css";

export default function UserRanchCard({ ranch, onViewRanch, style }) {
  const { t } = useTranslation();
  const health = getOverallHealth(ranch.sectors);
  const summary = getHealthSummary(ranch.sectors);
  const avg = getAvgMetrics(ranch.sectors);
  const sectorCount = ranch.sectors?.length || 0;

  const gradientClass = health === 'critical' ? 'user-ranch-card--critical'
    : health === 'warning' ? 'user-ranch-card--warning'
    : 'user-ranch-card--healthy';

  return (
    <button
      className={`user-ranch-card ${gradientClass}`}
      type="button"
      onClick={() => onViewRanch(ranch)}
      aria-label={`${t('nav.home')} ${ranch.name}`}
      style={style}
    >
      <div className="user-ranch-card__header">
        <HealthBadge status={health} size="lg" />
        <div className="user-ranch-card__info">
          <h3 className="user-ranch-card__name">{ranch.name}</h3>
          <span className="user-ranch-card__count">
            {sectorCount} {t('dashboard.sectors').toLowerCase()}
          </span>
        </div>
        <span className="user-ranch-card__arrow">›</span>
      </div>

      <div className="user-ranch-card__metrics">
        {avg.temp !== null && (
          <div className="user-ranch-card__metric">
            <span className="user-ranch-card__metric-value">{formatValue(avg.temp)}°</span>
            <span className="user-ranch-card__metric-label">{t('metrics.temperature')}</span>
          </div>
        )}
        {avg.hum !== null && (
          <div className="user-ranch-card__metric">
            <span className="user-ranch-card__metric-value">{avg.hum}%</span>
            <span className="user-ranch-card__metric-label">{t('metrics.humidity')}</span>
          </div>
        )}
      </div>

      <div className="user-ranch-card__summary">{summary}</div>
    </button>
  );
}
