import { LoaderCircle } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = () => {
  const { user, isLoading, sessionError } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="auth-loading" aria-live="polite">
        <LoaderCircle className="spin" size={30} />
        <strong>Restoring secure session…</strong>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location, sessionError }} />;
  }

  return <Outlet />;
};
