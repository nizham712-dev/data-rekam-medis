import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { RoleGuard } from '@/features/auth/RoleGuard';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PatientsPage } from '@/features/patients/PatientsPage';
import { PatientDetailPage } from '@/features/patients/PatientDetailPage';
import { RecordsPage } from '@/features/records/RecordsPage';
import { SoapFormPage } from '@/features/records/SoapFormPage';
import { UsersPage } from '@/features/users/UsersPage';
import { ProfilePage } from '@/features/users/ProfilePage';
import { MedicinesPage } from '@/features/medicines/MedicinesPage';

function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
      <p className="text-kpi font-medium text-ink">404</p>
      <p className="text-body text-muted">Halaman yang Anda cari tidak tersedia.</p>
      <a href="/dashboard" className="mt-2 text-body font-medium text-accent hover:underline">Kembali ke dashboard</a>
    </div>
  );
}

export default function App() {
  const basePath = (import.meta.env.VITE_BASE_PATH ?? '').replace(/\/+$/, '');

  return (
    <BrowserRouter basename={basePath || '/'}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patients/:id" element={<PatientDetailPage />} />
          <Route path="records" element={<RecordsPage />} />
          <Route path="records/:id" element={<SoapFormPage />} />
          <Route
            path="users"
            element={
              <RoleGuard allow={['admin']}>
                <UsersPage />
              </RoleGuard>
            }
          />
          <Route
            path="medicines"
            element={
              <RoleGuard allow={['admin']}>
                <MedicinesPage />
              </RoleGuard>
            }
          />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
