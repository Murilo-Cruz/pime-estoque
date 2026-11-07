import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Boxes, FilterX, Pencil, Plus, Power, Search, Trash2, TriangleAlert, Wallet, Warehouse, Package,
} from 'lucide-react';
import ProdutoDrawer from '../components/ProdutoDrawer';
import ExcluirProdutoModal from '../components/ExcluirProdutoModal';
import Toast from '../components/Toast';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { brl, inteiro, margemPct } from '../utils/formatos';
import './Clientes.css'; // reaproveita KPIs, filtros, tabela, drawer (já são classes globais)
import './Produtos.css';

const filtrosIniciais = { busca: '', nivel: '', somenteAtivos: true };

const niveis = [
  ['normal', 'Normal / Saudável'],
  ['baixo', 'Abaixo do Mínimo'],
  ['ruptura', 'Ruptura (Saldo Zero)'],
];
const rotuloNivel = { normal: 'Saudável', baixo: 'Estoque Baixo', ruptura: 'Ruptura Total' };

// Mesma regra do backend: saldo <= mínimo é "estoque baixo"
function nivelEstoque(p) {
  if (p.qtd_estoque <= 0) return 'ruptura';
  if (p.qtd_estoque <= p.qtd_min_estoque) return 'baixo';
  return 'normal';
}

