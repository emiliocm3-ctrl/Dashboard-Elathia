import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RADIAN = Math.PI / 180;

function getColor(value, min, max, optMin, optMax) {
  if (value >= optMin && value <= optMax) return '#22c55e';
  const distFromOpt = value < optMin
    ? (optMin - value) / (optMin - min || 1)
    : (value - optMax) / (max - optMax || 1);
  return distFromOpt > 0.6 ? '#ef4444' : '#f59e0b';
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
  const needleColor = getColor(clamped, min, max, oMin, oMax);

  const oMinPct = ((oMin - min) / (max - min)) * 100;
  const oMaxPct = ((oMax - min) / (max - min)) * 100;

  const data = [
    { value: Math.max(0, oMinPct), color: '#fef3c7' },
    { value: Math.max(0, oMaxPct - oMinPct), color: '#dcfce7' },
    { value: Math.max(0, 100 - oMaxPct), color: '#fee2e2' },
  ];

  const cx = size / 2;
  const cy = size * 0.6;
  const innerR = size * 0.3;
  const outerR = size * 0.44;

  const needleAngle = 180 - (pct / 100) * 180;
  const nx = cx + (innerR - 4) * Math.cos(-RADIAN * needleAngle);
  const ny = cy + (innerR - 4) * Math.sin(-RADIAN * needleAngle);

  const displayValue = value != null ? (typeof value === 'number' ? value.toFixed(1) : value) : '--';

  return (
    <div className="gauge-chart" style={{ width: size, height: size * 0.7, position: 'relative' }}>
      <ResponsiveContainer width="100%" height={size * 0.7}>
        <PieChart>
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
            animationDuration={800}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox={`0 0 ${size} ${size * 0.7}`}
      >
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={needleColor}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={3} fill={needleColor} />
      </svg>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        lineHeight: 1,
      }}>
        <span style={{ fontSize: size * 0.17, fontWeight: 700, color: needleColor }}>
          {displayValue}
        </span>
        {unit && <span style={{ fontSize: size * 0.1, color: '#6b7280', marginLeft: 2 }}>{unit}</span>}
        {label && (
          <div style={{ fontSize: size * 0.085, color: '#9ca3af', marginTop: 2, fontWeight: 500 }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
