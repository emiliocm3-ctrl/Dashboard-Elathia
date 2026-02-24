import { useEffect, useMemo, useState } from 'react';
import { ASSETS } from '../config/assets';

/**
 * ChartCard Component
 * Displays a chart visualization card with time range selector
 *
 * @param {Object} props
 * @param {string} props.title - Chart title
 * @param {string} props.metricType - Type of metric being charted
 * @param {Array} props.chartLines - Array of chart line image URLs
 * @param {string} props.timeRange - Selected time range (default: 'Diario')
 */
export default function ChartCard({
  title,
  metricType,
  chartLines = [],
  timeRange = '24h',
  ranges = ['8h', '24h', '7d'],
  onRangeChange,
  series = [],
  unit = '',
}) {
  const [selectedRange, setSelectedRange] = useState(timeRange);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setSelectedRange(timeRange);
  }, [timeRange]);

  const hasSeries = series.length > 1;
  const normalizedSeries = useMemo(() => {
    return series
      .map((point) => ({
        x: point.x,
        y: typeof point.y === 'string' ? parseFloat(point.y) : point.y,
      }))
      .filter((point) => Number.isFinite(point.y));
  }, [series]);

  const yAxisLabels = useMemo(() => {
    if (!hasSeries) return ['40', '30', '20', '10', '0'];
    const values = normalizedSeries.map((point) => point.y);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const step = range / 4;
    return Array.from({ length: 5 }, (_, index) =>
      (max - step * index).toFixed(1)
    );
  }, [hasSeries, normalizedSeries]);

  const xAxisLabels = useMemo(() => {
    if (!hasSeries) return ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
    if (normalizedSeries.length < 2) return [];
    const first = new Date(normalizedSeries[0].x);
    const mid = new Date(normalizedSeries[Math.floor(normalizedSeries.length / 2)].x);
    const last = new Date(normalizedSeries[normalizedSeries.length - 1].x);
    const format = (date) =>
      selectedRange === '7d'
        ? date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
        : date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return [format(first), format(mid), format(last)];
  }, [hasSeries, normalizedSeries, selectedRange]);

  const chartPath = useMemo(() => {
    if (!hasSeries) return '';
    const width = 240;
    const height = 140;
    const padding = 8;
    const values = normalizedSeries.map((point) => point.y);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const step = width / (normalizedSeries.length - 1 || 1);
    const usableHeight = height - padding * 2;

    return normalizedSeries
      .map((point, index) => {
        const x = index * step;
        const y = padding + (1 - (point.y - min) / range) * usableHeight;
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [hasSeries, normalizedSeries]);

  return (
    <div className="chart-card">
      {/* Chart Header */}
      <div className="chart-header">
        <h3>{title}</h3>
        <label className="chip" aria-label={`Rango ${title}`}>
          <select
            value={selectedRange}
            onChange={(event) => {
              setSelectedRange(event.target.value);
              if (onRangeChange) onRangeChange(event.target.value);
            }}
          >
            {ranges.map((range) => (
              <option key={range} value={range}>
                {range === '8h' ? '8 hrs' : range === '24h' ? '24 hrs' : '7 días'}
              </option>
            ))}
          </select>
          <span className="icon-16">
            <img src={ASSETS.icons.chevron} alt="" />
          </span>
        </label>
      </div>

      {/* Chart Body */}
      <div className="chart-body">
        {/* Y-Axis */}
        <div className="chart-axis">
          {yAxisLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        {/* Chart Gridlines and Lines */}
        <div className="chart-gridlines">
          {/* Gridlines */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="chart-gridline" key={index} />
          ))}

          {/* Chart Lines */}
          {hasSeries ? (
            <svg className="chart-svg" viewBox="0 0 240 140" role="img">
              <path className="chart-path" d={chartPath} />
            </svg>
          ) : (
            chartLines.map((line, index) => (
              <img className="chart-line" src={line} alt="" key={index} />
            ))
          )}

          {/* Chart Dot */}
          {!hasSeries && (
            <img
              className="chart-dot"
              src={ASSETS.charts.dot}
              alt=""
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
          )}

          {/* Tooltip */}
          {showTooltip && !hasSeries && (
            <div className="tooltip">
              <p>
                <strong>Enero 15, 2026 14:00 PM</strong>
                <br />
                {title}: 25.5 {unit || '°C'}
                <br />
                Rango Normal: 20-40°C
              </p>
              <span className="tooltip-pointer">
                <img src={ASSETS.charts.tooltipPointer} alt="" />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* X-Axis */}
      <div className="chart-axis chart-axis--bottom">
        {xAxisLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      {/* Chart Legend */}
      <div className="chart-legend">
        <span className="legend-item legend-item--blue">{title}</span>
        <span className="legend-item legend-item--teal">Rango Normal</span>
      </div>
    </div>
  );
}
