import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./i18n";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import UserDashboard from "./components/user/UserDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import AlertsPage from "./components/shared/AlertsPage";
import NotificationPreferences from "./components/shared/NotificationPreferences";
import AppLayout from "./components/layout/AppLayout";
import LoginScreen from "./LoginScreen";

function LoginRoute() {
  return <LoginScreen onLogin={() => (window.location.href = "/")} />;
}

function DashboardRouter() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}

function AlertsRoute() {
  return (
    <AppLayout sidebar={null}>
      <AlertsPage />
    </AppLayout>
  );
}

function ProfileRoute() {
  return (
    <AppLayout sidebar={null}>
      <div style={{ maxWidth: 600 }}>
        <NotificationPreferences />
      </div>
    </AppLayout>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/alerts" element={<AlertsRoute />} />
            <Route path="/profile" element={<ProfileRoute />} />
            <Route path="/ranches/:ranchId/sectors/:sectorId" element={<DashboardRouter />} />
            <Route path="/ranches/:ranchId" element={<DashboardRouter />} />
            <Route path="/" element={<DashboardRouter />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
