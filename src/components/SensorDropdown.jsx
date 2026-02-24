import { ASSETS } from '../config/assets';

/**
 * SensorDropdown Component
 * Dropdown selector for choosing sensors within a sector
 *
 * @param {Object} props
 * @param {Array} props.sensors - Array of sensor objects or strings
 * @param {string|null} props.selectedSensor - Currently selected sensor
 * @param {Function} props.onChange - Callback when sensor is selected
 * @param {string} props.placeholder - Placeholder text when no sensor selected
 */
export default function SensorDropdown({
  sensors = [],
  selectedSensor = null,
  onChange,
  placeholder = '-- Total de Sensores --',
}) {
  const handleChange = (e) => {
    const value = e.target.value;
    onChange && onChange(value === '' ? null : value);
  };

  return (
    <div className="sensor-dropdown">
      <select
        className="sensor-select"
        value={selectedSensor || ''}
        onChange={handleChange}
      >
        <option value="">{placeholder}</option>
        {sensors.map((sensor, index) => {
          const sensorId = sensor.id || sensor;
          const sensorName = sensor.name || sensor;
          return (
            <option key={sensorId} value={sensorId}>
              {sensorName}
            </option>
          );
        })}
      </select>
      <span className="sensor-dropdown-icon">
        <img src={ASSETS.icons.chevronDown || ASSETS.icons.chevron} alt="" />
      </span>
    </div>
  );
}
