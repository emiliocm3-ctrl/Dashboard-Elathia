import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RADIAN = Math.PI / 180;

const STATUS_COLORS = {
  good: { needle: '#16a34a', glow: 'rgba(22, 163, 74, 0.25)' },
  warning: { needle: '#d97706', glow: 'rgba(217, 119, 6, 0.25)' },
  critical: { needle: '#dc2626', glow: 'rgba(220, 38, 38, 0.25)' },
};

function getStatus(value, min, max, optMin, optMax) {
  if (value >= optMin && value <= optMax) return 'good';
  const distFromOpt = value < optMin
    ? (optMin - value) / (optMin - min || 1)
    : (value - optMax) / (max - optMax || 1);
  return distFromOpt > 0.6 ? 'critical' : 'warning';
}

export default function GaugeChart({
  value,
  min = 0,
  max = 100,
  optimalMin,
  optimalMax,
  unit = '',
  label = '',
  size = 140,
}) {
  const clamped = Math.max(min, Math.min(max, value ?? min));
  const pct = ((clamped - min) / (max - min)) * 100;
  const oMin = optimalMin ?? min + (max - min) * 0.3;
  const oMax = optimalMax ?? min + (max - min) * 0.7;
  const status = getStatus(clamped, min, max, oMin, oMax);
  const colors = STATUS_COLORS[status];

  const oMinPct = ((oMin - min) / (max - min)) * 100;
  const oMaxPct = ((oMax - min) / (max - min)) * 100;

  const data = [
    { value: Math.max(0, oMinPct), color: '#fcd34d' },
    { value: Math.max(0, oMaxPct - oMinPct), color: '#6ee7b7' },
    { value: Math.max(0, 100 - oMaxPct), color: '#fca5a5' },
  ];

  const cx = size / 2;
  const cy = size * 0.58;
  const innerR = size * 0.28;
  const outerR = size * 0.43;
  const trackR = outerR + 2;

  const needleLen = innerR - 6;
  const needleAngle = 180 - (pct / 100) * 180;
  const nx = cx + needleLen * Math.cos(-RADIAN * needleAngle);
  const ny = cy + needleLen * Math.sin(-RADIAN * needleAngle);

  const displayValue = value != null ? (typeof value === 'number' ? value.toFixed(1) : value) : '--';

  return (
    <div className="gauge-chart" style={{ width: size, height: size * 0.72, position: 'relative' }}>
      <ResponsiveContainer width="100%" height={size * 0.62}>
        <PieChart>
          <defs>
            <filter id={`glow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <Pie
            data={[{ value: 100 }]}
            cx={cx}
            cy={cy}
            startAngle={180}
            endAngle={0}
            innerRadius={innerR - 1}
            outerRadius={trackR}
            dataKey="value"
            stroke="none"
            isAnimationActive={false}
          >
            <Cell fill="#f1f5f9" />
          </Pie>
          <Pie
            data={data}
            cx={cx}
            cy={cy}
            startAngle={180}
            endAngle={0}
            innerRadius={innerR}
            outerRadius={outerR}
            dataKey="value"
            stroke="none"
            isAnimationActive={true}
            animationDuration={700}
            animationEasing="ease-out"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: size * 0.62, pointerEvents: 'none' }}
        viewBox={`0 0 ${size} ${size * 0.62}`}
      >
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={colors.needle}
          strokeWidth={3}
          strokeLinecap="round"
          filter={`url(#glow-${label})`}
        />
        <circle cx={cx} cy={cy} r={5} fill="#fff" stroke={colors.needle} strokeWidth={2} />
      </svg>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        lineHeight: 1.1,
      }}>
        <span style={{
          fontSize: Math.max(size * 0.18, 16),
          fontWeight: 700,
          color: '#1a1f25',
          letterSpacing: '-0.02em',
        }}>
          {displayValue}
        </span>
        {unit && (
          <span style={{
            fontSize: Math.max(size * 0.1, 10),
            color: '#4b5563',
            fontWeight: 500,
            marginLeft: 2,
          }}>
            {unit}
          </span>
        )}
        {label && (
          <div style={{
            fontSize: Math.max(size * 0.085, 10),
            color: '#6b7280',
            marginTop: 3,
            fontWeight: 600,
            letterSpacing: '0.01em',
          }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
