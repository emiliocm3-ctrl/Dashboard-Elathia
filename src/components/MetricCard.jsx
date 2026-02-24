import { ASSETS } from '../config/assets';

/**
 * MetricCard Component
 * Displays a card with sector metrics
 *
 * @param {Object} props
 * @param {string} props.sectorName - Name of the sector
 * @param {Array} props.metrics - Array of metric objects
 * @param {Function} props.onViewSector - Callback when "Ver Sector" is clicked
 */
export default function MetricCard({ sectorName, metrics = [], onViewSector }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{sectorName}</h3>
        <button className="link-button" type="button" onClick={onViewSector}>
          Ver Sector
          <span className="icon-16">
            <img src={ASSETS.icons.arrowRight} alt="" />
          </span>
        </button>
      </div>
      {metrics.map((metric, index) => (
        <MetricRow
          key={index}
          label={metric.label}
          value={metric.value}
          status={metric.status}
        />
      ))}
    </div>
  );
}

/**
 * MetricRow Component
 * Displays a single metric row within a card
 *
 * @param {Object} props
 * @param {string} props.label - Metric label
 * @param {string} props.value - Metric value with unit
 * @param {'ok'|'warning'|'critical'} props.status - Metric status
 */
function MetricRow({ label, value, status = 'ok' }) {
  const statusClass = {
    ok: 'metric-ok',
    warning: 'metric-warning',
    critical: 'metric-critical',
  }[status];

  return (
    <div className="metric-row">
      <span>{label}</span>
      <span className={statusClass}>{value}</span>
    </div>
  );
}
