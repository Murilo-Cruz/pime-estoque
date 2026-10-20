import { Navigate, Route, Routes } from 'react-router-dom';
import { RotaProtegida, RotaPublica } from './routes/Rotas';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <Routes>
      <Route element={<RotaPublica />}>
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Register />} />
      </Route>

      <Route element={<RotaProtegida />}>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}