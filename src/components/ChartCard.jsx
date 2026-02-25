import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  Legend,
} from 'recharts';

function formatAxisTime(timestamp, range) {
  const d = new Date(timestamp);
  if (range === '7d' || range === '30d') {
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
  }
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function CustomTooltip({ active, payload, label, unit, title }) {
  if (!active || !payload?.length) return null;
  const d = new Date(label);
  const timeStr = d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      fontSize: 13,
    }}>
      <div style={{ color: '#6b7280', marginBottom: 4, fontWeight: 500 }}>{timeStr}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {Number(p.value).toFixed(1)} {unit}
        </div>
      ))}
    </div>
  );
}

export default function ChartCard({
  title,
  metricType,
  timeRange = '24h',
  ranges = ['8h', '24h', '7d'],
  onRangeChange,
  series = [],
  unit = '',
  optimalMin,
  optimalMax,
  color = '#337fcc',
  gradientId,
  secondSeries,
  secondColor = '#4cb3a0',
  secondLabel,
  height = 220,
}) {
  const { t } = useTranslation();
  const [selectedRange, setSelectedRange] = useState(timeRange);

  useEffect(() => {
    setSelectedRange(timeRange);
  }, [timeRange]);

  const chartData = useMemo(() => {
    return series
      .map((point) => ({
        time: point.x ? new Date(point.x).getTime() : 0,
        value: typeof point.y === 'string' ? parseFloat(point.y) : point.y,
        ...(secondSeries ? {} : {}),
      }))
      .filter((p) => Number.isFinite(p.value) && p.time > 0);
  }, [series, secondSeries]);

  const mergedData = useMemo(() => {
    if (!secondSeries?.length) return chartData;
    const map = new Map(chartData.map((d) => [d.time, d]));
    secondSeries.forEach((p) => {
      const t = new Date(p.x).getTime();
      const val = typeof p.y === 'string' ? parseFloat(p.y) : p.y;
      if (!Number.isFinite(val)) return;
      if (map.has(t)) {
        map.get(t).value2 = val;
      } else {
        map.set(t, { time: t, value2: val });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.time - b.time);
  }, [chartData, secondSeries]);

  const yDomain = useMemo(() => {
    const vals = mergedData.map((d) => d.value).filter(Number.isFinite);
    const vals2 = mergedData.map((d) => d.value2).filter(Number.isFinite);
    const all = [...vals, ...vals2];
    if (!all.length) return [0, 100];
    let lo = Math.min(...all);
    let hi = Math.max(...all);
    if (optimalMin != null) lo = Math.min(lo, optimalMin);
    if (optimalMax != null) hi = Math.max(hi, optimalMax);
    const pad = (hi - lo) * 0.1 || 5;
    return [Math.floor(lo - pad), Math.ceil(hi + pad)];
  }, [mergedData, optimalMin, optimalMax]);

  const gId = gradientId || `grad_${metricType || title}`.replace(/\s/g, '_');

  const isEmpty = mergedData.length < 2;

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>{title}</h3>
        <div style={{ display: 'flex', gap: 4 }}>
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => {
                setSelectedRange(r);
                if (onRangeChange) onRangeChange(r);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: selectedRange === r ? '#1f4c7a' : '#f3f4f6',
                color: selectedRange === r ? '#fff' : '#6b7280',
                transition: 'all 150ms ease',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          fontSize: 14,
        }}>
          {t('chart.noData')}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={mergedData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              {secondSeries && (
                <linearGradient id={`${gId}_2`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={secondColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={secondColor} stopOpacity={0} />
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="time"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(v) => formatAxisTime(v, selectedRange)}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.toFixed(0)}
            />
            <Tooltip content={<CustomTooltip unit={unit} title={title} />} />
            {optimalMin != null && optimalMax != null && (
              <ReferenceArea
                y1={optimalMin}
                y2={optimalMax}
                fill="#22c55e"
                fillOpacity={0.06}
                strokeOpacity={0}
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gId})`}
              name={title}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: color }}
              animationDuration={600}
            />
            {secondSeries && (
              <Area
                type="monotone"
                dataKey="value2"
                stroke={secondColor}
                strokeWidth={2}
                fill={`url(#${gId}_2)`}
                name={secondLabel || 'Series 2'}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: secondColor }}
                animationDuration={600}
              />
            )}
            <Legend
              iconType="line"
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
