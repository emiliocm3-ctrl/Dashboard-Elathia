import React, { useMemo } from "react";
import { ASSETS } from "../config/assets";
import { ETAPAS_FENOLOGICAS } from "../config/constants";
import { formatValue, parseNumber, getMetricStatus } from "../utils/formatters";
import SummaryBlock from "./SummaryBlock";
import CollapsibleSection from "./shared/CollapsibleSection";
import "./SectorCard.css";

const buildLinePath = (values, width, height, min, max) => {
    if (values.length < 2) return "";
    const padding = 8;
    const range = max - min || 1;
    const step = width / (values.length - 1 || 1);
    const usableHeight = height - padding * 2;

    return values
        .map((value, index) => {
            const x = index * step;
            const y = padding + (1 - (value - min) / range) * usableHeight;
            return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ");
};

const buildTimeWindows = (series, windowMinutes = 60) => {
    if (!Array.isArray(series) || series.length === 0) return [];
    const windows = new Map();

    series.forEach((row) => {
        const timestamp = row.timestamp || row.timestamp_converted;
        if (!timestamp) return;
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return;
        const windowStart = new Date(date);
        const minutes = windowStart.getMinutes();
        const roundedMinutes = Math.floor(minutes / windowMinutes) * windowMinutes;
        windowStart.setMinutes(roundedMinutes, 0, 0);
        const key = windowStart.getTime();
        if (!windows.has(key)) {
            windows.set(key, {
                start: windowStart,
                fVpdValues: [],
                thetaValues: [],
            });
        }
        const bucket = windows.get(key);
        const fVpd = parseNumber(row.f_vpd);
        const theta = parseNumber(row.soil_theta_disponible);
        if (fVpd !== null) bucket.fVpdValues.push(fVpd);
        if (theta !== null) bucket.thetaValues.push(theta);
    });

    return Array.from(windows.values())
        .map((window) => {
            const fVpdMax = window.fVpdValues.length
                ? Math.max(...window.fVpdValues)
                : null;
            const thetaAvg = window.thetaValues.length
                ? window.thetaValues.reduce((acc, value) => acc + value, 0) /
                window.thetaValues.length
                : null;
            return {
                start: window.start,
                end: new Date(window.start.getTime() + windowMinutes * 60 * 1000),
                fVpdMax,
                thetaAvg,
            };
        })
        .filter((window) => window.fVpdMax !== null)
        .sort((a, b) => b.start - a.start);
};

const buildHeatmapWindows = (series, windowMinutes = 60, hours = 24) => {
    const now = new Date();
    const end = new Date(now);
    end.setMinutes(0, 0, 0);
    const start = new Date(end.getTime() - hours * windowMinutes * 60 * 1000);
    const buckets = new Map();

    if (Array.isArray(series)) {
        series.forEach((row) => {
            const timestamp = row.timestamp || row.timestamp_converted;
            if (!timestamp) return;
            const date = new Date(timestamp);
            if (Number.isNaN(date.getTime())) return;
            if (date < start || date >= end) return;
            date.setMinutes(0, 0, 0);
            const key = date.getTime();
            if (!buckets.has(key)) {
                buckets.set(key, { fVpdValues: [], thetaValues: [] });
            }
            const bucket = buckets.get(key);
            const fVpd = parseNumber(row.f_vpd);
            const theta = parseNumber(row.soil_theta_disponible);
            if (fVpd !== null) bucket.fVpdValues.push(fVpd);
            if (theta !== null) bucket.thetaValues.push(theta);
        });
    }

    const windows = [];
    for (let i = 0; i < hours; i += 1) {
        const windowStart = new Date(
            start.getTime() + i * windowMinutes * 60 * 1000
        );
        const windowEnd = new Date(
            windowStart.getTime() + windowMinutes * 60 * 1000
        );
        const key = windowStart.getTime();
        const bucket = buckets.get(key);
        const fVpdMax = bucket?.fVpdValues?.length
            ? Math.max(...bucket.fVpdValues)
            : null;
        const thetaAvg = bucket?.thetaValues?.length
            ? bucket.thetaValues.reduce((acc, value) => acc + value, 0) /
            bucket.thetaValues.length
            : null;

        let status = "inactive";
        if (fVpdMax !== null && fVpdMax >= 0.6) {
            if (thetaAvg !== null) {
                if (thetaAvg >= 0.6 && thetaAvg <= 0.8) {
                    status = "ok";
                } else if (
                    (thetaAvg >= 0.5 && thetaAvg < 0.6) ||
                    (thetaAvg > 0.8 && thetaAvg <= 0.9)
                ) {
                    status = "warn";
                } else {
                    status = "danger";
                }
            } else {
                status = "warn";
            }
        }

        windows.push({
            start: windowStart,
            end: windowEnd,
            fVpdMax,
            thetaAvg,
            status,
        });
    }

    return windows;
};

export default function SectorCard({
    sector,
    onViewSector,
    transpirationSeries = [],
}) {
    const getEtapaInfo = (etapaId) => {
        const etapa = ETAPAS_FENOLOGICAS.find((e) => e.id === etapaId);
        return etapa || { name: "Desconocido", short: "--", color: "#9CA3AF" };
    };

    const etapaInfo = getEtapaInfo(sector.etapaFenologica);
    const tempStatus = getMetricStatus("temperature", sector.air_temperature);
    const humStatus = getMetricStatus("humidity", sector.relative_humidity);
    const condStatus = getMetricStatus("conductivity", sector.soil_conductivity);
    const metrics = {
        temperature: {
            value: formatValue(sector.air_temperature),
            unit: "°C",
            ...tempStatus,
        },
        humidity: {
            value: formatValue(sector.relative_humidity, 0),
            unit: "%",
            ...humStatus,
        },
        conductivity: {
            value: formatValue(sector.soil_conductivity),
            unit: "mS/cm",
            ...condStatus,
        },
    };

    // eslint-disable-next-line no-unused-vars
    const transpirationData = useMemo(() => {
        const series = Array.isArray(transpirationSeries)
            ? transpirationSeries
            : [];
        const fVpdValues = series
            .map((row) => parseNumber(row.f_vpd))
            .filter((value) => value !== null);
        const thetaValues = series
            .map((row) => parseNumber(row.soil_theta_disponible))
            .filter((value) => value !== null);

        const combinedValues = [...fVpdValues, ...thetaValues];
        const hasSeries = combinedValues.length > 1;

        const min = hasSeries ? Math.min(...combinedValues) : 0;
        const max = hasSeries ? Math.max(...combinedValues) : 1;

        const yAxisLabels = hasSeries
            ? Array.from({ length: 5 }, (_, index) => {
                const range = max - min || 1;
                const step = range / 4;
                return (max - step * index).toFixed(2);
            })
            : ["1.00", "0.80", "0.60", "0.40", "0.20"];

        const getTimestamp = (row) => row.timestamp || row.timestamp_converted;

        const xAxisLabels = (() => {
            if (series.length < 2) return [];
            const first = new Date(getTimestamp(series[0]));
            const mid = new Date(getTimestamp(series[Math.floor(series.length / 2)]));
            const last = new Date(getTimestamp(series[series.length - 1]));
            const format = (date) =>
                date.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                });
            return [format(first), format(mid), format(last)];
        })();

        const width = 320;
        const height = 140;

        return {
            hasSeries,
            yAxisLabels,
            xAxisLabels,
            fVpdPath: buildLinePath(fVpdValues, width, height, min, max),
            thetaPath: buildLinePath(thetaValues, width, height, min, max),
            width,
            height,
        };
    }, [transpirationSeries]);

    const transpirationWindows = useMemo(() => {
        const windows = buildTimeWindows(transpirationSeries, 60);
        return windows
            .filter((window) => window.fVpdMax >= 0.6)
            .map((window) => {
                let status = "Fuera";
                if (window.thetaAvg !== null) {
                    if (window.thetaAvg >= 0.6 && window.thetaAvg <= 0.8) {
                        status = "OK";
                    } else if (
                        (window.thetaAvg >= 0.5 && window.thetaAvg < 0.6) ||
                        (window.thetaAvg > 0.8 && window.thetaAvg <= 0.9)
                    ) {
                        status = "Casi";
                    }
                }
                return {
                    ...window,
                    status,
                };
            })
            .slice(0, 10);
    }, [transpirationSeries]);

    const heatmapWindows = useMemo(
        () => buildHeatmapWindows(transpirationSeries, 60, 24),
        [transpirationSeries]
    );

    return (
        <div className="sector-card">
            <div className="sector-header">
                <div className="sector-title">
                    <h3>{sector.name}</h3>
                    <div className="sector-stage">
                        <div
                            className="stage-indicator"
                            style={{ borderColor: etapaInfo.color }}
                        >
                            <span
                                className="stage-dot"
                                style={{ backgroundColor: etapaInfo.color }}
                            />
                        </div>
                        <span className="stage-name">
                            <span
                                className="stage-badge"
                                style={{ borderColor: etapaInfo.color, color: etapaInfo.color }}
                            >
                                {etapaInfo.short}
                            </span>
                            {etapaInfo.name}
                        </span>
                    </div>
                </div>
                <button
                    className="sector-action-btn"
                    onClick={() => onViewSector(sector.name)}
                    aria-label={`Ver detalles de ${sector.name}`}
                >
                    <img src={ASSETS.icons.chevron} alt="" />
                </button>
            </div>

            <div className="summary-card summary-card--compact">
                <SummaryBlock
                    metricType="temperature"
                    value={metrics.temperature.value}
                    unit={metrics.temperature.unit}
                    statusText={metrics.temperature.statusText}
                    status={metrics.temperature.status}
                />
                <div className="divider" />
                <SummaryBlock
                    metricType="humidity"
                    value={metrics.humidity.value}
                    unit={metrics.humidity.unit}
                    statusText={metrics.humidity.statusText}
                    status={metrics.humidity.status}
                />
                <div className="divider" />
                <SummaryBlock
                    metricType="conductivity"
                    value={metrics.conductivity.value}
                    unit={metrics.conductivity.unit}
                    statusText={metrics.conductivity.statusText}
                    status={metrics.conductivity.status}
                />
            </div>

            <CollapsibleSection title="Eficiencia de transpiración (detalle)">
            <div className="sector-transpiration">
                <div className="transpiration-header">
                    <div className="transpiration-legend">
                        <span className="legend-item legend-item--blue">Demanda atmosférica</span>
                        <span className="legend-item legend-item--orange">
                            Agua disponible
                        </span>
                    </div>
                </div>
                {/* {transpirationData.hasSeries ? ( */}
                {/*   <div className="transpiration-chart"> */}
                {/*     <div className="transpiration-axis"> */}
                {/*       {transpirationData.yAxisLabels.map((label) => ( */}
                {/*         <span key={label}>{label}</span> */}
                {/*       ))} */}
                {/*     </div> */}
                {/*     <div className="transpiration-grid"> */}
                {/*       {Array.from({ length: 5 }).map((_, index) => ( */}
                {/*         <div className="transpiration-gridline" key={index} /> */}
                {/*       ))} */}
                {/*       <svg */}
                {/*         className="transpiration-svg" */}
                {/*         viewBox={`0 0 ${transpirationData.width} ${transpirationData.height}`} */}
                {/*         role="img" */}
                {/*       > */}
                {/*         <path */}
                {/*           className="transpiration-line transpiration-line--blue" */}
                {/*           d={transpirationData.fVpdPath} */}
                {/*         /> */}
                {/*         <path */}
                {/*           className="transpiration-line transpiration-line--orange" */}
                {/*           d={transpirationData.thetaPath} */}
                {/*         /> */}
                {/*       </svg> */}
                {/*     </div> */}
                {/*   </div> */}
                {/* ) : ( */}
                {/*   <div className="transpiration-empty">Sin datos disponibles</div> */}
                {/* )} */}
                {/* {transpirationData.xAxisLabels.length > 0 && ( */}
                {/*   <div className="transpiration-axis transpiration-axis--bottom"> */}
                {/*     {transpirationData.xAxisLabels.map((label) => ( */}
                {/*       <span key={label}>{label}</span> */}
                {/*     ))} */}
                {/*   </div> */}
                {/* )} */}
                <div className="transpiration-heatmap">
                    <div className="heatmap-header">
                        <h5>Mapa de calor (24h)</h5>
                        <div className="heatmap-legend">
                            <span className="heatmap-legend-item heatmap-legend-item--ok">
                                OK
                            </span>
                            <span className="heatmap-legend-item heatmap-legend-item--warn">
                                Casi
                            </span>
                            <span className="heatmap-legend-item heatmap-legend-item--danger">
                                Fuera
                            </span>
                            <span className="heatmap-legend-item heatmap-legend-item--inactive">
                                Inactiva
                            </span>
                        </div>
                    </div>
                    <div className="heatmap-grid">
                        {heatmapWindows.map((window) => (
                            <div
                                key={window.start.toISOString()}
                                className={`heatmap-cell heatmap-cell--${window.status}`}
                                title={`${window.start.toLocaleTimeString("es-ES", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })} - ${window.end.toLocaleTimeString("es-ES", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })} | f_vpd: ${window.fVpdMax === null ? "--" : window.fVpdMax.toFixed(2)
                                    } | θ_disp: ${window.thetaAvg === null ? "--" : window.thetaAvg.toFixed(2)
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="heatmap-axis">
                        {heatmapWindows.map((window, index) =>
                            index % 4 === 0 ? (
                                <span key={window.start.toISOString()}>
                                    {window.start.toLocaleTimeString("es-ES", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            ) : (
                                <span key={window.start.toISOString()} />
                            )
                        )}
                    </div>
                </div>
                <div className="transpiration-interpretation">
                    <div className="interpretation-header">
                        <h5>Interpretación de transpiración</h5>
                        <span className="interpretation-note">
                            Ventanas activas (60 min)
                        </span>
                    </div>
                    {transpirationWindows.length ? (
                        <div className="interpretation-table">
                            <div className="interpretation-row interpretation-row--head">
                                <span>Ventana</span>
                                <span>Demanda máx</span>
                                <span>Agua prom</span>
                                <span>Estado</span>
                            </div>
                            {transpirationWindows.map((window) => (
                                <div
                                    className="interpretation-row"
                                    key={window.start.toISOString()}
                                >
                                    <span>
                                        {window.start.toLocaleTimeString("es-ES", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                        {" - "}
                                        {window.end.toLocaleTimeString("es-ES", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                    <span>
                                        {window.fVpdMax === null ? "--" : window.fVpdMax.toFixed(2)}
                                    </span>
                                    <span>
                                        {window.thetaAvg === null
                                            ? "--"
                                            : window.thetaAvg.toFixed(2)}
                                    </span>
                                    <span
                                        className={`status-badge status-badge--${window.status === "OK"
                                                ? "ok"
                                                : window.status === "Casi"
                                                    ? "warn"
                                                    : "danger"
                                            }`}
                                    >
                                        {window.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="transpiration-empty">Sin ventanas activas</div>
                    )}
                    <div className="interpretation-legend">
                        <p>1.0 = Agua llena (capacidad de campo). La planta tiene todo lo que necesita.</p>
                        <p>0.5 = Mitad del agua útil. Sin problemas por ahora.</p>
                        <p>0.0 = Sin agua disponible. La planta se marchita.</p>
                    </div>
                </div>
            </div>
            </CollapsibleSection>

            <div className="sector-status">
                <div className="status-item">
                    <span className="status-label">Última Lectura</span>
                    <span className="status-value">
                        {sector.timestamp_converted
                            ? new Date(sector.timestamp_converted).toLocaleString("es-ES")
                            : "--"}
                    </span>
                </div>
            </div>
        </div>
    );
}
