import "./SensorDropdown.css";

export default function SensorDropdown() {
  return (
    <div className="sensor-dropdown" data-node-id="157:15155">
      <div className="sensor-dropdown__list" aria-label="Sensores disponibles">
        {[
          "Sensor 1",
          "Sensor 2",
          "Sensor 3",
          "Sensor 4",
          "Sensor 5",
          "Sensor 6",
          "Sensor 7",
          "Sensor 8",
          "Sensor 9",
        ].map((label) => (
          <div className="sensor-dropdown__row" key={label}>
            {label}
          </div>
        ))}
      </div>
      <span className="sensor-dropdown__scrollbar" aria-hidden="true" />
    </div>
  );
}
