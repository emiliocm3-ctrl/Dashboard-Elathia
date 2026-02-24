import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ETAPAS_FENOLOGICAS } from "../../config/constants";
import HealthBadge from "../shared/HealthBadge";
import GaugeChart from "../shared/GaugeChart";
import AlertCard from "../shared/AlertCard";
import WaterBar from "../shared/WaterBar";
import InsightsPanel from "../shared/InsightsPanel";
import { useAgentInsights } from "../../hooks/useAgentInsights";
import {
  getMetricStatus,
  getFriendlyStatus,
  getSectorAlerts,
  getWaterLevel,
} from "../../utils/formatters";
import "./user.css";

export default function UserSectorDetail({
  sectorName,
  zoneName,
  sectorData,
  transpirationSeries = [],
  onBack,
  onRefresh,
}) {
  const { t } = useTranslation();
  const sectorId = sectorData?.id || null;
  const { insights, loading: insightsLoading, refresh: refreshInsights } = useAgentInsights(sectorId, sectorData);

  const waterLevel = useMemo(() => {
    if (!transpirationSeries || transpirationSeries.length === 0) {
      return getWaterLevel(null);
    }
    const latest = transpirationSeries[transpirationSeries.length - 1];
    return getWaterLevel(latest?.soil_theta_disponible);
  }, [transpirationSeries]);

  if (!sectorData) {
    return (
      <div className="user-detail">
        <button className="user-detail__back" type="button" onClick={onBack}>← {t('nav.back')}</button>
        <p className="user-detail__empty">{t('dashboard.noData')}</p>
      </div>
    );
  }

  const etapa = ETAPAS_FENOLOGICAS.find((e) => e.id === sectorData.etapaFenologica) || {
    name: t('status.unknown'),
    short: "--",
    color: "#9CA3AF",
  };

  const tempStatus = getMetricStatus("temperature", sectorData.air_temperature);
  const humStatus = getMetricStatus("humidity", sectorData.relative_humidity);
  const soilHum = sectorData.soil_humidity;
  const soilStatus = soilHum < 35 || soilHum > 75
    ? soilHum < 25 || soilHum > 85 ? "critical" : "warning"
    : "ok";

  const statuses = [tempStatus.status, humStatus.status, soilStatus];
  const overallStatus = statuses.includes("critical")
    ? "critical"
    : statuses.includes("warning")
    ? "warning"
    : "ok";

  const alerts = getSectorAlerts(sectorData);

  return (
    <div className="user-detail">
      <div className="user-detail__top">
        <button className="user-detail__back" type="button" onClick={onBack}>← {t('nav.back')}</button>
        <button className="user-detail__refresh" type="button" onClick={onRefresh}>{t('dashboard.refresh')}</button>
      </div>

      <div className="user-detail__hero">
        <HealthBadge status={overallStatus} size="lg" showLabel />
        <div className="user-detail__hero-info">
          <h2>{sectorName}</h2>
          <span className="user-detail__zone">{zoneName}</span>
          <span className="user-detail__stage-pill" style={{ borderColor: etapa.color, color: etapa.color }}>
            {t(`stages.${sectorData.etapaFenologica}`, { defaultValue: etapa.name })}
          </span>
        </div>
      </div>

      <div className="user-detail__gauge-row">
        <div className="user-detail__gauge-card">
          <GaugeChart
            value={parseFloat(sectorData.air_temperature)}
            min={0} max={50} optimalMin={20} optimalMax={40}
            unit={t('units.celsius')}
            label={t('metrics.temperature')}
            size={150}
          />
          <span className={`user-detail__metric-status user-detail__metric-status--${tempStatus.status}`}>
            {getFriendlyStatus(tempStatus.status)}
          </span>
        </div>
        <div className="user-detail__gauge-card">
          <GaugeChart
            value={parseFloat(sectorData.relative_humidity)}
            min={0} max={100} optimalMin={70} optimalMax={80}
            unit={t('units.percent')}
            label={t('metrics.humidity')}
            size={150}
          />
          <span className={`user-detail__metric-status user-detail__metric-status--${humStatus.status}`}>
            {getFriendlyStatus(humStatus.status)}
          </span>
        </div>
        <div className="user-detail__gauge-card">
          <GaugeChart
            value={parseFloat(soilHum)}
            min={0} max={100} optimalMin={40} optimalMax={70}
            unit={t('units.percent')}
            label={t('metrics.soilMoisture')}
            size={150}
          />
          <span className={`user-detail__metric-status user-detail__metric-status--${soilStatus}`}>
            {getFriendlyStatus(soilStatus)}
          </span>
        </div>
      </div>

      <WaterBar level={waterLevel.level} label={waterLevel.label} percent={waterLevel.percent} />

      {alerts.length > 0 && (
        <div className="user-detail__alerts">
          <h3>{t('alerts.title')}</h3>
          {alerts.map((alert) => (
            <AlertCard key={alert.type} severity={alert.severity} message={alert.message} />
          ))}
        </div>
      )}

      <InsightsPanel insights={insights} loading={insightsLoading} onRefresh={refreshInsights} />

      <div className="user-detail__footer">
        <span className="user-detail__timestamp">
          {t('dashboard.lastUpdate')}: {sectorData.timestamp_converted
            ? new Date(sectorData.timestamp_converted).toLocaleString()
            : "--"}
        </span>
      </div>
    </div>
  );
}
