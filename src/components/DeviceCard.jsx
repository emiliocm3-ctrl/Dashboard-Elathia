import { formatValue } from "../utils/formatters";
import "./DeviceCard.css";

const buildSparkline = (values, width = 180, height = 60) => {
  if (!values.length)
    return { line: "", area: "", min: null, max: null, last: null };
  const padding = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1 || 1);
  const usableHeight = height - padding * 2;

  const points = values.map((value, index) => {
    const x = index * step;
    const y = padding + (1 - (value - min) / range) * usableHeight;
    return { x, y };
  });

  const line = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`
    )
    .join(" ");

  const area = `${line} L${width.toFixed(1)} ${(height - padding).toFixed(
    1
  )} L0 ${(height - padding).toFixed(1)} Z`;

  return { line, area, min, max, last: values[values.length - 1] };
};

export default function DeviceCard({
  device,
  readings = [],
  onSelect,
  isSelected,
}) {
  const temperatureSeries = readings
    .map((r) => (r.air_temperature ? parseFloat(r.air_temperature) : null))
    .filter((v) => v !== null);
  const humiditySeries = readings
    .map((r) => (r.relative_humidity ? parseFloat(r.relative_humidity) : null))
    .filter((v) => v !== null);

  const temperatureSpark = buildSparkline(temperatureSeries);
  const humiditySpark = buildSparkline(humiditySeries);

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
          <span>
            {new Date(device.timestamp_converted).toLocaleString("es-ES")}
          </span>
        </div>
        <span className="device-status">Activo</span>
      </div>
      <div className="device-card-metrics">
        <div>
          <span>Temp</span>
          <strong>{formatValue(device.air_temperature)}°C</strong>
        </div>
        <div>
          <span>Hum</span>
          <strong>{formatValue(device.relative_humidity, 0)}%</strong>
        </div>
        <div>
          <span>Suelo</span>
          <strong>{formatValue(device.soil_humidity, 0)}%</strong>
        </div>
        <div>
          <span>Cond</span>
          <strong>{formatValue(device.soil_conductivity)} mS</strong>
        </div>
      </div>
      <div className="device-card-graphs">
        <div className="device-mini-chart device-mini-chart--temp">
          <div className="mini-chart-header">
            <div>
              <span>Temperatura</span>
              <strong>{formatValue(device.air_temperature)}°C</strong>
            </div>
            <div className="mini-chart-range">
              <span>
                Min{" "}
                {temperatureSpark.min === null
                  ? "--"
                  : temperatureSpark.min.toFixed(1)}
                °C
              </span>
              <span>
                Max{" "}
                {temperatureSpark.max === null
                  ? "--"
                  : temperatureSpark.max.toFixed(1)}
                °C
              </span>
            </div>
          </div>
          <div className="mini-chart-canvas">
            <svg viewBox="0 0 180 60" role="img">
              <path className="mini-chart-area" d={temperatureSpark.area} />
              <path className="mini-chart-line" d={temperatureSpark.line} />
            </svg>
          </div>
        </div>
        <div className="device-mini-chart device-mini-chart--hum">
          <div className="mini-chart-header">
            <div>
              <span>Humedad</span>
              <strong>{formatValue(device.relative_humidity, 0)}%</strong>
            </div>
            <div className="mini-chart-range">
              <span>
                Min{" "}
                {humiditySpark.min === null
                  ? "--"
                  : humiditySpark.min.toFixed(0)}
                %
              </span>
              <span>
                Max{" "}
                {humiditySpark.max === null
                  ? "--"
                  : humiditySpark.max.toFixed(0)}
                %
              </span>
            </div>
          </div>
          <div className="mini-chart-canvas">
            <svg viewBox="0 0 180 60" role="img">
              <path className="mini-chart-area" d={humiditySpark.area} />
              <path className="mini-chart-line" d={humiditySpark.line} />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}
