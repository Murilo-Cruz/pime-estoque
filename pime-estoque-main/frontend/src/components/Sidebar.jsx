import {
  LayoutDashboard,
  Package,
  Users,
  PackagePlus,
  ShoppingCart,
  Wallet,
  CircleUserRound,
  LogOut,
} from 'lucide-react';

import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

const itens = [
  { nome: 'Dashboard', icone: LayoutDashboard },
  { nome: 'Produtos', icone: Package },
  { nome: 'Emitentes', icone: Users },
  { nome: 'Entradas', icone: PackagePlus },
  { nome: 'Pedidos', icone: ShoppingCart },
  { nome: 'Financeiro', icone: Wallet },
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
          {itens.map((item) => {
            const Icone = item.icone;
            return (
              <li key={item.nome}>
                <Icone size={22} />
                <span className="sidebar-label">{item.nome}</span>
              </li>
            );
          })}
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