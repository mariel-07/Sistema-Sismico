
import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

// Dashboard
import Dashboard from "./pages/Dashboard";

// Eventos y monitoreo
import EventsPage from "./pages/events/EventsPage";
import LiveMapPage from "./pages/events/LiveMapPage";
import StatisticsPage from "./pages/events/StatisticsPage";

// Fuentes de datos
import SourcesPage from "./pages/sources/SourcesPage";
import SyncHistoryPage from "./pages/sources/SyncHistoryPage";

// Datasets
import DatasetQualityPage from "./pages/datasets/DatasetQualityPage";

// Machine Learning
import ExperimentsPage from "./pages/ml/ExperimentsPage";
import ExperimentDetailPage from "./pages/ml/ExperimentDetailPage";
import ModelsPage from "./pages/ml/ModelsPage";

// Auditoría
import AuditLogsPage from "./pages/audit/AuditLogsPage";

// Administración
import UsersPage from "./pages/admin/UsersPage";
import RolesPage from "./pages/admin/RolesPage";


//Alertas
import AlertsPage from "./pages/alerts/AlertsPage";
import AlertRulesPage from "./pages/alerts/AlertRulesPage";


export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Redirección inicial */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Eventos y monitoreo sísmico */}
        <Route
          path="/events"
          element={<EventsPage />}
        />
        <Route
          path="/map"
          element={<LiveMapPage />}
        />
        <Route
          path="/statistics"
          element={<StatisticsPage />}
        />

        {/* Fuentes de datos */}
        <Route
          path="/sources"
          element={<SourcesPage />}
        />
        <Route
          path="/sources/history"
          element={<SyncHistoryPage />}
        />

        {/* Calidad de datasets */}
        <Route
          path="/datasets/quality"
          element={<DatasetQualityPage />}
        />

        {/* Machine Learning */}
        <Route
          path="/ml/experiments"
          element={<ExperimentsPage />}
        />
        <Route
          path="/ml/experiments/:id"
          element={<ExperimentDetailPage />}
        />
        <Route path="/ml/models" element={<ModelsPage />} />
        <Route
          path="/ml/models"
          element={<ModelsPage />}
        />

        {/* Auditoría y mapa de conexiones */}
        <Route
          path="/audit/logs"
          element={<AuditLogsPage />}
        />

        {/* Administración */}
        <Route
          path="/admin/users"
          element={<UsersPage />}
        />
        <Route
          path="/admin/roles"
          element={<RolesPage />}
        />

        {/* Alertas */}

        <Route path="/alerts" element={<AlertsPage />} />
<Route path="/alerts/rules" element={<AlertRulesPage />} />
        {/* Página no encontrada */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Route>
    </Routes>
  );
}
