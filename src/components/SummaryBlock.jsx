import { ASSETS } from '../config/assets';
import { METRICS } from '../config/constants';

/**
 * SummaryBlock Component
 * Displays a summary block with metric information, icon, value and status
 *
 * @param {Object} props
 * @param {string} props.metricType - Type of metric (temperature, humidity, etc.)
 * @param {number} props.value - Current metric value
 * @param {string} props.unit - Unit of measurement
 * @param {string} props.statusText - Status message text
 * @param {'ok'|'warning'|'critical'} props.status - Status indicator
 */
export default function SummaryBlock({
  metricType,
  value,
  unit,
  statusText = '¡Bien! Estado óptimo.',
  status = 'ok',
}) {
  const metric = METRICS[metricType];
  const iconSrc = ASSETS.metrics[metricType];

  return (
    <div className="summary-block">
      <div className="summary-title">
        <h4>{metric?.name || metricType}</h4>
        <span>
          Rango Óptimo: {metric?.optimalRange}
          {metric?.unit}
        </span>
      </div>
      <div className="summary-value">
        <img src={iconSrc} alt="" />
        <div className="summary-reading">
          <strong>{value}</strong>
          <span>{unit}</span>
        </div>
      </div>
      <div className="status">
        <span className={`status-dot status-dot--${status}`} />
        {statusText}
      </div>
    </div>
  );
}
