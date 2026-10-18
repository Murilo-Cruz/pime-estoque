import { Activity, ArrowDownToLine, ArrowUpFromLine, Boxes, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import MainLayout from './layouts/MainLayout';
import Login from './components/Login';
import Register from './components/Register'
const resumo = [
  { titulo: 'Total de produtos', valor: '1.284', detalhe: '+8,2% este mês', icone: Boxes, cor: 'green' },
  { titulo: 'Entradas do mês', valor: '356', detalhe: 'Últimos 30 dias', icone: ArrowDownToLine, cor: 'cyan' },
  { titulo: 'Saídas do mês', valor: '219', detalhe: 'Últimos 30 dias', icone: ArrowUpFromLine, cor: 'green' },
  { titulo: 'Pedidos pendentes', valor: '18', detalhe: 'Precisam de atenção', icone: ShoppingCart, cor: 'cyan' },
];

const movimentacoes = [
  { nome: 'Notebook Lenovo ThinkPad', tipo: 'Entrada', codigo: 'PRD-1024', data: '17/10/2026', quantidade: '+24', status: 'Concluído' },
  { nome: 'Mouse sem fio Logitech', tipo: 'Saída', codigo: 'PRD-0871', data: '17/10/2026', quantidade: '-12', status: 'Concluído' },
  { nome: 'Monitor Dell 24 polegadas', tipo: 'Entrada', codigo: 'PRD-0442', data: '16/10/2026', quantidade: '+8', status: 'Em andamento' },
  { nome: 'Teclado mecânico', tipo: 'Saída', codigo: 'PRD-0318', data: '16/10/2026', quantidade: '-6', status: 'Concluído' },
];

function Dashboard() {
  return (
    <MainLayout>
      <div className="dashboard">
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow"><Activity size={14} /> VISÃO GERAL</span>
            <h1>Dashboard</h1>
            <p>Acompanhe os indicadores e a movimentação do seu estoque.</p>
          </div>
          <div className="dashboard-date">17 de outubro de 2026</div>
        </div>

        <section className="stats-grid" aria-label="Resumo do estoque">
          {resumo.map(({ titulo, valor, detalhe, icone: Icone, cor }) => (
            <article className="stat-card" key={titulo}>
              <div className="stat-card-top"><span>{titulo}</span><span className={`stat-icon ${cor}`}><Icone size={19} /></span></div>
              <strong>{valor}</strong>
              <p><TrendingUp size={14} /> {detalhe}</p>
            </article>
          ))}
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div><h2>Movimentações recentes</h2><p>Últimas entradas e saídas registradas no sistema</p></div>
            <button type="button" className="secondary-button">Ver movimentações</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Produto</th><th>Tipo</th><th>Data</th><th>Quantidade</th><th>Status</th></tr></thead>
              <tbody>{movimentacoes.map((item) => <tr key={item.codigo}>
                <td><div className="product-cell"><span className="product-icon"><Package size={17} /></span><span><strong>{item.nome}</strong><small>{item.codigo}</small></span></div></td>
                <td><span className={`movement-type ${item.tipo === 'Entrada' ? 'entrada' : 'saida'}`}>{item.tipo}</span></td>
                <td>{item.data}</td><td className={item.quantidade.startsWith('+') ? 'quantity-positive' : 'quantity-negative'}>{item.quantidade} un.</td>
                <td><span className={`status ${item.status === 'Concluído' ? 'complete' : 'pending'}`}><span />{item.status}</span></td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>
        <p className="demo-note">Dados ilustrativos para visualização da interface.</p>
      </div>
    </MainLayout>
  );
}

export default function App() {
  const caminho = window.location.pathname;

  // A tela de login é apenas visual, sem autenticação obrigatória.
  if (caminho === '/login') {
    return <Login />;
  }
  
  if (caminho === '/registrar') {
    return <Register />;
  }
  // Todas as outras rotas abrem o dashboard.
  return <Dashboard />;
}

