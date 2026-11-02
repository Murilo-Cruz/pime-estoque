import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftRight, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CircleAlert, CircleX,
  CheckCheck, CirclePlus, CloudCog, FilePenLine, Forklift, Gauge, Boxes, ChartLine, ListChecks, Printer,
  ReceiptText, RefreshCw, RotateCcw, Search, Share2, ShieldCheck, ShoppingCart, TrendingUp, TriangleAlert,
} from 'lucide-react';
import PedidoDrawer from '../components/PedidoDrawer';
import Toast from '../components/Toast';
import {
  brl, canais, filtroCanais, filtroStatusComercial, filtroStatusEstoque, kpisPedido, pedidosIniciais,
  statusComercial, statusEstoque,
} from '../data/pedidos';
import './Clientes.css'; // reaproveita KPIs, tabela, filtros e drawer (classes globais)
import './Pedidos.css';

const filtrosIniciais = { busca: '', canal: '', comercial: '', estoque: '' };
const iconesKpi = [ShoppingCart, Forklift, Boxes, ChartLine];
const iconesBadge = [TrendingUp, Gauge, TriangleAlert, ArrowUp];
const corCredito = { AAA: 'verde', AA: 'ciano', 'B+': 'roxo' };
const corId = { FATURADO: 'verde', SEPARACAO: 'ciano', RUPTURA: 'erro', APROVADO: '', PENDENTE: 'roxo', CANCELADO: 'mudo' };

