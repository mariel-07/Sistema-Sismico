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
import { useAuth } from "./hooks/useAuth";

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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/map" element={<LiveMapPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/sources" element={<SourcesPage />} />
        <Route path="/sources/history" element={<SyncHistoryPage />} />
        <Route path="/datasets/quality" element={<DatasetQualityPage />} />
        <Route path="/ml/experiments" element={<ExperimentsPage />} />
        <Route path="/ml/experiments/:id" element={<ExperimentDetailPage />} />
        <Route path="/ml/models" element={<ModelsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/alerts/rules" element={<AlertRulesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/exports" element={<ExportsPage />} />
        <Route path="/audit/logs" element={<AuditLogsPage />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/roles" element={<RolesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help/guides" element={<TechnicalGuidesPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<ProtectedRoutes />} />
      </Routes>
    </AuthProvider>
  );
}
