import React from "react";
import { ASSETS } from "../config/assets";
import { ETAPAS_FENOLOGICAS } from "../config/constants";
import { getMetricStatus } from "../utils/formatters";
import "./RanchCard.css";

function getOverallStatus(sectors) {
  if (!sectors || sectors.length === 0) return "ok";
  const statuses = sectors.map((s) => {
    const temp = getMetricStatus("temperature", s.air_temperature).status;
    const hum = getMetricStatus("humidity", s.relative_humidity).status;
    return [temp, hum];
  }).flat();
  if (statuses.includes("critical")) return "critical";
  if (statuses.includes("warning")) return "warning";
  return "ok";
}

const STATUS_LABELS = { ok: "Óptimo", warning: "Precaución", critical: "Crítico" };

function getRelativeTime(timestamp) {
  if (!timestamp) return "--";
  const diff = Date.now() - new Date(timestamp).getTime();
  if (Number.isNaN(diff) || diff < 0) return "--";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

export default function RanchCard({ ranch, onViewRanch }) {
  const getTotalSectors = () => {
    return ranch.sectors ? ranch.sectors.length : 0;
  };

  const getEtapasFenologicasCount = () => {
    if (!ranch.sectors || ranch.sectors.length === 0) {
      return ETAPAS_FENOLOGICAS.map(e => ({ ...e, count: 0 }));
    }
    
    const counts = {};
    ranch.sectors.forEach(sector => {
      const etapa = sector.etapaFenologica || 'crecimiento';
      counts[etapa] = (counts[etapa] || 0) + 1;
    });

    return ETAPAS_FENOLOGICAS.map(etapa => ({
      ...etapa,
      count: counts[etapa.id] || 0
    }));
  };

  const etapasWithCounts = getEtapasFenologicasCount();
  const activeCount = etapasWithCounts.filter(e => e.count > 0).length;
  const overallStatus = getOverallStatus(ranch.sectors);
  const latestTimestamp = ranch.sectors
    ?.map((s) => s.timestamp_converted)
    .filter(Boolean)
    .sort()
    .pop();

  return (
    <div className="ranch-card">
      <div className="ranch-header">
        <div className="ranch-title">
          <h3>{ranch.name}</h3>
          <p className="ranch-subtitle">
            {getTotalSectors()} sectores • {activeCount} etapas activas
          </p>
        </div>
        <button
          className="ranch-action-btn"
          onClick={() => onViewRanch(ranch)}
          aria-label={`Ver detalles de ${ranch.name}`}
        >
          <img src={ASSETS.icons.chevron} alt="" />
        </button>
      </div>

      <div className="ranch-etapas">
        <h4>Etapas Fenológicas</h4>
        <div className="etapas-grid">
          {etapasWithCounts.map((etapa) => {
            const isActive = etapa.count > 0;

            return (
              <div
                key={etapa.id}
                className={`etapa-item ${
                  isActive ? "etapa-item--active" : "etapa-item--inactive"
                }`}
              >
                <div className="etapa-indicator">
                  <div
                    className={`etapa-dot ${
                      isActive ? "etapa-dot--active" : ""
                    }`}
                    style={{ backgroundColor: isActive ? etapa.color : undefined }}
                  />
                </div>
                <div className="etapa-info">
                  <span className="etapa-name">{etapa.name}</span>
                  <span className="etapa-count">{etapa.count} sectores</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ranch-stats">
        <div className="stat-item">
          <span className="stat-label">Estado General</span>
          <span className={`stat-value stat-value--${overallStatus === "ok" ? "good" : overallStatus}`}>
            {STATUS_LABELS[overallStatus]}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Última Actualización</span>
          <span className="stat-value">{getRelativeTime(latestTimestamp)}</span>
        </div>
      </div>
    </div>
  );
}