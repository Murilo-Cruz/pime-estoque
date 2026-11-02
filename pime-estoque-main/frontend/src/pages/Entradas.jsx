import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, Download, Eye, FileUp, PackagePlus, ReceiptText, RefreshCw, ScanBarcode,
  Search, Table2, Trash2, Warehouse, Workflow, ListChecks,
} from 'lucide-react';
import EntradaDrawer from '../components/EntradaDrawer';
import { ImportarXmlModal, EstornoModal } from '../components/EntradaModais';
import Toast from '../components/Toast';
import {
  brl, centros, entradasIniciais, esteira, filtrosStatus, fornecedoresEntrada, kpisEntrada, statusEntrada,
} from '../data/entradas';
import './Clientes.css'; // reaproveita KPIs, tabela, filtros e drawer (classes globais)
import './Entradas.css';

const corId = { lancado: 'verde', conferencia: 'ciano', divergencia: 'erro', aguardando: 'roxo' };
const filtrosIniciais = { busca: '', cd: '', status: '' };

const dataHoje = () => {
  const d = new Date();
  return {
    data: d.toLocaleDateString('pt-BR'),
    hora: d.toLocaleTimeString('pt-BR'),
  };
};

export default function Entradas() {
  const [entradas, setEntradas] = useState(entradasIniciais);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [selecionadas, setSelecionadas] = useState([]);
  const [drawer, setDrawer] = useState({ aberto: false, preset: null });
  const [xmlAberto, setXmlAberto] = useState(false);
  const [estornando, setEstornando] = useState(null);
  const [atualizando, setAtualizando] = useState(false);
  const [toast, setToast] = useState(null);
  const [contador, setContador] = useState(8493);
  const timerToast = useRef(null);

  useEffect(() => () => clearTimeout(timerToast.current), []);

  const avisar = (titulo, mensagem = '') => {
    setToast({ titulo, mensagem });
    clearTimeout(timerToast.current);
    timerToast.current = setTimeout(() => setToast(null), 3800);
  };

  const filtradas = useMemo(() => {
    const termo = filtros.busca.trim().toLowerCase();
    return entradas.filter((e) => {
      const texto = `${e.id} ${e.nf} ${e.fornecedor} ${e.cnpj} ${e.cd} ${e.doca}`.toLowerCase();
      return (
        (!termo || texto.includes(termo)) &&
        (!filtros.cd || e.cd === filtros.cd) &&
        (!filtros.status || e.status === filtros.status)
      );
    });
  }, [entradas, filtros]);

  const mudar = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  const todasMarcadas = filtradas.length > 0 && filtradas.every((e) => selecionadas.includes(e.id));
  const alternar = (id) => setSelecionadas((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const alternarTodas = () => setSelecionadas(todasMarcadas ? [] : filtradas.map((e) => e.id));

  const abrirDrawer = (preset = null) => setDrawer({ aberto: true, preset });
  const fecharDrawer = () => setDrawer((d) => ({ ...d, aberto: false }));

  

  function confirmarEntrada(dados) {
    const id = `ENT-${contador}`;
    const forn = fornecedoresEntrada.find((f) => f.nome === dados.fornecedor);
    const { data, hora } = dataHoje();
    setEntradas((lista) => [
      {
        id, serie: dados.serie, data, hora,
        fornecedor: dados.fornecedor, cnpj: forn?.cnpj ?? '',
        cd: dados.cd, doca: dados.doca, qtd: dados.qtd, skus: dados.skus,
        valor: dados.valor, icms: dados.valor * 0.12, status: 'lancado',
      },
      ...lista,
    ]);
    setContador((c) => c + 1);
    fecharDrawer();
    avisar('Entrada confirmada', `#${id} vinculada à NF-e ${dados.nf}. Saldos físicos atualizados.`);
  }

  function estornar(e) {
    setEntradas((lista) => lista.filter((x) => x.id !== e.id));
    setSelecionadas((s) => s.filter((x) => x !== e.id));
    setEstornando(null);
    avisar('Entrada estornada', `#${e.id} removida do registro do armazém.`);
  }

  function estornarLote() {
    if (!window.confirm('Tem certeza de que deseja estornar todos os lançamentos selecionados? Esta ação não pode ser revertida.')) return;
    setEntradas((lista) => lista.filter((e) => !selecionadas.includes(e.id)));
    setSelecionadas([]);
    avisar('Estorno em lote', 'Operação em lote concluída com sucesso.');
  }

  function atualizar() {
    setAtualizando(true);
    setTimeout(() => {
      setAtualizando(false);
      avisar('Grade atualizada', 'Tabela de entradas sincronizada com a SEFAZ e o WMS local.');
    }, 600);
  }

  return (
    <div className="dashboard entradas-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">
            LOGÍSTICA &amp; ESTOQUE 
          </span>
          <h1>Entradas de Estoque &amp; Recebimento</h1>
          <p>
            Registro analítico de recebimento, entrada manual e parsing de NF-e (XML/DANFE), conferência cega
            parametrizada e alocação física de saldo nos Centros de Distribuição ativos.
          </p>
        </div>

        <div className="page-actions">

          <button type="button" className="primary-button" onClick={() => abrirDrawer()}>
            <PackagePlus size={15} /> Nova Entrada Manual
          </button>
        </div>
      </div>

      <section className="stats-grid" aria-label="Indicadores de recebimento">
        {kpisEntrada.map(({ titulo, valor, unidade, badge, detalhe, icone: Icone, cor, barra, pulso, pequeno }) => (
          <article className={`stat-card ${cor}`} key={titulo}>
            <div className="stat-card-top">
              <span>{titulo}</span>
              <span className={`stat-icon ${cor}`}><Icone size={19} /></span>
            </div>
            <div className="en-kpi-valor">
              <strong className={pequeno ? 'menor' : ''}>{valor}</strong>
              {unidade && <small>{unidade}</small>}
              {badge && <span className="en-badge">{badge}</span>}
            </div>
            <p className="en-kpi-detalhe">{pulso && <i className="en-ping" />}{detalhe}</p>
            <div className="en-barra"><div className={cor} style={{ width: `${barra}%` }} /></div>
          </article>
        ))}
      </section>



      <section className="filters-bar">
        <div className="search-field">
          <Search size={16} />
          <input type="text" value={filtros.busca} onChange={mudar('busca')} placeholder="Buscar por NF-e, entrada #, fornecedor ou SKU..." />
        </div>
        <select value={filtros.cd} onChange={mudar('cd')} aria-label="Centro de distribuição">
          <option value="">Todos os centros de distribuição</option>
          {centros.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
        </select>
        <select value={filtros.status} onChange={mudar('status')} aria-label="Status">
          <option value="">Todos os status</option>
          {filtrosStatus.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
        </select>
        <button type="button" className={`secondary-button ${atualizando ? 'en-girando' : ''}`} onClick={atualizar} title="Atualizar grade">
          <RefreshCw size={14} />
        </button>
        <button type="button" className="secondary-button" onClick={() => avisar('Exportação', 'Exportando grid em formato XLSX tabular...')} title="Exportar CSV/XLS">
          <Table2 size={14} />
        </button>
      </section>

      {selecionadas.length > 0 && (
        <div className="bulk-bar">
          <span><ListChecks size={18} /> <strong>{selecionadas.length}</strong> registro(s) selecionados</span>
          <div>
            <button type="button" className="btn-neutro" onClick={() => avisar('Conferência em lote', 'Iniciando conferência cega para os registros marcados...')}>Conferir em Lote</button>
            <button type="button" className="btn-neutro" onClick={() => avisar('Etiquetas ZPL', 'Imprimindo etiquetas de prateleira para as entradas selecionadas...')}>Etiquetas ZPL</button>
            <button type="button" className="btn-perigo" onClick={estornarLote}>Estornar Entradas</button>
          </div>
        </div>
      )}

      <section className="dashboard-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="col-check"><input type="checkbox" checked={todasMarcadas} onChange={alternarTodas} aria-label="Selecionar todas" /></th>
                <th>Entrada &amp; NF-e</th>
                <th>Data / Horário</th>
                <th>Fornecedor / Emitente</th>
                <th>Destino &amp; Doca</th>
                <th className="col-num">Qtd / SKUs</th>
                <th className="col-num">Valor total NF</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((e) => {
                const st = statusEntrada[e.status];
                const diverge = e.status === 'divergencia';
                return (
                  <tr key={e.id}>
                    <td className="col-check">
                      <input type="checkbox" checked={selecionadas.includes(e.id)} onChange={() => alternar(e.id)} aria-label={`Selecionar ${e.id}`} />
                    </td>
                    <td>
                      <div className="celula-dupla">
                        <span className={`mono ${corId[e.status]}`}><b>#{e.id}</b></span>
                        <small className="mono">NF-e {e.nf} - Série {e.serie}</small>
                      </div>
                    </td>
                    <td>
                      <div className="celula-dupla">
                        <span className="mono">{e.data}</span>
                        <small className="mono">{e.hora}</small>
                      </div>
                    </td>
                    <td>
                      <div className="celula-dupla">
                        <span>{e.fornecedor}</span>
                        <small className="mono">CNPJ: {e.cnpj}</small>
                      </div>
                    </td>
                    <td>
                      <div className="en-destino">
                        <Warehouse size={15} />
                        <div className="celula-dupla"><span>{e.cd}</span><small>{e.doca}</small></div>
                      </div>
                    </td>
                    <td className="col-num">
                      <div className="celula-dupla en-direita">
                        <span className={`mono ${diverge ? 'erro' : ''}`}>
                          {e.qtd} un{diverge ? ` (-${e.divergencia} un)` : ''}
                        </span>
                        <small className={diverge ? 'erro' : ''}>{diverge ? 'Divergência Física' : `${e.skus} SKUs cadastrados`}</small>
                      </div>
                    </td>
                    <td className="col-num">
                      <div className="celula-dupla en-direita">
                        <span className="mono">{brl(e.valor)}</span>
                        <small className={`mono ${diverge ? '' : 'ciano'}`}>
                          {diverge ? 'Sob Averiguação' : `ICMS: ${brl(e.icms)}`}
                        </small>
                      </div>
                    </td>
                    <td><span className={`pill en-pill ${st.cor}`}><span />{st.rotulo}</span></td>
                    <td>
                      <div className="acoes">
                        <button type="button" title="Visualizar detalhes & SKUs" onClick={() => avisar('Auditoria de itens', `Carregando itens, logs de conferência cega e espelho de NF-e para #${e.id}...`)}><Eye size={15} /></button>
                        <button type="button" title="Espelho de conferência" onClick={() => avisar('Espelho de entrada', `Gerando documento de conferência de doca para a carga #${e.id}...`)}><ReceiptText size={15} /></button>
                        <button type="button" className="perigo" title="Estornar entrada" onClick={() => setEstornando(e)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtradas.length === 0 && (
                <tr><td colSpan={9} className="vazio">Nenhuma entrada encontrada com esses filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Exibindo <strong>{filtradas.length}</strong> de <strong>142</strong> registros de entrada · Período: <strong>últimos 30 dias</strong></span>
        </div>
      </section>

  

      <p className="demo-note">Dados ilustrativos para visualização da interface.</p>

      <EntradaDrawer
        aberto={drawer.aberto}
        preset={drawer.preset}
        proximoId={`ENT-${contador}`}
        onClose={fecharDrawer}
        onConfirmar={confirmarEntrada}
        onAviso={avisar}
      />
     
      <EstornoModal entrada={estornando} onCancelar={() => setEstornando(null)} onConfirmar={estornar} />
      <Toast toast={toast} />
    </div>
  );
}