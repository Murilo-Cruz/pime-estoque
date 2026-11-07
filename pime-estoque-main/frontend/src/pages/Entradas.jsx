import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Boxes, CircleDollarSign, Eye, FilterX, PackagePlus, ReceiptText, RefreshCw, Search, Truck,
} from 'lucide-react';
import EntradaDrawer from '../components/EntradaDrawer';
import { DetalheEntradaModal } from '../components/EntradaModais';
import Toast from '../components/Toast';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { brl, dataBR, horaBR, inteiro } from '../utils/formatos';
import './Clientes.css'; // reaproveita KPIs, tabela, filtros e drawer (classes globais)
import './Entradas.css';

const filtrosIniciais = { busca: '', fornecedor: '', de: '', ate: '' };

export default function Entradas() {
  const chamar = useApi();
  const local = useLocation();
  const navegar = useNavigate();
  const [entradas, setEntradas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [drawer, setDrawer] = useState({ aberto: false, preset: null });
  const [detalhe, setDetalhe] = useState(null);
  const [atualizando, setAtualizando] = useState(false);
  const [toast, avisar] = useToast();

  const carregar = useCallback(async () => {
    setErro('');
    try {
      const [ent, forn, prod] = await Promise.all([
        chamar('/entradas'),
        chamar('/emitentes?tipo=FORNECEDOR'),
        chamar('/produtos?status=ATIVO'),
      ]);
      setEntradas(ent);
      setFornecedores(forn);
      setProdutos(prod);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [chamar]);

  useEffect(() => { carregar(); }, [carregar]);

  // Vindo da tela de fornecedores ("Nova Entrada"): abre o drawer já com o fornecedor escolhido
  useEffect(() => {
    if (local.state?.idFornecedor) {
      setDrawer({ aberto: true, preset: { id_fornecedor: local.state.idFornecedor } });
      navegar(local.pathname, { replace: true, state: null });
    }
  }, [local, navegar]);

  const filtradas = useMemo(() => {
    const termo = filtros.busca.trim().toLowerCase();
    return entradas.filter((e) => {
      const dia = e.dat_entrada.slice(0, 10);
      return (
        (!termo || `${e.id_estoque_entrada} ${e.nom_fornecedor} ${e.nom_usuario}`.toLowerCase().includes(termo)) &&
        (!filtros.fornecedor || String(e.id_fornecedor) === filtros.fornecedor) &&
        (!filtros.de || dia >= filtros.de) &&
        (!filtros.ate || dia <= filtros.ate)
      );
    });
  }, [entradas, filtros]);

  const kpis = useMemo(() => {
    const total = filtradas.reduce((s, e) => s + e.vlr_total, 0);
    return [
      { titulo: 'Entradas listadas', valor: inteiro(filtradas.length), detalhe: 'Conforme os filtros aplicados', icone: Boxes, cor: 'green' },
      { titulo: 'Valor total de compras', valor: brl(total), detalhe: `Ticket médio: ${brl(filtradas.length ? total / filtradas.length : 0)}`, icone: CircleDollarSign, cor: 'green', pequeno: true },
      { titulo: 'Fornecedores atendidos', valor: inteiro(new Set(filtradas.map((e) => e.id_fornecedor)).size), detalhe: `${inteiro(fornecedores.length)} cadastrados`, icone: Truck, cor: 'cyan' },
      { titulo: 'Linhas de item lançadas', valor: inteiro(filtradas.reduce((s, e) => s + e.qtd_itens, 0)), detalhe: 'Produtos distintos por entrada', icone: ReceiptText, cor: 'cyan' },
    ];
  }, [filtradas, fornecedores]);

  const mudar = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  const abrirDrawer = (preset = null) => setDrawer({ aberto: true, preset });
  const fecharDrawer = () => setDrawer((d) => ({ ...d, aberto: false }));

  async function confirmarEntrada(corpo) {
    try {
      const nova = await chamar('/entradas', { metodo: 'POST', corpo });
      fecharDrawer();
      await carregar();
      avisar('Entrada confirmada', `Entrada #${nova.id_estoque_entrada} registrada. Saldo e custo médio atualizados.`);
    } catch (e) {
      avisar('Não foi possível registrar a entrada', e.message, true);
    }
  }

  async function verDetalhe(e) {
    try {
      setDetalhe(await chamar(`/entradas/${e.id_estoque_entrada}`));
    } catch (err) {
      avisar('Não foi possível abrir a entrada', err.message, true);
    }
  }

  async function atualizar() {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
    avisar('Grade atualizada', 'Entradas recarregadas do banco de dados.');
  }

  return (
    <div className="dashboard entradas-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">LOGÍSTICA &amp; ESTOQUE</span>
          <h1>Entradas de Estoque &amp; Recebimento</h1>
          <p>
            Registro das compras recebidas de fornecedores. Cada entrada soma ao saldo dos produtos e
            recalcula automaticamente o custo médio ponderado.
          </p>
        </div>

        <div className="page-actions">
          <button type="button" className="primary-button" onClick={() => abrirDrawer()}>
            <PackagePlus size={15} /> Nova Entrada
          </button>
        </div>
      </div>

      {erro && (
        <div className="aviso-erro">
          <span>Não foi possível carregar as entradas: {erro}</span>
          <button type="button" onClick={carregar}>Tentar novamente</button>
        </div>
      )}

      <section className="stats-grid" aria-label="Indicadores de recebimento">
        {kpis.map(({ titulo, valor, detalhe, icone: Icone, cor, pequeno }) => (
          <article className={`stat-card ${cor}`} key={titulo}>
            <div className="stat-card-top">
              <span>{titulo}</span>
              <span className={`stat-icon ${cor}`}><Icone size={19} /></span>
            </div>
            <div className="en-kpi-valor">
              <strong className={pequeno ? 'menor' : ''}>{valor}</strong>
            </div>
            <p className="en-kpi-detalhe">{detalhe}</p>
          </article>
        ))}
      </section>

      <section className="filters-bar">
        <div className="search-field">
          <Search size={16} />
          <input type="text" value={filtros.busca} onChange={mudar('busca')} placeholder="Buscar por nº da entrada, fornecedor ou usuário..." />
        </div>
        <select value={filtros.fornecedor} onChange={mudar('fornecedor')} aria-label="Fornecedor">
          <option value="">Todos os fornecedores</option>
          {fornecedores.map((f) => <option key={f.id_emitente} value={f.id_emitente}>{f.nom_emitente}</option>)}
        </select>
        <input type="date" value={filtros.de} onChange={mudar('de')} aria-label="Data inicial" />
        <input type="date" value={filtros.ate} onChange={mudar('ate')} aria-label="Data final" />
        <button type="button" className="secondary-button" onClick={() => setFiltros(filtrosIniciais)} title="Limpar filtros">
          <FilterX size={14} />
        </button>
        <button type="button" className={`secondary-button ${atualizando ? 'en-girando' : ''}`} onClick={atualizar} title="Atualizar grade">
          <RefreshCw size={14} />
        </button>
      </section>

      <section className="dashboard-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Entrada</th>
                <th>Data / Horário</th>
                <th>Fornecedor</th>
                <th>Registrada por</th>
                <th className="col-num">Itens</th>
                <th className="col-num">Valor total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((e) => (
                <tr key={e.id_estoque_entrada}>
                  <td><span className="mono verde"><b>#{e.id_estoque_entrada}</b></span></td>
                  <td>
                    <div className="celula-dupla">
                      <span className="mono">{dataBR(e.dat_entrada)}</span>
                      <small className="mono">{horaBR(e.dat_entrada)}</small>
                    </div>
                  </td>
                  <td>{e.nom_fornecedor}</td>
                  <td>{e.nom_usuario}</td>
                  <td className="col-num"><span className="mono">{inteiro(e.qtd_itens)} {e.qtd_itens === 1 ? 'item' : 'itens'}</span></td>
                  <td className="col-num"><span className="mono"><b>{brl(e.vlr_total)}</b></span></td>
                  <td>
                    <div className="acoes">
                      <button type="button" title="Ver itens da entrada" onClick={() => verDetalhe(e)}><Eye size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {carregando && <tr><td colSpan={7} className="vazio">Carregando entradas…</td></tr>}
              {!carregando && filtradas.length === 0 && (
                <tr>
                  <td colSpan={7} className="vazio">
                    {entradas.length === 0 ? 'Nenhuma entrada registrada ainda. Clique em "Nova Entrada".' : 'Nenhuma entrada encontrada com esses filtros.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Exibindo <strong>{filtradas.length}</strong> de <strong>{entradas.length}</strong> entradas</span>
        </div>
      </section>

      <EntradaDrawer
        aberto={drawer.aberto}
        preset={drawer.preset}
        fornecedores={fornecedores}
        produtos={produtos}
        onClose={fecharDrawer}
        onConfirmar={confirmarEntrada}
        onAviso={(titulo, msg) => avisar(titulo, msg, true)}
      />
      <DetalheEntradaModal entrada={detalhe} onClose={() => setDetalhe(null)} />
      <Toast toast={toast} />
    </div>
  );
}
