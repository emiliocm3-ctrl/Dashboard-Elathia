# Migration Guide: From Old to New Dashboard Code

## Quick Start

### Step 1: Set Up Environment Variables

Create a `.env` file in your project root:

```bash
# .env
REACT_APP_ASSET_URL=http://localhost:3845/assets

# For production:
# REACT_APP_ASSET_URL=https://your-cdn.com/assets
```

### Step 2: Test the New Components

Import and test the refactored dashboard:

```javascript
// In your main App.js or routing file
import DashboardGeneral from './DashboardGeneralRefactored';

function App() {
  return <DashboardGeneral />;
}
```

### Step 3: Verify Everything Works

1. **Check assets load correctly**
   - All images should display
   - Logo renders properly
   - Icons appear in correct places

2. **Test interactivity**
   - Click "Actualizar Datos" button (check console)
   - Click "Ver Sector" on cards (check console)
   - Click edit icons in sidebar (check console)
   - Click "Cerrar Sesión" (check console)

3. **Check responsive layout**
   - Test different screen sizes
   - Ensure no layout breaks

### Step 4: Delete Old Files (Optional)

Once you've verified the new code works, you can safely delete these 12 duplicate files:

```bash
# Files that can be deleted:
rm DashboardGeneral.jsx
rm DashboardGeneralCambio.jsx
rm DashboardGeneralCambiarNombre.jsx
rm DashboardGeneralCambioPendiente.jsx
rm DashboardGeneralPorSector.jsx
rm DashboardGeneralPorSectorDropdown.jsx
rm DashboardGeneralPorSectorPorSensor.jsx
rm DashboardGeneralNoInternet.jsx
rm DashboardGeneralMobile.jsx
rm DashboardGeneralMobileNoInternet.jsx
rm DashboardGeneralIPhone16Plus.jsx
rm DashboardGeneralIPhone16PlusSensorTotal.jsx

# Then rename the refactored version:
mv DashboardGeneralRefactored.jsx DashboardGeneral.jsx
```

---

## Adding Real Data Integration

### Example: Fetching Data from API

```javascript
import { useState, useEffect } from 'react';

export default function DashboardGeneral() {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/sectors');
      const data = await response.json();
      setSectors(data.sectors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard-general">
      {/* Your dashboard JSX */}
    </div>
  );
}
```

---

## Customizing for Different Views

### Example: Dashboard with Dropdown Selector

```javascript
import { useState } from 'react';
import { SECTORS, ZONES } from './constants';
import SensorDropdown from './SensorDropdown';

export default function DashboardWithDropdown() {
  const [selectedView, setSelectedView] = useState('sectors');

  return (
    <Dashboard
      title={selectedView === 'sectors' ? 'Por Sector' : 'Por Zona'}
      sectors={selectedView === 'sectors' ? SECTORS : ZONES}
      headerExtra={
        <SensorDropdown
          value={selectedView}
          onChange={setSelectedView}
          options={[
            { value: 'sectors', label: 'Ver por Sectores' },
            { value: 'zones', label: 'Ver por Zonas' }
          ]}
        />
      }
    />
  );
}
```

### Example: No Internet Warning

```javascript
import { useState, useEffect } from 'react';

export default function DashboardWithOfflineDetection() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Dashboard
      hasInternetConnection={isOnline}
      // Component will show warning banner when offline
    />
  );
}
```

---

## Component Usage Examples

### Using Individual Components

```javascript
import { MetricCard, SummaryBlock, ChartCard } from './components';

// Custom dashboard layout
function CustomDashboard() {
  return (
    <div className="my-custom-dashboard">
      <h1>My Custom View</h1>

      {/* Single metric card */}
      <MetricCard
        sectorName="Sector 1"
        metrics={[
          { label: 'Temperatura', value: '23.6°C', status: 'ok' },
          { label: 'Humedad', value: '76%', status: 'warning' }
        ]}
        onViewSector={() => console.log('View')}
      />

      {/* Summary blocks */}
      <div className="summary-row">
        <SummaryBlock
          metricType="temperature"
          value="23.4"
          unit="°C"
          status="ok"
        />
        <SummaryBlock
          metricType="humidity"
          value="45"
          unit="%"
          status="warning"
          statusText="¡Atención! Humedad baja"
        />
      </div>

      {/* Chart */}
      <ChartCard
        title="Temperatura - Último Mes"
        timeRange="Mensual"
        chartLines={[ASSETS.charts.lineA]}
      />
    </div>
  );
}
```

---

## Troubleshooting

### Issue: Images not loading

**Solution:** Check your `.env` file has correct `REACT_APP_ASSET_URL`:
```bash
# Make sure this matches your asset server
REACT_APP_ASSET_URL=http://localhost:3845/assets
```

Restart your dev server after changing `.env`.

### Issue: Components not found

**Solution:** Ensure all component files are in the `components/` folder:
```bash
components/
├── Logo.jsx
├── Sidebar.jsx
├── MetricCard.jsx
├── SummaryBlock.jsx
├── ChartCard.jsx
└── index.js
```

### Issue: Constants not importing

**Solution:** Check that `constants.js` and `assets.js` are in the root of your Dashboard folder:
```bash
Dashboard/
├── assets.js          ← Should be here
├── constants.js       ← Should be here
├── components/
```

### Issue: Styling looks broken

**Solution:** Ensure CSS files are imported:
```javascript
import './DashboardGeneral.css';
```

The refactored components use the same CSS classes, so existing styles should work.

---

## Next Steps

1. **Add TypeScript** (optional but recommended)
2. **Write unit tests** for new components
3. **Set up API endpoints** and integrate real data
4. **Add error boundaries** for better error handling
5. **Implement authentication** for logout functionality
6. **Add loading states** during data fetching
7. **Optimize performance** with React.memo where needed

---

## Need Help?

If you encounter issues during migration:

1. Check this guide for common solutions
2. Review `REFACTORING_SUMMARY.md` for detailed explanations
3. Examine the component code - it's well-commented
4. Test components individually before full integration

Good luck with your migration! 🚀
