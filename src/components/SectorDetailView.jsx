import { useState } from "react";
import { ASSETS } from "../config/assets";
import { formatValue, getMetricStatus } from "../utils/formatters";
import SensorDropdown from "./SensorDropdown";
import SummaryBlock from "./SummaryBlock";
import ChartCard from "./ChartCard";

export default function SectorDetailView({
  sectorName,
  zoneName = "Zona Este",
  onBack,
  onRefresh,
  sectorData,
  devices = [],
  deviceReadings = {},
  selectedDevice,
  onSelectDevice,
  deviceRange = "24h",
  onChangeDeviceRange,
  isAdmin = false,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedZoneName, setEditedZoneName] = useState(zoneName);
  const [lastUpdate] = useState(
    new Date().toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  const sensors = devices.map((device) => ({
    id: device.device_id,
    name: device.device_alias || device.device_id,
  }));

  const tempStatus = getMetricStatus("temperature", sectorData?.air_temperature);
  const humStatus = getMetricStatus("humidity", sectorData?.relative_humidity);
  const condStatus = getMetricStatus("conductivity", sectorData?.soil_conductivity);
  const radStatus = getMetricStatus("radiation", sectorData?.soil_temperature);
  const phStatus = getMetricStatus("ph", sectorData?.soil_humidity);
  const metrics = {
    temperature: {
      value: formatValue(sectorData?.air_temperature),
      unit: "°C",
      ...tempStatus,
    },
    humidity: {
      value: formatValue(sectorData?.relative_humidity, 0),
      unit: "%",
      ...humStatus,
    },
    conductivity: {
      value: formatValue(sectorData?.soil_conductivity),
      unit: "mS/cm",
      ...condStatus,
    },
    radiation: {
      value: formatValue(sectorData?.soil_temperature),
      unit: "°C",
      ...radStatus,
    },
    ph: {
      value: formatValue(sectorData?.soil_humidity, 0),
      unit: "%",
      ...phStatus,
    },
  };

  const activeDeviceId = selectedDevice || sensors[0]?.id;
  const activeReadings = activeDeviceId
    ? deviceReadings[activeDeviceId] || []
    : [];
  const buildSeries = (key) =>
    activeReadings.map((reading) => ({
      x: reading.timestamp_converted,
      y: reading[key],
    }));

  const displayTitle = selectedDevice
    ? sensors.find((s) => s.id === selectedDevice)?.name
    : "Total de Sensores";

  const handleEditName = () => {
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    setIsEditingName(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      setEditedZoneName(zoneName);
      setIsEditingName(false);
    }
  };

  return (
    <div className="sector-detail">
      <section className="header-block">
        <div className="header-title">
          <div className="sector-title-row">
            {isEditingName ? (
              <input
                type="text"
                className="zone-name-input"
                value={editedZoneName}
                onChange={(e) => setEditedZoneName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            ) : (
              <h1>{editedZoneName}</h1>
            )}
            <button
              className="icon-btn"
              type="button"
              onClick={handleEditName}
              aria-label="Editar nombre de zona"
            >
              <img src={ASSETS.icons.edit} alt="" />
            </button>
            <span className="sector-subtitle">- {displayTitle}</span>
          </div>
          <p>
            Monitoreo tiempo real de {sectorName} • Última actualización:{" "}
            {lastUpdate}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" type="button" onClick={onBack}>
            <span className="icon-24 rotate-90">
              <img src={ASSETS.icons.chevron} alt="" />
            </span>
            Volver a Sectores
          </button>
          <SensorDropdown
            sensors={sensors}
            selectedSensor={selectedDevice}
            onChange={(id) => onSelectDevice && onSelectDevice(id)}
            placeholder={
              isAdmin ? "-- Selecciona Sensor --" : "-- Total de Sensores --"
            }
          />
          {null}
          <button className="btn-outline" type="button" onClick={onRefresh}>
            <span className="icon-24">
              <img src={ASSETS.icons.refresh} alt="" />
            </span>
            Actualizar Datos
          </button>
        </div>
      </section>

      <section className="summary-card">
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
        <div className="divider" />
        <SummaryBlock
          metricType="radiation"
          value={metrics.radiation.value}
          unit={metrics.radiation.unit}
          statusText={metrics.radiation.statusText}
          status={metrics.radiation.status}
        />
        <div className="divider" />
        <SummaryBlock
          metricType="ph"
          value={metrics.ph.value}
          unit={metrics.ph.unit}
          statusText={metrics.ph.statusText}
          status={metrics.ph.status}
        />
      </section>

      <section className="chart-grid">
        <ChartCard
          title="Temperatura"
          timeRange={deviceRange}
          chartLines={[
            ASSETS.charts.lineA,
            ASSETS.charts.lineB,
            ASSETS.charts.lineC,
          ]}
          series={buildSeries("air_temperature")}
          unit="°C"
          onRangeChange={onChangeDeviceRange}
        />
        <ChartCard
          title="Humedad"
          timeRange={deviceRange}
          chartLines={[ASSETS.charts.lineD]}
          series={buildSeries("relative_humidity")}
          unit="%"
          onRangeChange={onChangeDeviceRange}
        />
        <ChartCard
          title="Conductividad"
          timeRange={deviceRange}
          chartLines={[ASSETS.charts.lineC]}
          series={buildSeries("soil_conductivity")}
          unit="mS/cm"
          onRangeChange={onChangeDeviceRange}
        />
      </section>
    </div>
  );
}
