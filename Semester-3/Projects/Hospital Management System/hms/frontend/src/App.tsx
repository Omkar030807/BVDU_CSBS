import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdmissionsPage } from './pages/AdmissionsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { BillingPage } from './pages/BillingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { PatientsPage } from './pages/PatientsPage';
import { PharmacyPage } from './pages/PharmacyPage';
import { PrescriptionsPage } from './pages/PrescriptionsPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<LoginPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route element={<RoleRoute allowedRoles={['Admin', 'Receptionist']} />}>
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/billing" element={<BillingPage />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={['Admin', 'Doctor']} />}>
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={['Admin']} />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/pharmacy" element={<PharmacyPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
