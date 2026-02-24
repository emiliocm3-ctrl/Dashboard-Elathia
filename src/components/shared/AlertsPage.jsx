import React from "react";
import { useTranslation } from "react-i18next";
import { useAlertHistory } from "../../hooks/useNotifications";
import "./shared.css";

const SEVERITY_ICONS = {
  warning: "⚠️",
  critical: "🔴",
  ok: "✅",
};

function TimeAgo({ timestamp }) {
  const { t } = useTranslation();
  const diff = Date.now() - new Date(timestamp).getTime();
  if (isNaN(diff) || diff < 0) return null;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return <span>{t('time.justNow')}</span>;
  if (mins < 60) return <span>{t('time.minutesAgo', { count: mins })}</span>;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return <span>{t('time.hoursAgo', { count: hours })}</span>;
  return <span>{t('time.daysAgo', { count: Math.floor(hours / 24) })}</span>;
}

export default function AlertsPage() {
  const { t } = useTranslation();
  const { alerts, loading, refresh } = useAlertHistory(50);

  return (
    <div className="alerts-page">
      <div className="alerts-page__header">
        <h2>{t('alerts.title')}</h2>
        <button className="insights-panel__refresh" type="button" onClick={refresh}>
          {t('dashboard.refresh')}
        </button>
      </div>

      {loading ? (
        <div className="alerts-page__empty">{t('dashboard.loading')}</div>
      ) : alerts.length === 0 ? (
        <div className="alerts-page__empty">{t('alerts.noAlerts')}</div>
      ) : (
        <div className="alerts-page__list">
          {alerts.map((alert) => (
            <div key={alert.id} className="alerts-page__item">
              <span className="alerts-page__severity">
                {SEVERITY_ICONS[alert.severity] || "⚠️"}
              </span>
              <div className="alerts-page__body">
                <div className="alerts-page__title">{alert.title}</div>
                <div className="alerts-page__desc">{alert.description}</div>
              </div>
              <span className="alerts-page__time"><TimeAgo timestamp={alert.timestamp} /></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
