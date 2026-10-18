import {
  LayoutDashboard,
  Package,
  Users,
  PackagePlus,
  ShoppingCart,
  Wallet,
  CircleUserRound,
} from 'lucide-react';

import Logo from './Logo';

const itens = [
  { nome: 'Dashboard', icone: LayoutDashboard },
  { nome: 'Produtos', icone: Package },
  { nome: 'Emitentes', icone: Users },
  { nome: 'Entradas', icone: PackagePlus },
  { nome: 'Pedidos', icone: ShoppingCart },
  { nome: 'Financeiro', icone: Wallet },
];

export default function Sidebar() {
  const nomeUsuario = 'Usuário';

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

      <div className="sidebar-usuario">
        <CircleUserRound size={30} />
        <span className="sidebar-label">{nomeUsuario}</span>
      </div>
    </aside>
  );
}