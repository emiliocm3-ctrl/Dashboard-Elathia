import React from "react";
import { useTranslation } from "react-i18next";
import "./shared.css";

const SEVERITY_STYLES = {
  ok: { icon: "✓", bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
  warning: { icon: "⚠", bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  critical: { icon: "⛔", bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
};

export default function InsightsPanel({ insights = [], loading = false, onRefresh }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="insights-panel">
        <div className="insights-panel__header">
          <h3>{t('insights.title')}</h3>
        </div>
        <div className="insights-panel__loading">{t('insights.loading')}</div>
      </div>
    );
  }

  if (!insights.length) return null;

  return (
    <div className="insights-panel">
      <div className="insights-panel__header">
        <h3>{t('insights.title')}</h3>
        {onRefresh && (
          <button className="insights-panel__refresh" type="button" onClick={onRefresh}>
            {t('dashboard.refresh')}
          </button>
        )}
      </div>
      <div className="insights-panel__list">
        {insights.map((insight) => {
          const style = SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.ok;
          return (
            <div
              key={insight.id}
              className="insights-panel__item"
              style={{ background: style.bg, borderColor: style.border, color: style.color }}
            >
              <span className="insights-panel__icon">{style.icon}</span>
              <div className="insights-panel__content">
                <strong>{insight.title}</strong>
                <p>{insight.description}</p>
                {insight.action && <p className="insights-panel__action">{insight.action}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
