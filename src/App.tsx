import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import EventsPage from "./pages/events/EventsPage";
import LiveMapPage from "./pages/events/LiveMapPage";
import StatisticsPage from "./pages/events/StatisticsPage";
import SourcesPage from "./pages/sources/SourcesPage";
import SyncHistoryPage from "./pages/sources/SyncHistoryPage";
import DatasetQualityPage from "./pages/datasets/DatasetQualityPage";
import ExperimentsPage from "./pages/ml/ExperimentsPage";
import ExperimentDetailPage from "./pages/ml/ExperimentDetailPage";
import ModelsPage from "./pages/ml/ModelsPage";
import AuditLogsPage from "./pages/audit/AuditLogsPage";
import UsersPage from "./pages/admin/UsersPage";
import RolesPage from "./pages/admin/RolesPage";
import AlertsPage from "./pages/alerts/AlertsPage";
import AlertRulesPage from "./pages/alerts/AlertRulesPage";
import ReportsPage from "./pages/reports/ReportsPage";
import ExportsPage from "./pages/reports/ExportsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import TechnicalGuidesPage from "./pages/help/TechnicalGuidesPage";
import HelpCenterPage from "./pages/help/HelpCenterPage";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/landing/LandingPage";
import { useAuth } from "./hooks/useAuth";

// Componente para validar si el usuario tiene el rol requerido
function RequireRole({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: ReactElement;
}) {
  const { user } = useAuth();

  // Si el usuario no tiene uno de los roles autorizados, lo redirige al Dashboard
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function ProtectedRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center">Verificando sesión…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Rutas accesibles por todos los usuarios autenticados */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/map" element={<LiveMapPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/exports" element={<ExportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help/guides" element={<TechnicalGuidesPage />} />
        <Route path="/help" element={<HelpCenterPage />} />

        {/* Módulo de Machine Learning (Administrador, Analista ML, Auditor) */}
        <Route
          path="/datasets/quality"
          element={
            <RequireRole allowedRoles={["Administrador", "Analista ML", "Auditor"]}>
              <DatasetQualityPage />
            </RequireRole>
          }
        />
        <Route
          path="/ml/experiments"
          element={
            <RequireRole allowedRoles={["Administrador", "Analista ML", "Auditor"]}>
              <ExperimentsPage />
            </RequireRole>
          }
        />
        <Route
          path="/ml/experiments/:id"
          element={
            <RequireRole allowedRoles={["Administrador", "Analista ML", "Auditor"]}>
              <ExperimentDetailPage />
            </RequireRole>
          }
        />
        <Route
          path="/ml/models"
          element={
            <RequireRole allowedRoles={["Administrador", "Analista ML", "Auditor"]}>
              <ModelsPage />
            </RequireRole>
          }
        />

        {/* Módulo de Alertas y Fuentes (Administrador, Operador de alertas, Auditor) */}
        <Route
          path="/alerts"
          element={
            <RequireRole allowedRoles={["Administrador", "Operador de alertas", "Auditor"]}>
              <AlertsPage />
            </RequireRole>
          }
        />
        <Route
          path="/alerts/rules"
          element={
            <RequireRole allowedRoles={["Administrador", "Operador de alertas"]}>
              <AlertRulesPage />
            </RequireRole>
          }
        />
        <Route
          path="/sources"
          element={
            <RequireRole allowedRoles={["Administrador", "Operador de alertas", "Auditor"]}>
              <SourcesPage />
            </RequireRole>
          }
        />
        <Route
          path="/sources/history"
          element={
            <RequireRole allowedRoles={["Administrador", "Operador de alertas", "Auditor"]}>
              <SyncHistoryPage />
            </RequireRole>
          }
        />

        {/* Módulo de Auditoría (Administrador, Auditor) */}
        <Route
          path="/audit/logs"
          element={
            <RequireRole allowedRoles={["Administrador", "Auditor"]}>
              <AuditLogsPage />
            </RequireRole>
          }
        />

        {/* Módulo de Administración (Exclusivo para Administrador) */}
        <Route
          path="/admin/users"
          element={
            <RequireRole allowedRoles={["Administrador"]}>
              <UsersPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <RequireRole allowedRoles={["Administrador"]}>
              <RolesPage />
            </RequireRole>
          }
        />

        {/* Ruta por defecto para usuarios autenticados */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<ProtectedRoutes />} />
      </Routes>
    </AuthProvider>
  );
}
