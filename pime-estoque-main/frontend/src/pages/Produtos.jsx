import { useMemo, useState } from 'react';
import {
  BadgeCheck, Download, FilterX, History, ListChecks, MapPin, Network, PackagePlus,
  Pencil, Plus, ScanBarcode, Search, SlidersHorizontal, Trash2, Package,
} from 'lucide-react';
import ProdutoDrawer from '../components/ProdutoDrawer';
import ExcluirProdutoModal from '../components/ExcluirProdutoModal';
import Toast from '../components/Toast';
import {
  armazens, brl, categorias, distribuicaoCd, kpis, margem, nivelEstoque, niveis,
  produtosIniciais, rotuloNivel,
} from '../data/produtos';
import './Clientes.css'; // reaproveita KPIs, filtros, tabela, drawer (já são classes globais)
import './Produtos.css';

const filtrosIniciais = { busca: '', categoria: '', armazem: '', nivel: '', somenteAtivos: true };

const mapaCategoria = Object.fromEntries(categorias.map((c) => [c.valor, c]));

export default function Produtos() {
  const [produtos, setProdutos] = useState(produtosIniciais);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [selecionados, setSelecionados] = useState([]);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [produtoExcluindo, setProdutoExcluindo] = useState(null);
  const [toast, setToast] = useState(null);

  const avisar = (titulo, mensagem = '') => {
    setToast({ titulo, mensagem });
    setTimeout(() => setToast(null), 3500);
  };

  const filtrados = useMemo(() => {
    const termo = filtros.busca.trim().toLowerCase();
    return produtos.filter((p) => {
      const bateBusca =
        !termo ||
        p.sku.toLowerCase().includes(termo) ||
        p.ean.includes(termo) ||
        p.nome.toLowerCase().includes(termo) ||
        p.marca.toLowerCase().includes(termo);
      return (
        bateBusca &&
        (!filtros.categoria || p.categoria === filtros.categoria) &&
        (!filtros.armazem || p.cd === filtros.armazem) &&
        (!filtros.nivel || nivelEstoque(p) === filtros.nivel) &&
        (!filtros.somenteAtivos || p.ativo)
      );
    });
  }, [produtos, filtros]);

  const mudar = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  const todosMarcados = filtrados.length > 0 && filtrados.every((p) => selecionados.includes(p.sku));
  const alternar = (sku) =>
    setSelecionados((s) => (s.includes(sku) ? s.filter((x) => x !== sku) : [...s, sku]));
  const alternarTodos = () => setSelecionados(todosMarcados ? [] : filtrados.map((p) => p.sku));

  const abrirNovo = () => { setProdutoEditando(null); setDrawerAberto(true); };
  const abrirEdicao = (p) => { setProdutoEditando(p); setDrawerAberto(true); };
  const fecharDrawer = () => setDrawerAberto(false);

  const salvar = (dados) => {
    const existe = produtos.some((p) => p.sku === dados.sku);
    setProdutos((lista) =>
      existe
        ? lista.map((p) => (p.sku === dados.sku ? { ...p, ...dados } : p))
        : [...lista, { ...dados, saldo: 0, origem: '0 - Nac.', ativo: true }],
    );
    fecharDrawer();
    avisar('SKU salvo', `${dados.sku} salvo com sucesso no banco de inventário.`);
  };

  const confirmarExclusao = (p) => {
    setProdutos((lista) => lista.filter((x) => x.sku !== p.sku));
    setSelecionados((s) => s.filter((x) => x !== p.sku));
    setProdutoExcluindo(null);
    fecharDrawer();
    avisar('SKU removido', `${p.sku} desativado e removido do catálogo.`);
  };

  return (
    <div className="dashboard produtos-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow"><Package size={14} /> LOGÍSTICA &amp; CATÁLOGO</span>
          <h1>Catálogo de Produtos &amp; Inventário</h1>
          <p>Gerenciamento unificado de SKUs, parametrização tributária NCM, custeio dinâmico, pontos críticos de ressuprimento e balanceamento multi-CD.</p>
        </div>

        <div className="page-actions">
          <button type="button" className="primary-button" onClick={abrirNovo}>
            <Plus size={15} /> Novo Produto
          </button>
        </div>
      </div>

      <section className="stats-grid" aria-label="Resumo de estoque">
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
            placeholder="Filtrar por SKU, EAN-13, descrição ou fornecedor..."
          />
        </div>

        <select value={filtros.categoria} onChange={mudar('categoria')} aria-label="Categoria">
          <option value="">Todas as categorias</option>
          {categorias.map((c) => <option key={c.valor} value={c.valor}>{c.rotulo}</option>)}
        </select>

        <select value={filtros.armazem} onChange={mudar('armazem')} aria-label="Armazém">
          <option value="">Todos os armazéns</option>
          {armazens.map((a) => <option key={a.valor} value={a.valor}>{a.rotulo}</option>)}
        </select>

        <select value={filtros.nivel} onChange={mudar('nivel')} aria-label="Nível de estoque">
          <option value="">Nível de estoque (geral)</option>
          {niveis.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
        </select>

        <label className="check-ativos">
          <input
            type="checkbox"
            checked={filtros.somenteAtivos}
            onChange={(e) => setFiltros((f) => ({ ...f, somenteAtivos: e.target.checked }))}
          />
          Somente ativos
        </label>

        <button type="button" className="secondary-button" onClick={() => { setFiltros(filtrosIniciais); avisar('Filtros redefinidos'); }}>
          <FilterX size={14} /> Limpar
        </button>
      </section>

      {selecionados.length > 0 && (
        <div className="bulk-bar">
          <span><ListChecks size={18} /> <strong>{selecionados.length}</strong> produtos selecionados</span>
          <div>
            <button type="button" className="btn-neutro">Transferir CD</button>
            <button type="button" className="btn-neutro">Reajustar Margem</button>
            <button type="button" className="btn-perigo">Inativar Selecionados</button>
          </div>
        </div>
      )}

      <section className="dashboard-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="col-check">
                  <input type="checkbox" checked={todosMarcados} onChange={alternarTodos} aria-label="Selecionar todos" />
                </th>
                <th>SKU &amp; Identificador</th>
                <th>Descrição do item</th>
                <th>Categoria</th>
                <th>NCM / Origem</th>
                <th className="col-num">Custo unit.</th>
                <th className="col-num">Preço venda</th>
                <th>Margem</th>
                <th className="col-saldo">Saldo vs mínimo</th>
                <th>Localização</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => {
                const nivel = nivelEstoque(p);
                const Icone = mapaCategoria[p.categoria]?.icone ?? Package;
                const pct = p.minimo > 0 ? Math.min(100, (p.saldo / p.minimo) * 100) : 100;
                return (
                  <tr key={p.sku} className={nivel === 'ruptura' ? 'linha-bloqueada' : ''}>
                    <td className="col-check">
                      <input type="checkbox" checked={selecionados.includes(p.sku)} onChange={() => alternar(p.sku)} aria-label={`Selecionar ${p.sku}`} />
                    </td>
                    <td>
                      <div className="product-cell">
                        <span className="product-icon"><Icone size={18} /></span>
                        <span>
                          <strong className={`codigo ${nivel === 'ruptura' ? 'erro' : ''}`}>{p.sku}</strong>
                          <small className="mono">{p.ean}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="celula-dupla">
                        <span>{p.nome}</span>
                        <small>{p.marca} • {p.unidade}</small>
                      </div>
                    </td>
                    <td><span className="tag">{mapaCategoria[p.categoria]?.rotulo}</span></td>
                    <td>
                      <div className="celula-dupla">
                        <span className="mono">{p.ncm}</span>
                        <small>{p.origem}</small>
                      </div>
                    </td>
                    <td className="col-num mono">{brl(p.custo)}</td>
                    <td className="col-num mono forte">{brl(p.venda)}</td>
                    <td><span className="margem">{margem(p).toFixed(1)}%</span></td>
                    <td className="col-saldo">
                      <div className="saldo-linha">
                        <b className={`mono ${nivel}`}>{p.saldo.toLocaleString('pt-BR')} {p.unidade.toLowerCase()}</b>
                        <span className="mono">Mín: {p.minimo.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="barra"><div className={nivel} style={{ width: `${pct}%` }} /></div>
                    </td>
                    <td><span className="local mono"><MapPin size={14} /> {p.local}</span></td>
                    <td><span className={`pill ${nivel}`}><span />{rotuloNivel[nivel]}</span></td>
                    <td>
                      <div className="acoes">
                        <button type="button" title="Editar SKU" onClick={() => abrirEdicao(p)}><Pencil size={15} /></button>
                        <button type="button" title="Ajuste de saldo físico"><BadgeCheck size={15} /></button>
                        <button type="button" title="Histórico de movimentações"><History size={15} /></button>
                        <button type="button" className="perigo" title="Excluir produto" onClick={() => setProdutoExcluindo(p)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtrados.length === 0 && (
                <tr><td colSpan={12} className="vazio">Nenhum produto encontrado com esses filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Exibindo <strong>{filtrados.length}</strong> de <strong>14.250</strong> SKUs</span>
        </div>
      </section>

      <section className="insights-grid">


       

      
      </section>

      <p className="demo-note">Dados ilustrativos para visualização da interface.</p>

      <ProdutoDrawer
        aberto={drawerAberto}
        produto={produtoEditando}
        onClose={fecharDrawer}
        onSalvar={salvar}
        onExcluir={setProdutoExcluindo}
        onErro={(msg) => avisar('Atenção', msg)}
      />

      <ExcluirProdutoModal
        produto={produtoExcluindo}
        onCancelar={() => setProdutoExcluindo(null)}
        onConfirmar={confirmarExclusao}
      />

      <Toast toast={toast} />
    </div>
  );
}