import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardGeneral from "./DashboardGeneral";
import LoginScreen from "./LoginScreen";

function LoginRoute() {
  return <LoginScreen onLogin={() => window.location.href = "/"} />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route
              path="/ranches/:ranchId/sectors/:sectorId"
              element={<DashboardGeneral />}
            />
            <Route
              path="/ranches/:ranchId"
              element={<DashboardGeneral />}
            />
            <Route
              path="/"
              element={<DashboardGeneral />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
