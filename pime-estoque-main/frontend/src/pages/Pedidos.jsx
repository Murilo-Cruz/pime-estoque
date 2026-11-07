import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCheck, CircleX, CirclePlus, FilePenLine, Gauge, Hourglass, ChartLine, RotateCcw, Search, ShoppingCart,
} from 'lucide-react';
import PedidoDrawer from '../components/PedidoDrawer';
import Toast from '../components/Toast';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { brl, dataBR, horaBR, inteiro } from '../utils/formatos';
import './Clientes.css'; // reaproveita KPIs, tabela, filtros e drawer (classes globais)
import './Pedidos.css';

const filtrosIniciais = { busca: '', status: '', de: '', ate: '' };

const statusPedido = {
  EM_PREPARACAO: { rotulo: 'Em preparação', cor: 'ciano', pulso: true },
  FINALIZADO: { rotulo: 'Finalizado', cor: 'verde' },
  CANCELADO: { rotulo: 'Cancelado', cor: 'mudo' },
};
const corId = { EM_PREPARACAO: 'ciano', FINALIZADO: 'verde', CANCELADO: 'mudo' };

export default function Pedidos() {
  const chamar = useApi();
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [drawer, setDrawer] = useState({ aberto: false, pedido: null });
  const [toast, avisar] = useToast();

  const carregar = useCallback(async () => {
    setErro('');
    try {
      const [ped, cli, prod] = await Promise.all([
        chamar('/pedidos'),
        chamar('/emitentes?tipo=CLIENTE'),
        chamar('/produtos?status=ATIVO'),
      ]);
      setPedidos(ped);
      setClientes(cli);
      setProdutos(prod);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [chamar]);

  useEffect(() => { carregar(); }, [carregar]);

  const filtrados = useMemo(() => {
    const t = filtros.busca.trim().toLowerCase();
    return pedidos.filter((p) => {
      const dia = p.dat_pedido.slice(0, 10);
      return (
        (!t || `${p.id_pedido_venda} ${p.nom_cliente}`.toLowerCase().includes(t)) &&
        (!filtros.status || p.idc_status === filtros.status) &&
        (!filtros.de || dia >= filtros.de) &&
        (!filtros.ate || dia <= filtros.ate)
      );
    });
  }, [pedidos, filtros]);

  const kpis = useMemo(() => {
    const em = pedidos.filter((p) => p.idc_status === 'EM_PREPARACAO');
    const fin = pedidos.filter((p) => p.idc_status === 'FINALIZADO');
    const receita = fin.reduce((s, p) => s + p.vlr_total, 0);
    const lucro = fin.reduce((s, p) => s + p.vlr_lucro, 0);
    return [
      { titulo: 'Pedidos em preparação', valor: inteiro(em.length), linha: `${brl(em.reduce((s, p) => s + p.vlr_total, 0))} a faturar`, badge: 'Aguardando baixa', nota: 'Estoque ainda não baixado', cor: 'cyan', icone: Hourglass },
      { titulo: 'Pedidos finalizados', valor: inteiro(fin.length), linha: `${brl(receita)} faturados`, badge: 'Estoque baixado', nota: `${pedidos.filter((p) => p.idc_status === 'CANCELADO').length} cancelado(s)`, cor: 'green', icone: ShoppingCart },
      { titulo: 'Lucro bruto (finalizados)', valor: brl(lucro), linha: 'Receita − custo médio na venda', badge: receita > 0 ? `${((lucro / receita) * 100).toFixed(1).replace('.', ',')}% de margem` : 'Sem vendas', nota: '', cor: 'green', icone: ChartLine },
      { titulo: 'Ticket médio', valor: brl(fin.length ? receita / fin.length : 0), linha: 'Média por pedido finalizado', badge: `${pedidos.length} pedido(s) no total`, nota: '', cor: 'purple', icone: Gauge },
    ];
  }, [pedidos]);

  const mudar = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  async function abrir(p = null) {
    if (!p) return setDrawer({ aberto: true, pedido: null });
    try {
      // a lista não traz os itens; busca o pedido completo
      setDrawer({ aberto: true, pedido: await chamar(`/pedidos/${p.id_pedido_venda}`) });
    } catch (e) {
      avisar('Não foi possível abrir o pedido', e.message, true);
    }
  }
  const fechar = () => setDrawer((d) => ({ ...d, aberto: false }));

  async function salvar(corpo) {
    try {
      const editando = drawer.pedido;
      const salvo = await chamar(editando ? `/pedidos/${editando.id_pedido_venda}` : '/pedidos', {
        metodo: editando ? 'PUT' : 'POST',
        corpo,
      });
      fechar();
      await carregar();
      avisar('Pedido salvo', `Pedido #${salvo.id_pedido_venda} gravado como "em preparação". O estoque só é baixado ao finalizar.`);
    } catch (e) {
      avisar('Não foi possível salvar o pedido', e.message, true);
    }
  }

  async function finalizar(p) {
    if (!window.confirm(`Finalizar o pedido #${p.id_pedido_venda}? O estoque será baixado e o custo congelado.`)) return;
    try {
      await chamar(`/pedidos/${p.id_pedido_venda}/finalizar`, { metodo: 'POST' });
      fechar();
      await carregar();
      avisar('Pedido finalizado', `Pedido #${p.id_pedido_venda} faturado e estoque baixado.`);
    } catch (e) {
      avisar('Não foi possível finalizar', e.message, true);
    }
  }

  async function cancelar(p) {
    if (!window.confirm(`Cancelar o pedido #${p.id_pedido_venda}?`)) return;
    try {
      await chamar(`/pedidos/${p.id_pedido_venda}/cancelar`, { metodo: 'POST' });
      fechar();
      await carregar();
      avisar('Pedido cancelado', `Pedido #${p.id_pedido_venda} cancelado.`);
    } catch (e) {
      avisar('Não foi possível cancelar', e.message, true);
    }
  }

  return (
    <div className="dashboard pedidos-page">
      <div className="pd-topo">
        <span className="eyebrow">COMERCIAL &amp; EXPEDIÇÃO</span>
      </div>

      <div className="dashboard-heading">
        <div>
          <h1>Pedidos de Venda &amp; Baixa de Estoque</h1>
          <p>
            Pedidos nascem "em preparação". Ao finalizar, o sistema confere o saldo, dá baixa no estoque e
            congela o custo médio de cada item para o cálculo de lucro.
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="primary-button" onClick={() => abrir()}>
            <CirclePlus size={15} /> Novo Pedido de Venda
          </button>
        </div>
      </div>

      {erro && (
        <div className="aviso-erro">
          <span>Não foi possível carregar os pedidos: {erro}</span>
          <button type="button" onClick={carregar}>Tentar novamente</button>
        </div>
      )}

      <section className="stats-grid" aria-label="Indicadores de vendas">
        {kpis.map((k) => {
          const Icone = k.icone;
          return (
            <article className={`stat-card ${k.cor}`} key={k.titulo}>
              <div className="stat-card-top">
                <span>{k.titulo}</span>
                <span className={`stat-icon ${k.cor}`}><Icone size={19} /></span>
              </div>
              <div className="pd-kpi-valor">
                <strong className={k.valor.length > 6 ? 'menor' : ''}>{k.valor}</strong>
              </div>
              <p className="pd-kpi-linha">{k.linha}</p>
              <div className="pd-kpi-rodape">
                <span className={`pd-badge ${k.cor}`}>{k.badge}</span>
                <small className="mono">{k.nota}</small>
              </div>
            </article>
          );
        })}
      </section>

      <section className="filters-bar">
        <div className="search-field">
          <Search size={16} />
          <input type="text" value={filtros.busca} onChange={mudar('busca')} placeholder="Filtrar por nº do pedido ou nome do cliente..." />
        </div>
        <select value={filtros.status} onChange={mudar('status')} aria-label="Status">
          <option value="">Status: todos</option>
          {Object.entries(statusPedido).map(([v, s]) => <option key={v} value={v}>{s.rotulo}</option>)}
        </select>
        <input type="date" value={filtros.de} onChange={mudar('de')} aria-label="Data inicial" />
        <input type="date" value={filtros.ate} onChange={mudar('ate')} aria-label="Data final" />
        <button type="button" className="secondary-button" onClick={() => setFiltros(filtrosIniciais)}>
          <RotateCcw size={14} /> Limpar Filtros
        </button>
      </section>

      <div className="pd-resumo">
        <span>Exibindo: <b>{filtrados.length} de {pedidos.length} pedidos</b></span>
      </div>

      <section className="dashboard-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nº Pedido</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Itens</th>
                <th className="col-num">Valor total (R$)</th>
                <th className="col-num">Lucro</th>
                <th>Status</th>
                <th>Ações operacionais</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => {
                const st = statusPedido[p.idc_status];
                const aberto = p.idc_status === 'EM_PREPARACAO';
                return (
                  <tr key={p.id_pedido_venda}>
                    <td><span className={`mono pd-id ${corId[p.idc_status]}`}><b>#{p.id_pedido_venda}</b></span></td>
                    <td><b>{p.nom_cliente}</b></td>
                    <td>
                      <div className="celula-dupla">
                        <span className="mono">{dataBR(p.dat_pedido)}</span>
                        <small className="mono">{horaBR(p.dat_pedido)}</small>
                      </div>
                    </td>
                    <td><span className="mono">{inteiro(p.qtd_itens)} {p.qtd_itens === 1 ? 'item' : 'itens'}</span></td>
                    <td className="col-num"><span className="mono"><b>{brl(p.vlr_total)}</b></span></td>
                    <td className="col-num">
                      <div className="celula-dupla pd-dir">
                        <span className="mono">{brl(p.vlr_lucro)}</span>
                        <small>{aberto ? 'Estimado' : p.idc_status === 'FINALIZADO' ? 'Realizado' : '—'}</small>
                      </div>
                    </td>
                    <td><span className={`pill pd-pill ${st.cor}`}><span className={st.pulso ? 'pd-pisca' : ''} />{st.rotulo}</span></td>
                    <td>
                      <div className="acoes">
                        <button type="button" title={aberto ? 'Visualizar / editar pedido' : 'Visualizar pedido'} onClick={() => abrir(p)}><FilePenLine size={15} /></button>
                        {aberto && (
                          <>
                            <button type="button" title="Finalizar pedido & baixar estoque" onClick={() => finalizar(p)}><CheckCheck size={15} /></button>
                            <button type="button" className="perigo" title="Cancelar pedido" onClick={() => cancelar(p)}><CircleX size={15} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {carregando && <tr><td colSpan={8} className="vazio">Carregando pedidos…</td></tr>}
              {!carregando && filtrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="vazio">
                    {pedidos.length === 0 ? 'Nenhum pedido ainda. Clique em "Novo Pedido de Venda".' : 'Nenhum pedido encontrado com esses filtros.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Exibindo <strong>{filtrados.length}</strong> de <strong>{pedidos.length}</strong> pedidos</span>
        </div>
      </section>

      <PedidoDrawer
        aberto={drawer.aberto}
        pedido={drawer.pedido}
        clientes={clientes}
        produtos={produtos}
        onClose={fechar}
        onSalvar={salvar}
        onFinalizar={finalizar}
        onCancelar={cancelar}
        onAviso={(titulo, msg) => avisar(titulo, msg, true)}
      />
      <Toast toast={toast} />
    </div>
  );
}
