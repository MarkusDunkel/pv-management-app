import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from './protected-route';
import DemoLoginPage from '@/pages/DemoLoginPage';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const PanelSizeOptimizerPage = lazy(() => import('@/pages/PanelSizeOptimizerPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const DemoInvalidPage = lazy(() => import('@/pages/DemoInvalidPage'));

export const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />}
      />
      <Route path="/demo-access/:slug" element={<DemoLoginPage />} />
      <Route path="/demo-invalid" element={<DemoInvalidPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/panel-optimizer" element={<PanelSizeOptimizerPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
