import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedZoneName, setEditedZoneName] = useState(zoneName);
  const [lastUpdate] = useState(new Date().toLocaleString());

  const sensors = devices.map((device) => ({
    id: device.device_id,
    name: device.device_alias || device.device_id,
  }));

  const tempStatus = getMetricStatus("temperature", sectorData?.air_temperature);
  const humStatus = getMetricStatus("humidity", sectorData?.relative_humidity);
  const condStatus = getMetricStatus("conductivity", sectorData?.soil_conductivity);
  const metrics = {
    temperature: { value: formatValue(sectorData?.air_temperature), unit: t('units.celsius'), ...tempStatus },
    humidity: { value: formatValue(sectorData?.relative_humidity, 0), unit: t('units.percent'), ...humStatus },
    conductivity: { value: formatValue(sectorData?.soil_conductivity), unit: t('units.mscm'), ...condStatus },
  };

  const activeDeviceId = selectedDevice || sensors[0]?.id;
  const activeReadings = activeDeviceId ? deviceReadings[activeDeviceId] || [] : [];
  const buildSeries = (key) =>
    activeReadings.map((reading) => ({
      x: reading.timestamp_converted,
      y: reading[key],
    }));

  const displayTitle = selectedDevice
    ? sensors.find((s) => s.id === selectedDevice)?.name
    : t('dashboard.devices');

  const handleSaveName = () => setIsEditingName(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSaveName();
    else if (e.key === "Escape") {
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
            <button className="icon-btn" type="button" onClick={() => setIsEditingName(true)}>
              <img src={ASSETS.icons.edit} alt="" />
            </button>
            <span className="sector-subtitle">- {displayTitle}</span>
          </div>
          <p>{sectorName} • {t('dashboard.lastUpdate')}: {lastUpdate}</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" type="button" onClick={onBack}>
            <span className="icon-24 rotate-90"><img src={ASSETS.icons.chevron} alt="" /></span>
            {t('nav.back')}
          </button>
          <SensorDropdown
            sensors={sensors}
            selectedSensor={selectedDevice}
            onChange={(id) => onSelectDevice && onSelectDevice(id)}
            placeholder={isAdmin ? `-- ${t('dashboard.selectSector')} --` : `-- ${t('dashboard.devices')} --`}
          />
          <button className="btn-outline" type="button" onClick={onRefresh}>
            <span className="icon-24"><img src={ASSETS.icons.refresh} alt="" /></span>
            {t('dashboard.refresh')}
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
      </section>

      <section className="chart-grid">
        <ChartCard
          title={t('metrics.temperature')}
          metricType="temperature"
          timeRange={deviceRange}
          series={buildSeries("air_temperature")}
          unit={t('units.celsius')}
          optimalMin={20}
          optimalMax={40}
          color="#ef4444"
          onRangeChange={onChangeDeviceRange}
        />
        <ChartCard
          title={t('metrics.humidity')}
          metricType="humidity"
          timeRange={deviceRange}
          series={buildSeries("relative_humidity")}
          unit={t('units.percent')}
          optimalMin={70}
          optimalMax={80}
          color="#3b82f6"
          onRangeChange={onChangeDeviceRange}
        />
        <ChartCard
          title={t('metrics.conductivity')}
          metricType="conductivity"
          timeRange={deviceRange}
          series={buildSeries("soil_conductivity")}
          unit={t('units.mscm')}
          optimalMin={1}
          optimalMax={3}
          color="#4cb3a0"
          onRangeChange={onChangeDeviceRange}
        />
      </section>
    </div>
  );
}
