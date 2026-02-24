import { useTranslation } from "react-i18next";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { formatValue } from "../utils/formatters";
import "./DeviceCard.css";

function MiniSparkline({ data, color, gradientId }) {
  if (!data.length) return <div className="mini-chart-empty">--</div>;
  return (
    <ResponsiveContainer width="100%" height={50}>
      <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          isAnimationActive={true}
          animationDuration={500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function DeviceCard({ device, readings = [], onSelect, isSelected }) {
  const { t } = useTranslation();

  const tempData = readings
    .map((r) => ({ value: r.air_temperature ? parseFloat(r.air_temperature) : null }))
    .filter((d) => d.value !== null);
  const humData = readings
    .map((r) => ({ value: r.relative_humidity ? parseFloat(r.relative_humidity) : null }))
    .filter((d) => d.value !== null);

  const tempMin = tempData.length ? Math.min(...tempData.map((d) => d.value)) : null;
  const tempMax = tempData.length ? Math.max(...tempData.map((d) => d.value)) : null;
  const humMin = humData.length ? Math.min(...humData.map((d) => d.value)) : null;
  const humMax = humData.length ? Math.max(...humData.map((d) => d.value)) : null;

  return (
    <button
      type="button"
      className={`device-card ${isSelected ? "device-card--active" : ""}`}
      onClick={() => onSelect(device.device_id)}
    >
      <div className="device-card-header">
        <div>
          <h4>{device.device_alias || device.device_id}</h4>
          <span>{device.device_id}</span>
          <span>{new Date(device.timestamp_converted).toLocaleString()}</span>
        </div>
        <span className="device-status">{t('status.ok')}</span>
      </div>
      <div className="device-card-metrics">
        <div><span>{t('metrics.temperature')}</span><strong>{formatValue(device.air_temperature)}°C</strong></div>
        <div><span>{t('metrics.humidity')}</span><strong>{formatValue(device.relative_humidity, 0)}%</strong></div>
        <div><span>{t('metrics.soilMoisture')}</span><strong>{formatValue(device.soil_humidity, 0)}%</strong></div>
        <div><span>{t('metrics.conductivity')}</span><strong>{formatValue(device.soil_conductivity)} mS</strong></div>
      </div>
      <div className="device-card-graphs">
        <div className="device-mini-chart device-mini-chart--temp">
          <div className="mini-chart-header">
            <div>
              <span>{t('metrics.temperature')}</span>
              <strong>{formatValue(device.air_temperature)}°C</strong>
            </div>
            <div className="mini-chart-range">
              <span>Min {tempMin === null ? "--" : tempMin.toFixed(1)}°C</span>
              <span>Max {tempMax === null ? "--" : tempMax.toFixed(1)}°C</span>
            </div>
          </div>
          <MiniSparkline data={tempData} color="#ef4444" gradientId={`temp_${device.device_id}`} />
        </div>
        <div className="device-mini-chart device-mini-chart--hum">
          <div className="mini-chart-header">
            <div>
              <span>{t('metrics.humidity')}</span>
              <strong>{formatValue(device.relative_humidity, 0)}%</strong>
            </div>
            <div className="mini-chart-range">
              <span>Min {humMin === null ? "--" : humMin.toFixed(0)}%</span>
              <span>Max {humMax === null ? "--" : humMax.toFixed(0)}%</span>
            </div>
          </div>
          <MiniSparkline data={humData} color="#3b82f6" gradientId={`hum_${device.device_id}`} />
        </div>
      </div>
    </button>
  );
}
