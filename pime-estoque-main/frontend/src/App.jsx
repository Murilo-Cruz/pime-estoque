import { Navigate, Route, Routes } from 'react-router-dom';
import { RotaProtegida, RotaPublica } from './routes/Rotas';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Login from './pages/Login';
import Register from './pages/Register';
import Emitentes from './pages/Emitentes';
import Produtos from './pages/Produtos';
import Entradas from './pages/Entradas';
import Pedidos from './pages/Pedidos';
import Financeiro from './pages/Financeiro';

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
          <Route path="produtos" element={<Produtos />} />
          <Route path="clientes" element={<Clientes/>}/>
          <Route path="emitentes" element={<Emitentes />} />
          <Route path="entradas" element={<Entradas />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="financeiro" element={<Financeiro />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}