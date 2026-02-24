import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardGeneral from "./DashboardGeneral";
import LoginScreen from "./LoginScreen";

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function LoginRoute() {
  const { isAuthenticated, login } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <LoginScreen onLogin={login} />;
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
              element={
                <RequireAuth>
                  <DashboardGeneral />
                </RequireAuth>
              }
            />
            <Route
              path="/ranches/:ranchId"
              element={
                <RequireAuth>
                  <DashboardGeneral />
                </RequireAuth>
              }
            />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <DashboardGeneral />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
