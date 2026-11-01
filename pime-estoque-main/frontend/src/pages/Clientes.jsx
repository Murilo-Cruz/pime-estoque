import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EllipsisVertical,
  FilterX,
  History,
  Pencil,
  Search,
  TriangleAlert,
  Upload,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import ClienteDrawer from '../components/ClienteDrawer';
import { clientes, kpis, segmentos, ufs } from '../data/clientes';
import './Clientes.css';

const filtrosIniciais = { busca: '', segmento: '', status: '', uf: '' };

const rotuloStatus = { ativo: 'Ativo', bloqueado: 'Bloqueado', analise: 'Em Análise' };

function Pagina({ exibindo, total }) {
  const [pagina, setPagina] = useState(1);
  const ultima = 143;

  const botao = (n) => (
    <button
      key={n}
      type="button"
      className={`pager-btn ${pagina === n ? 'ativo' : ''}`}
      onClick={() => setPagina(n)}
    >
      {n}
    </button>
  );

  return (
    <div className="table-footer">
      <span>
        Exibindo <strong>{exibindo}</strong> de <strong>{total}</strong> clientes
      </span>

      <div className="pager">
        <button
          type="button"
          className="pager-btn"
          disabled={pagina === 1}
          onClick={() => setPagina((p) => p - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft size={14} />
        </button>
        {[1, 2, 3].map(botao)}
        <span className="pager-reticencias">...</span>
        {botao(ultima)}
        <button
          type="button"
          className="pager-btn"
          disabled={pagina === ultima}
          onClick={() => setPagina((p) => p + 1)}
          aria-label="Próxima página"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Clientes() {
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [selecionados, setSelecionados] = useState(['CLI-0841']);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  const filtrados = useMemo(() => {
    const termo = filtros.busca.trim().toLowerCase();
    return clientes.filter((c) => {
      const bateBusca =
        !termo ||
        c.razao.toLowerCase().includes(termo) ||
        c.cnpj.includes(termo) ||
        c.codigo.toLowerCase().includes(termo);
      return (
        bateBusca &&
        (!filtros.segmento || c.segmento === filtros.segmento) &&
        (!filtros.status || c.status === filtros.status) &&
        (!filtros.uf || c.uf === filtros.uf)
      );
    });
  }, [filtros]);

  const mudar = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  const todosMarcados =
    filtrados.length > 0 && filtrados.every((c) => selecionados.includes(c.codigo));

  const alternar = (codigo) =>
    setSelecionados((s) => (s.includes(codigo) ? s.filter((x) => x !== codigo) : [...s, codigo]));

  const alternarTodos = () =>
    setSelecionados(todosMarcados ? [] : filtrados.map((c) => c.codigo));

  const abrirEdicao = (cliente) => {
    setClienteEditando(cliente);
    setDrawerAberto(true);
  };

  const abrirNovo = () => {
    setClienteEditando(null);
    setDrawerAberto(true);
  };

  return (
    <div className="dashboard clientes-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow"><UsersRound size={14} /> CADASTRO</span>
          <h1>Gestão de Clientes</h1>
          <p>Controle cadastral, limites de crédito, histórico fiscal e vínculo com pedidos de venda.</p>
        </div>

        <div className="page-actions">
          <button type="button" className="primary-button" onClick={abrirNovo}>
            <UserPlus size={15} /> Novo Cliente
          </button>
        </div>
      </div>

      <section className="stats-grid" aria-label="Resumo de clientes">
        {kpis.map(({ titulo, valor, badge, detalhe, icone: Icone, cor }) => (
          <article className={`stat-card ${cor}`} key={titulo}>
            <div className="stat-card-top">
              <span>{titulo}</span>
              <span className={`stat-icon ${cor}`}><Icone size={19} /></span>
            </div>
            <div className="stat-value">
              <strong>{valor}</strong>
              <span className={`stat-badge ${cor}`}>{badge}</span>
            </div>
            <p>{detalhe}</p>
          </article>
        ))}
      </section>

      <section className="filters-bar">
        <div className="search-field">
          <Search size={16} />
          <input
            type="text"
            value={filtros.busca}
            onChange={mudar('busca')}
            placeholder="Buscar por razão social, CNPJ ou código..."
          />
        </div>

        <select value={filtros.segmento} onChange={mudar('segmento')} aria-label="Segmento">
          <option value="">Segmento: Todos</option>
          {segmentos.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={filtros.status} onChange={mudar('status')} aria-label="Status">
          <option value="">Status: Todos</option>
          <option value="ativo">Ativo</option>
          <option value="bloqueado">Bloqueado</option>
          <option value="analise">Em Análise</option>
        </select>

        <select value={filtros.uf} onChange={mudar('uf')} aria-label="UF">
          <option value="">UF: Todas</option>
          {ufs.map(([sigla, nome]) => <option key={sigla} value={sigla}>{nome}</option>)}
        </select>

        <button type="button" className="secondary-button" onClick={() => setFiltros(filtrosIniciais)}>
          <FilterX size={14} /> Limpar
        </button>
      </section>

      <section className="dashboard-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="col-check">
                  <input type="checkbox" checked={todosMarcados} onChange={alternarTodos} aria-label="Selecionar todos" />
                </th>
                <th>Código</th>
                <th>Cliente / CNPJ</th>
                <th>Segmento / UF</th>
                <th>Contato</th>
                <th className="col-num">Limite disponível</th>
                <th className="col-num">Pedidos abertos</th>
                <th>Status fiscal</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => {
                const bloqueado = c.status === 'bloqueado';
                return (
                  <tr key={c.codigo} className={bloqueado ? 'linha-bloqueada' : ''}>
                    <td className="col-check">
                      <input
                        type="checkbox"
                        checked={selecionados.includes(c.codigo)}
                        onChange={() => alternar(c.codigo)}
                        aria-label={`Selecionar ${c.razao}`}
                      />
                    </td>
                    <td className={`codigo ${bloqueado ? 'erro' : ''}`}>{c.codigo}</td>
                    <td>
                      <div className="product-cell">
                        <span>
                          <strong>
                            {c.razao}
                            {bloqueado && <TriangleAlert size={13} className="icone-alerta" />}
                          </strong>
                          <small>{c.cnpj} • IE {c.ie}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="tag">{c.segmento}</span>
                      <span className="tag uf">{c.uf}</span>
                    </td>
                    <td>
                      <div className="celula-dupla">
                        <span>{c.email}</span>
                        <small>{c.telefone}</small>
                      </div>
                    </td>
                    <td className="col-num">
                      <div className="celula-dupla">
                        <span className={`valor ${c.status}`}>{c.limite}</span>
                        <small className={c.status !== 'ativo' ? c.status : ''}>{c.limiteNota}</small>
                      </div>
                    </td>
                    <td className="col-num">
                      <div className="celula-dupla">
                        <span className="valor neutro">{c.pedidos}</span>
                        <small className={bloqueado ? 'bloqueado' : ''}>{c.pedidosNota}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`pill ${c.status}`}>
                        <span />{rotuloStatus[c.status]}
                      </span>
                    </td>
                    <td>
                      <div className="acoes">
                        <button type="button" title="Editar cliente" onClick={() => abrirEdicao(c)}>
                          <Pencil size={15} />
                        </button>
                        <button type="button" title="Ver histórico">
                          <Eye size={15} />
                        </button>
                        {bloqueado ? (
                          <button type="button" className="perigo" title="Histórico de inadimplência">
                            <History size={15} />
                          </button>
                        ) : (
                          <button type="button" title="Mais ações">
                            <EllipsisVertical size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={9} className="vazio">Nenhum cliente encontrado com esses filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagina exibindo={filtrados.length} total={clientes.length} />
      </section>

      <p className="demo-note">Dados ilustrativos para visualização da interface.</p>

      <ClienteDrawer
        aberto={drawerAberto}
        cliente={clienteEditando}
        onClose={() => setDrawerAberto(false)}
      />
    </div>
  );
}