export default function Pedidos() {
  const [pedidos, setPedidos] = useState(pedidosIniciais);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [selecionados, setSelecionados] = useState([]);
  const [drawer, setDrawer] = useState({ aberto: false, pedido: null });
  const [sincronizando, setSincronizando] = useState(false);
  const [contador, setContador] = useState(9105);
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const avisar = (titulo, mensagem = '') => {
    setToast({ titulo, mensagem });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3800);
  };

  const filtrados = useMemo(() => {
    const t = filtros.busca.trim().toLowerCase();
    return pedidos.filter((p) => {
      const texto = `${p.id} ${p.cliente} ${p.cnpj}`.toLowerCase();
      return (
        (!t || texto.includes(t)) &&
        (!filtros.canal || p.canal === filtros.canal) &&
        (!filtros.comercial || p.statusCom === filtros.comercial) &&
        (!filtros.estoque || p.statusEst === filtros.estoque)
      );
    });
  }, [pedidos, filtros]);

  const mudar = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));
  const todos = filtrados.length > 0 && filtrados.every((p) => selecionados.includes(p.id));
  const alternar = (id) => setSelecionados((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const alternarTodos = () => setSelecionados(todos ? [] : filtrados.map((p) => p.id));

  const abrir = (pedido = null) => setDrawer({ aberto: true, pedido });
  const fechar = () => setDrawer((d) => ({ ...d, aberto: false }));

  const agora = () => {
    const d = new Date();
    return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  function gravar(dados, statusCom, statusEst, estoqueTexto) {
    if (drawer.pedido) {
      setPedidos((l) => l.map((p) => (p.id === drawer.pedido.id
        ? { ...p, skus: dados.skus, volumes: `${dados.qtd} un`, valor: dados.valor, statusCom, statusEst, estoqueTexto }
        : p)));
      return drawer.pedido.id;
    }
    const id = `PV-${contador}`;
    setPedidos((l) => [{
      id, canal: dados.canal, cliente: dados.cliente, cnpj: dados.cnpj, credito: dados.credito,
      emissao: agora(), previsao: 'Prev: a definir', skus: dados.skus, volumes: `${dados.qtd} un`,
      embalagem: 'Aguardando separação', valor: dados.valor, pagamento: 'Boleto Faturado 30/60 Dias',
      statusCom, statusEst, estoqueTexto,
    }, ...l]);
    setContador((c) => c + 1);
    return id;
  }

  function confirmarPedido(dados) {
    const id = gravar(dados, 'APROVADO', 'RESERVADO', 'Reserva Ativa - CD Barueri');
    fechar();
    avisar('Estoque baixado com sucesso', `Pedido #${id} confirmado, saldo reservado e enviado para picking.`);
  }

  function salvarRascunho(dados) {
    const id = gravar(dados, 'PENDENTE', 'PROVISORIA', 'Reserva Provisória (24h)');
    fechar();
    avisar('Orçamento salvo', `Pedido #${id} gravado como rascunho sem bloquear estoque físico.`);
  }

  function cancelar(p) {
    setPedidos((l) => l.map((x) => (x.id === p.id ? { ...x, statusCom: 'CANCELADO', statusEst: 'LIBERADO', estoqueTexto: 'Reserva liberada ao saldo', erro: false } : x)));
    avisar('Alocação cancelada', `Reserva física de #${p.id} devolvida ao saldo disponível.`);
  }

  function excluirDoDrawer(p) {
    if (!window.confirm('Deseja realmente cancelar este pedido e liberar a reserva nos CDs?')) return;
    cancelar(p);
    fechar();
  }



  return (
    <div className="dashboard pedidos-page">
      <div className="pd-topo">
        <span className="eyebrow">
          COMERCIAL &amp; EXPEDIÇÃO 
        </span>
       
      </div>

      <div className="dashboard-heading">
        <div>
          <h1>Pedidos de Venda &amp; Baixa de Estoque</h1>
          <p>
            Gerenciamento centralizado de pedidos B2B e canais integrados, reserva física automática de SKUs, checagem de
            saldo multi-CD e emissão automatizada de notas fiscais.
          </p>
        </div>
        <div className="page-actions">
          
        
         
          <button type="button" className="primary-button" onClick={() => abrir()}>
            <CirclePlus size={15} /> Novo Pedido de Venda
          </button>
        </div>
      </div>

      <section className="stats-grid" aria-label="Indicadores de vendas">
        {kpisPedido.map((k, idx) => {
          const Icone = iconesKpi[idx];
          const IconeBadge = iconesBadge[idx];
          return (
            <article className={`stat-card ${k.cor}`} key={k.titulo}>
              <div className="stat-card-top">
                <span>{k.titulo}</span>
                <span className={`stat-icon ${k.cor}`}><Icone size={19} /></span>
              </div>
              <div className="pd-kpi-valor">
                <strong className={k.valor.length > 6 ? 'menor' : ''}>{k.valor}</strong>
                {k.unidade && <small>{k.unidade}</small>}
              </div>
              <p className="pd-kpi-linha">{k.linha}</p>
              <div className="pd-kpi-rodape">
                <span className={`pd-badge ${k.cor}`}><IconeBadge size={12} /> {k.badge}</span>
                <small className="mono">{k.nota}</small>
              </div>
            </article>
          );
        })}
      </section>

      <section className="filters-bar">
        <div className="search-field">
          <Search size={16} />
          <input type="text" value={filtros.busca} onChange={mudar('busca')} placeholder="Filtrar por nº pedido (#PV), razão social, CNPJ ou SKU..." />
        </div>
        <select value={filtros.canal} onChange={mudar('canal')} aria-label="Canal">
          <option value="">Canal: todos os canais</option>
          {filtroCanais.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
        </select>
        <select value={filtros.comercial} onChange={mudar('comercial')} aria-label="Status comercial">
          <option value="">Status comercial: todos</option>
          {filtroStatusComercial.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
        </select>
        <select value={filtros.estoque} onChange={mudar('estoque')} aria-label="Status de estoque">
          <option value="">Status estoque: todos</option>
          {filtroStatusEstoque.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
        </select>
        <button type="button" className="secondary-button" onClick={() => { setFiltros(filtrosIniciais); avisar('Filtros redefinidos', 'Exibindo todos os registros da grade operacional.'); }}>
          <RotateCcw size={14} /> Limpar Filtros
        </button>
      </section>

      <div className="pd-resumo">
        <span>Exibindo: <b>{filtrados.length} de 142 pedidos</b> • <em>Data base: hoje (tempo real)</em></span>
        {selecionados.length > 0 && (
          <div className="pd-bulk">
            <span className="ciano"><ListChecks size={15} /> {selecionados.length} pedido(s) selecionado(s)</span>
            <button type="button" className="btn-neutro" onClick={() => avisar('Picking', 'Enviando mapa de separação para a impressora do CD.')}><Printer size={14} /> Imprimir Picking</button>
            <button type="button" className="pd-btn-verde" onClick={() => avisar('Baixa em lote', 'Estoque baixado para os pedidos selecionados.')}><CheckCheck size={14} /> Baixar Estoque em Lote</button>
          </div>
        )}
      </div>

      <section className="dashboard-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="col-check"><input type="checkbox" checked={todos} onChange={alternarTodos} aria-label="Selecionar todos" /></th>
                <th>Nº Pedido / Canal</th>
                <th>Cliente &amp; CNPJ</th>
                <th>Emissão &amp; Previsão</th>
                <th>SKUs / Volumes</th>
                <th className="col-num">Valor total (R$)</th>
                <th>Status comercial</th>
                <th>Status estoque</th>
                <th>Ações operacionais</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => {
                const sc = statusComercial[p.statusCom];
                const se = statusEstoque[p.statusEst];
                const Canal = canais[p.canal].icone;
                const IconeEst = se.icone;
                return (
                  <tr key={p.id} className={p.erro ? 'linha-bloqueada' : ''}>
                    <td className="col-check"><input type="checkbox" checked={selecionados.includes(p.id)} onChange={() => alternar(p.id)} aria-label={`Selecionar ${p.id}`} /></td>
                    <td>
                      <div className="celula-dupla">
                        <span className={`mono pd-id ${corId[p.statusCom]}`}>
                          <b>#{p.id}</b>
                          {p.nfe && <ShieldCheck size={14} className="verde" title="DANFE autorizada" />}
                          {p.api && <ArrowLeftRight size={14} className="ciano" title="Sincronizado via API" />}
                          {p.erro && <CircleAlert size={14} className="erro" />}
                        </span>
                        <small className="pd-canal"><Canal size={13} /> {canais[p.canal].rotulo}</small>
                      </div>
                    </td>
                    <td>
                      <div className="celula-dupla">
                        <span><b>{p.cliente}</b></span>
                        <small className="mono">{p.cnpj} <i className={`pd-credito ${corCredito[p.credito]}`}>Crédito {p.credito}</i></small>
                      </div>
                    </td>
                    <td>
                      <div className="celula-dupla">
                        <span className="mono">{p.emissao}</span>
                        <small className={p.previsaoErro ? 'erro' : ''}>{p.previsao}</small>
                      </div>
                    </td>
                    <td>
                      <div className="celula-dupla">
                        <span className="mono">{p.skus} SKU{p.skus > 1 ? 's' : ''} • {p.volumes}</span>
                        <small className={p.embalagemErro ? 'erro' : ''}>{p.embalagem}</small>
                      </div>
                    </td>
                    <td className="col-num">
                      <div className="celula-dupla pd-dir">
                        <span className="mono"><b>{brl(p.valor)}</b></span>
                        <small>{p.pagamento}</small>
                      </div>
                    </td>
                    <td><span className={`pill pd-pill ${sc.cor}`}><span className={sc.pulso ? 'pd-pisca' : ''} />{sc.rotulo}</span></td>
                    <td><span className={`pd-estoque ${se.cor}`}><IconeEst size={14} /> {p.estoqueTexto}</span></td>
                    <td>
                      <div className="acoes">
                        <button type="button" title="Visualizar / editar pedido" onClick={() => abrir(p)}><FilePenLine size={15} /></button>
                        <button type="button" title="Imprimir picking list" onClick={() => avisar('Espelho de picking gerado', 'Enviando mapa de separação para a impressora do CD.')}><Printer size={15} /></button>
                        <button type="button" className="perigo" title="Cancelar pedido & estornar saldo" onClick={() => cancelar(p)}><CircleX size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && <tr><td colSpan={9} className="vazio">Nenhum pedido encontrado com esses filtros.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Linhas por página: <select defaultValue="25"><option>10</option><option>25</option><option>50</option></select> &nbsp; 1 - {filtrados.length} de 142 resultados</span>
          <div className="pd-pager">
            <button type="button" disabled><ChevronsLeft size={16} /></button>
            <button type="button" disabled><ChevronLeft size={16} /></button>
            <b>1</b><button type="button">2</button><button type="button">3</button><span>...</span><button type="button">6</button>
            <button type="button"><ChevronRight size={16} /></button>
            <button type="button"><ChevronsRight size={16} /></button>
          </div>
        </div>
      </section>

      <p className="demo-note">Dados ilustrativos para visualização da interface.</p>

      <PedidoDrawer
        aberto={drawer.aberto}
        pedido={drawer.pedido}
        proximoId={`PV-${contador}`}
        onClose={fechar}
        onConfirmar={confirmarPedido}
        onRascunho={salvarRascunho}
        onExcluir={excluirDoDrawer}
        onAviso={avisar}
      />
      <Toast toast={toast} />
    </div>
  );
}