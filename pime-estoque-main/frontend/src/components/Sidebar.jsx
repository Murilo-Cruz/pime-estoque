import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  UserRound,
  PackagePlus,
  ShoppingCart,
  Wallet,
  CircleUserRound,
  LogOut,
} from 'lucide-react';

import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

const itens = [
  { nome: 'Dashboard', icone: LayoutDashboard, rota: '/' },
  { nome: 'Produtos', icone: Package, rota: '/produtos' },
  { nome: 'Clientes', icone: UserRound, rota: '/clientes' },
  { nome: 'Fornecedores', icone: Users, rota: '/fornecedores' },
  { nome: 'Entradas', icone: PackagePlus, rota: '/entradas' },
  { nome: 'Pedidos', icone: ShoppingCart, rota: '/pedidos' },
  { nome: 'Financeiro', icone: Wallet, rota: '/financeiro' },
];

export default function Sidebar() {
  const { usuario, sair } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Logo />
      </div>

      <nav>
        <ul>
          {itens.map(({ nome, icone: Icone, rota }) => (
            <li key={nome}>
              {rota ? (
                <NavLink to={rota} end={rota === '/'} className="sidebar-link">
                  <Icone size={22} />
                  <span className="sidebar-label">{nome}</span>
                </NavLink>
              ) : (
                <span className="sidebar-link">
                  <Icone size={22} />
                  <span className="sidebar-label">{nome}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <button type="button" className="sidebar-sair" onClick={sair}>
        <LogOut size={22} />
        <span className="sidebar-label">Sair</span>
      </button>

      <div className="sidebar-usuario">
        <CircleUserRound size={30} />
        <span className="sidebar-label">{usuario?.nome ?? 'Usuário'}</span>
      </div>
    </aside>
  );
}