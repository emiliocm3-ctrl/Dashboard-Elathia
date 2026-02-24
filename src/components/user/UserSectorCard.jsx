import React from "react";
import { useTranslation } from "react-i18next";
import { ETAPAS_FENOLOGICAS } from "../../config/constants";
import HealthBadge from "../shared/HealthBadge";
import GaugeChart from "../shared/GaugeChart";
import AlertCard from "../shared/AlertCard";
import {
  getMetricStatus,
  getSectorAlerts,
} from "../../utils/formatters";
import "./user.css";

export default function UserSectorCard({ sector, onViewSector, style }) {
  const { t } = useTranslation();
  const etapa = ETAPAS_FENOLOGICAS.find((e) => e.id === sector.etapaFenologica) || {
    name: t('status.unknown'),
    short: "--",
    color: "#9CA3AF",
  };

  const tempStatus = getMetricStatus("temperature", sector.air_temperature);
  const humStatus = getMetricStatus("humidity", sector.relative_humidity);
  const soilHum = sector.soil_humidity;
  const soilStatus = soilHum < 35 || soilHum > 75
    ? soilHum < 25 || soilHum > 85 ? "critical" : "warning"
    : "ok";

  const statuses = [tempStatus.status, humStatus.status, soilStatus];
  const overallStatus = statuses.includes("critical")
    ? "critical"
    : statuses.includes("warning")
    ? "warning"
    : "ok";

  const alerts = getSectorAlerts(sector);

  return (
    <div
      className={`user-sector-card user-sector-card--${overallStatus}`}
      onClick={() => onViewSector(sector)}
      role="button"
      tabIndex={0}
      style={style}
    >
      <div className="user-sector-card__header">
        <HealthBadge status={overallStatus} size="md" />
        <div className="user-sector-card__title">
          <h3>{sector.name}</h3>
          <span className="user-sector-card__stage" style={{ borderColor: etapa.color, color: etapa.color }}>
            {t(`stages.${sector.etapaFenologica}`, { defaultValue: etapa.short })}
          </span>
        </div>
      </div>

      <div className="user-sector-card__gauges">
        <GaugeChart
          value={parseFloat(sector.air_temperature)}
          min={0} max={50} optimalMin={20} optimalMax={40}
          unit={t('units.celsius')}
          label={t('metrics.temperature')}
          size={100}
        />
        <GaugeChart
          value={parseFloat(sector.relative_humidity)}
          min={0} max={100} optimalMin={70} optimalMax={80}
          unit={t('units.percent')}
          label={t('metrics.humidity')}
          size={100}
        />
        <GaugeChart
          value={parseFloat(soilHum)}
          min={0} max={100} optimalMin={40} optimalMax={70}
          unit={t('units.percent')}
          label={t('metrics.soilMoisture')}
          size={100}
        />
      </div>

      {alerts.length > 0 && (
        <div className="user-sector-card__alerts">
          {alerts.slice(0, 1).map((alert) => (
            <AlertCard key={alert.type} severity={alert.severity} message={alert.message} />
          ))}
        </div>
      )}
    </div>
  );
}