export default function Produtos() {
  const chamar = useApi();
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [produtoExcluindo, setProdutoExcluindo] = useState(null);
  const [toast, avisar] = useToast(3500);

  const carregar = useCallback(async () => {
    setErro('');
    try {
      setProdutos(await chamar('/produtos'));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [chamar]);

  useEffect(() => { carregar(); }, [carregar]);

  const kpis = useMemo(() => {
    const ativos = produtos.filter((p) => p.idc_status === 'ATIVO');
    const baixo = ativos.filter((p) => p.qtd_estoque <= p.qtd_min_estoque);
    return [
      { titulo: 'Total de produtos', valor: inteiro(produtos.length), badge: `${ativos.length} ativos`, detalhe: `${produtos.length - ativos.length} inativos`, icone: Boxes, cor: 'cyan' },
      { titulo: 'Saldo físico global', valor: inteiro(ativos.reduce((s, p) => s + p.qtd_estoque, 0)), badge: 'unidades', detalhe: 'Somente produtos ativos', icone: Warehouse, cor: 'green' },
      { titulo: 'Alerta / estoque baixo', valor: inteiro(baixo.length), badge: `${baixo.filter((p) => p.qtd_estoque <= 0).length} em ruptura`, detalhe: 'Saldo ≤ mínimo', icone: TriangleAlert, cor: 'red' },
      { titulo: 'Valor em estoque (custo)', valor: brl(ativos.reduce((s, p) => s + p.qtd_estoque * p.vlr_custo_medio, 0)), badge: 'Custo médio', detalhe: 'Saldo × custo médio', icone: Wallet, cor: 'cyan' },
    ];
  }, [produtos]);

  const filtrados = useMemo(() => {
    const termo = filtros.busca.trim().toLowerCase();
    return produtos.filter((p) => (
      (!termo || p.nom_produto.toLowerCase().includes(termo) || p.key_produto.toLowerCase().includes(termo)) &&
      (!filtros.nivel || nivelEstoque(p) === filtros.nivel) &&
      (!filtros.somenteAtivos || p.idc_status === 'ATIVO')
    ));
  }, [produtos, filtros]);

  const mudar = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  const abrirNovo = () => { setProdutoEditando(null); setDrawerAberto(true); };
  const abrirEdicao = (p) => { setProdutoEditando(p); setDrawerAberto(true); };
  const fecharDrawer = () => setDrawerAberto(false);

  async function salvar(dados) {
    try {
      const editando = Boolean(produtoEditando);
      const salvo = await chamar(editando ? `/produtos/${produtoEditando.id_produto}` : '/produtos', {
        metodo: editando ? 'PUT' : 'POST',
        corpo: dados,
      });
      fecharDrawer();
      await carregar();
      avisar('Produto salvo', `${salvo.key_produto} salvo com sucesso.`);
    } catch (e) {
      avisar('Não foi possível salvar', e.message, true);
    }
  }

  async function alternarStatus(p) {
    const novo = p.idc_status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    try {
      await chamar(`/produtos/${p.id_produto}/status`, { metodo: 'PATCH', corpo: { idc_status: novo } });
      await carregar();
      avisar(novo === 'ATIVO' ? 'Produto ativado' : 'Produto inativado', p.key_produto);
    } catch (e) {
      avisar('Não foi possível alterar o status', e.message, true);
    }
  }

  async function confirmarExclusao(p) {
    try {
      await chamar(`/produtos/${p.id_produto}`, { metodo: 'DELETE' });
      setProdutoExcluindo(null);
      fecharDrawer();
      await carregar();
      avisar('Produto removido', `${p.key_produto} excluído do catálogo.`);
    } catch (e) {
      setProdutoExcluindo(null);
      avisar('Não foi possível excluir', e.message, true);
    }
  }

  return (
    <div className="dashboard produtos-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow"><Package size={14} /> LOGÍSTICA &amp; CATÁLOGO</span>
          <h1>Catálogo de Produtos &amp; Inventário</h1>
          <p>Cadastro de produtos, preço de venda, custo médio ponderado, saldo em estoque e ponto de ressuprimento.</p>
        </div>

        <div className="page-actions">
          <button type="button" className="primary-button" onClick={abrirNovo}>
            <Plus size={15} /> Novo Produto
          </button>
        </div>
      </div>

      {erro && (
        <div className="aviso-erro">
          <span>Não foi possível carregar os produtos: {erro}</span>
          <button type="button" onClick={carregar}>Tentar novamente</button>
        </div>
      )}

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
          <input type="text" value={filtros.busca} onChange={mudar('busca')} placeholder="Filtrar por SKU ou nome do produto..." />
        </div>

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

        <button type="button" className="secondary-button" onClick={() => setFiltros(filtrosIniciais)}>
          <FilterX size={14} /> Limpar
        </button>
      </section>

      <section className="dashboard-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Descrição do item</th>
                <th className="col-num">Custo médio</th>
                <th className="col-num">Preço venda</th>
                <th>Margem</th>
                <th className="col-saldo">Saldo vs mínimo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => {
                const nivel = nivelEstoque(p);
                const inativo = p.idc_status === 'INATIVO';
                const pctBarra = p.qtd_min_estoque > 0 ? Math.min(100, (p.qtd_estoque / p.qtd_min_estoque) * 100) : 100;
                return (
                  <tr key={p.id_produto} className={nivel === 'ruptura' && !inativo ? 'linha-bloqueada' : ''}>
                    <td>
                      <div className="product-cell">
                        <span className="product-icon"><Package size={18} /></span>
                        <span>
                          <strong className={`codigo ${nivel === 'ruptura' ? 'erro' : ''}`}>{p.key_produto}</strong>
                        </span>
                      </div>
                    </td>
                    <td>{p.nom_produto}</td>
                    <td className="col-num mono">{brl(p.vlr_custo_medio)}</td>
                    <td className="col-num mono forte">{brl(p.vlr_venda)}</td>
                    <td>
                      <span className="margem">
                        {p.vlr_custo_medio > 0 ? `${margemPct(p.vlr_venda, p.vlr_venda - p.vlr_custo_medio).toFixed(1)}%` : '—'}
                      </span>
                    </td>
                    <td className="col-saldo">
                      <div className="saldo-linha">
                        <b className={`mono ${nivel}`}>{inteiro(p.qtd_estoque)} un</b>
                        <span className="mono">Mín: {inteiro(p.qtd_min_estoque)}</span>
                      </div>
                      <div className="barra"><div className={nivel} style={{ width: `${pctBarra}%` }} /></div>
                    </td>
                    <td>
                      {inativo
                        ? <span className="pill bloqueado"><span />Inativo</span>
                        : <span className={`pill ${nivel}`}><span />{rotuloNivel[nivel]}</span>}
                    </td>
                    <td>
                      <div className="acoes">
                        <button type="button" title="Editar produto" onClick={() => abrirEdicao(p)}><Pencil size={15} /></button>
                        <button type="button" title={inativo ? 'Ativar produto' : 'Inativar produto'} onClick={() => alternarStatus(p)}><Power size={15} /></button>
                        <button type="button" className="perigo" title="Excluir produto" onClick={() => setProdutoExcluindo(p)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {carregando && <tr><td colSpan={8} className="vazio">Carregando produtos…</td></tr>}
              {!carregando && filtrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="vazio">
                    {produtos.length === 0 ? 'Nenhum produto cadastrado ainda. Clique em "Novo Produto".' : 'Nenhum produto encontrado com esses filtros.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Exibindo <strong>{filtrados.length}</strong> de <strong>{produtos.length}</strong> produtos</span>
        </div>
      </section>

      <ProdutoDrawer
        aberto={drawerAberto}
        produto={produtoEditando}
        onClose={fecharDrawer}
        onSalvar={salvar}
        onExcluir={setProdutoExcluindo}
        onErro={(msg) => avisar('Atenção', msg, true)}
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
