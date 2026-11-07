import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CircleDollarSign, FilterX, Pencil, Search, ShoppingCart, UserPlus, UsersRound, Wallet,
} from 'lucide-react';
import ClienteDrawer from '../components/ClienteDrawer';
import Toast from '../components/Toast';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { brl, codigo, inteiro } from '../utils/formatos';
import './Clientes.css';

const filtrosIniciais = { busca: '', tipo: '' };
const rotuloTipo = { CLIENTE: 'Cliente', AMBOS: 'Cliente e fornecedor' };

export default function Clientes() {
  const chamar = useApi();
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [toast, avisar] = useToast();

  const carregar = useCallback(async () => {
    setErro('');
    try {
      const [cli, ped] = await Promise.all([chamar('/emitentes?tipo=CLIENTE'), chamar('/pedidos')]);
      setClientes(cli);
      setPedidos(ped);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [chamar]);

  useEffect(() => { carregar(); }, [carregar]);

  // Agrega os pedidos por cliente (em aberto = EM_PREPARACAO, faturado = FINALIZADO)
  const resumoPorCliente = useMemo(() => {
    const mapa = new Map();
    for (const p of pedidos) {
      const r = mapa.get(p.id_cliente) ?? { abertos: 0, vlrAberto: 0, finalizados: 0, vlrFaturado: 0 };
      if (p.idc_status === 'EM_PREPARACAO') { r.abertos += 1; r.vlrAberto += p.vlr_total; }
      if (p.idc_status === 'FINALIZADO') { r.finalizados += 1; r.vlrFaturado += p.vlr_total; }
      mapa.set(p.id_cliente, r);
    }
    return mapa;
  }, [pedidos]);

  const kpis = useMemo(() => {
    const resumos = [...resumoPorCliente.values()];
    const abertos = resumos.reduce((s, r) => s + r.abertos, 0);
    return [
      { titulo: 'Total de clientes', valor: inteiro(clientes.length), badge: `${clientes.filter((c) => c.idc_tipo === 'AMBOS').length} também fornecem`, detalhe: 'Cadastrados como cliente', icone: UsersRound, cor: 'green' },
      { titulo: 'Clientes com pedido aberto', valor: inteiro(resumos.filter((r) => r.abertos > 0).length), badge: `${abertos} pedido(s)`, detalhe: 'Pedidos em preparação', icone: ShoppingCart, cor: 'cyan' },
      { titulo: 'Valor em pedidos abertos', valor: brl(resumos.reduce((s, r) => s + r.vlrAberto, 0)), badge: 'A faturar', detalhe: 'Soma dos pedidos em preparação', icone: Wallet, cor: 'cyan' },
      { titulo: 'Total faturado', valor: brl(resumos.reduce((s, r) => s + r.vlrFaturado, 0)), badge: `${resumos.reduce((s, r) => s + r.finalizados, 0)} pedido(s)`, detalhe: 'Pedidos finalizados', icone: CircleDollarSign, cor: 'green' },
    ];
  }, [clientes, resumoPorCliente]);

  const filtrados = useMemo(() => {
    const termo = filtros.busca.trim().toLowerCase();
    return clientes.filter((c) => (
      (!termo ||
        c.nom_emitente.toLowerCase().includes(termo) ||
        (c.des_documento ?? '').toLowerCase().includes(termo) ||
        codigo('CLI', c.id_emitente).toLowerCase().includes(termo)) &&
      (!filtros.tipo || c.idc_tipo === filtros.tipo)
    ));
  }, [clientes, filtros]);

  const mudar = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  const abrirEdicao = (cliente) => { setClienteEditando(cliente); setDrawerAberto(true); };
  const abrirNovo = () => { setClienteEditando(null); setDrawerAberto(true); };
  const fechar = () => setDrawerAberto(false);

  async function salvar(dados) {
    try {
      const editando = Boolean(clienteEditando);
      await chamar(editando ? `/emitentes/${clienteEditando.id_emitente}` : '/emitentes', {
        metodo: editando ? 'PUT' : 'POST',
        corpo: dados,
      });
      fechar();
      await carregar();
      avisar('Cliente salvo', `${dados.nom_emitente} salvo com sucesso.`);
    } catch (e) {
      avisar('Não foi possível salvar', e.message, true);
    }
  }

  async function excluir(cliente) {
    if (!window.confirm(`Excluir o cliente "${cliente.nom_emitente}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await chamar(`/emitentes/${cliente.id_emitente}`, { metodo: 'DELETE' });
      fechar();
      await carregar();
      avisar('Cliente excluído', cliente.nom_emitente);
    } catch (e) {
      avisar('Não foi possível excluir', e.message, true);
    }
  }

  return (
    <div className="dashboard clientes-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow"><UsersRound size={14} /> CADASTRO</span>
          <h1>Gestão de Clientes</h1>
          <p>Cadastro de clientes e acompanhamento dos pedidos de venda vinculados a cada um.</p>
        </div>

        <div className="page-actions">
          <button type="button" className="primary-button" onClick={abrirNovo}>
            <UserPlus size={15} /> Novo Cliente
          </button>
        </div>
      </div>

      {erro && (
        <div className="aviso-erro">
          <span>Não foi possível carregar os clientes: {erro}</span>
          <button type="button" onClick={carregar}>Tentar novamente</button>
        </div>
      )}

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
          <input type="text" value={filtros.busca} onChange={mudar('busca')} placeholder="Buscar por nome, CPF/CNPJ ou código..." />
        </div>

        <select value={filtros.tipo} onChange={mudar('tipo')} aria-label="Tipo">
          <option value="">Tipo: Todos</option>
          <option value="CLIENTE">Somente cliente</option>
          <option value="AMBOS">Cliente e fornecedor</option>
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
                <th>Código</th>
                <th>Cliente / Documento</th>
                <th>Tipo</th>
                <th>Contato</th>
                <th className="col-num">Pedidos abertos</th>
                <th className="col-num">Total faturado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => {
                const r = resumoPorCliente.get(c.id_emitente);
                return (
                  <tr key={c.id_emitente}>
                    <td className="codigo">{codigo('CLI', c.id_emitente)}</td>
                    <td>
                      <div className="product-cell">
                        <span>
                          <strong>{c.nom_emitente}</strong>
                          <small>{c.des_documento || 'Sem documento'}</small>
                        </span>
                      </div>
                    </td>
                    <td><span className="tag">{rotuloTipo[c.idc_tipo] ?? c.idc_tipo}</span></td>
                    <td>
                      <div className="celula-dupla">
                        <span>{c.des_email || '—'}</span>
                        <small>{c.des_telefone || '—'}</small>
                      </div>
                    </td>
                    <td className="col-num">
                      <div className="celula-dupla">
                        <span className="valor neutro">{brl(r?.vlrAberto ?? 0)}</span>
                        <small>{r?.abertos ? `${r.abertos} pedido(s)` : 'Nenhum pedido aberto'}</small>
                      </div>
                    </td>
                    <td className="col-num">
                      <div className="celula-dupla">
                        <span className="valor ativo">{brl(r?.vlrFaturado ?? 0)}</span>
                        <small>{r?.finalizados ? `${r.finalizados} pedido(s)` : 'Sem histórico'}</small>
                      </div>
                    </td>
                    <td>
                      <div className="acoes">
                        <button type="button" title="Editar cliente" onClick={() => abrirEdicao(c)}>
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {carregando && <tr><td colSpan={7} className="vazio">Carregando clientes…</td></tr>}
              {!carregando && filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="vazio">
                    {clientes.length === 0 ? 'Nenhum cliente cadastrado ainda. Clique em "Novo Cliente".' : 'Nenhum cliente encontrado com esses filtros.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Exibindo <strong>{filtrados.length}</strong> de <strong>{clientes.length}</strong> clientes</span>
        </div>
      </section>

      <ClienteDrawer
        aberto={drawerAberto}
        cliente={clienteEditando}
        pedidos={pedidos.filter((p) => p.id_cliente === clienteEditando?.id_emitente)}
        onClose={fechar}
        onSalvar={salvar}
        onExcluir={excluir}
        onErro={(msg) => avisar('Atenção', msg, true)}
      />

      <Toast toast={toast} />
    </div>
  );
}
