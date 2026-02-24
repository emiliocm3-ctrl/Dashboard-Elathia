// Application constants
// This file centralizes all hardcoded data used across the dashboard

export const ETAPAS_FENOLOGICAS = [
  {
    id: "germinacion",
    name: "Germinación",
    short: "GE",
    color: "#10B981", // green
    description: "Fase inicial de crecimiento",
  },
  {
    id: "crecimiento",
    name: "Crecimiento",
    short: "CR",
    color: "#3B82F6", // blue
    description: "Desarrollo vegetativo",
  },
  {
    id: "floracion",
    name: "Floración",
    short: "FL",
    color: "#F59E0B", // amber
    description: "Producción de flores",
  },
  {
    id: "fructificacion",
    name: "Fructificación",
    short: "FR",
    color: "#EF4444", // red
    description: "Formación de frutos",
  },
  {
    id: "maduracion",
    name: "Maduración",
    short: "MA",
    color: "#8B5CF6", // purple
    description: "Fase final de desarrollo",
  },
];


export const METRICS = {
  temperature: {
    name: "Temperatura",
    unit: "°C",
    optimalRange: "20-40",
    icon: "temperature",
  },
  humidity: {
    name: "Humedad",
    unit: "%",
    optimalRange: "70-80",
    icon: "humidity",
  },
  conductivity: {
    name: "Conductividad",
    unit: "mS/cm",
    optimalRange: "1-3",
    icon: "conductivity",
  },
  radiation: {
    name: "Radiación",
    unit: "W/m²",
    optimalRange: "400-600",
    icon: "radiation",
  },
  ph: {
    name: "Nivel de pH",
    unit: "",
    optimalRange: "6.0-7.0",
    icon: "ph",
  },
};

export const METRIC_KEYS = Object.keys(METRICS);

export const RISK_TYPES = {
  cenicilla: "Cenicilla",
  estresHidrico: "Estrés Hídrico",
  deficienciaNutricional: "Deficiencia Nutricional",
  plagasInsectos: "Plagas/Insectos",
};

export const USER_GREETING = {
  defaultName: "Emilio",
  message: "Hola",
};

export const CHART_CONFIG = {
  colors: {
    primary: "#10B981",
    secondary: "#3B82F6",
    warning: "#F59E0B",
    danger: "#EF4444",
  },
  timeRanges: ["1D", "1S", "1M", "3M", "1A"],
};

// Status indicators
export const STATUS = {
  NORMAL: "normal",
  WARNING: "warning",
  CRITICAL: "critical",
  OFFLINE: "offline",
};
