import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RotaProtegida() {
  const { autenticado } = useAuth();
  const local = useLocation();

  return autenticado
    ? <Outlet />
    : <Navigate to="/login" replace state={{ de: local }} />;
}

export function RotaPublica() {
  const { autenticado } = useAuth();
  const local = useLocation();

  return autenticado
    ? <Navigate to={local.state?.de?.pathname ?? '/'} replace />
    : <Outlet />;
}