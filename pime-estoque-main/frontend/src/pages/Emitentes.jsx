import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Handshake, LayoutGrid, List, PackagePlus, Pencil, ShoppingCart, TrendingUp, Truck, UserPlus, Users,
} from 'lucide-react';
import EmitenteModal from '../components/EmitenteModal';
import Toast from '../components/Toast';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { brl, dataBR, hojeISO, inteiro } from '../utils/formatos';
import './Emitentes.css';

const mesAtual = hojeISO().slice(0, 7);
const rotuloTipo = { FORNECEDOR: 'Fornecedor', AMBOS: 'Fornecedor e cliente' };

function Info({ rotulo, children, cor = '' }) {
  return (
    <div className="em-info">
      <span>{rotulo}</span>
      <strong className={cor}>{children}</strong>
    </div>
  );
}

function CardFornecedor({ e, resumo, onEntrada, onEditar }) {
  return (
    <article className="em-card">
      <div className="em-card-topo">
        <span className="em-card-icone verde"><Truck size={24} /></span>
        <div className="em-card-titulo">
          <div>
            <strong>{e.nom_emitente}</strong>
            <span className={`em-tag ${e.idc_tipo === 'AMBOS' ? 'ciano' : 'verde'}`}>{rotuloTipo[e.idc_tipo]}</span>
          </div>
          <small>{e.des_email || 'Sem e-mail cadastrado'}</small>
        </div>
      </div>

      <div className="em-info-grid">
        <Info rotulo="CPF / CNPJ"><span className="mono">{e.des_documento || '—'}</span></Info>
        <Info rotulo="Telefone"><span className="mono">{e.des_telefone || '—'}</span></Info>
        <Info rotulo="Entradas registradas">{inteiro(resumo?.qtd ?? 0)}</Info>
        <Info rotulo="Total comprado" cor="verde">{brl(resumo?.total ?? 0)}</Info>
      </div>

      <div className="em-card-rodape">
        <small>{resumo?.ultima ? `Última entrada: #${resumo.ultimaId} em ${dataBR(resumo.ultima)}` : 'Nenhuma entrada registrada'}</small>
        <div>
          <button type="button" className="em-btn-mini" onClick={() => onEntrada(e)}>
            <PackagePlus size={14} className="ciano" /> Nova Entrada
          </button>
          <button type="button" className="em-btn-mini" onClick={() => onEditar(e)}>
            <Pencil size={14} className="verde" /> Editar
          </button>
        </div>
      </div>
    </article>
  );
}

function TabelaFornecedores({ lista, resumos, onEditar }) {
  return (
    <div className="dashboard-panel">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fornecedor</th>
              <th>Documento / Contato</th>
              <th>Tipo</th>
              <th>Entradas</th>
              <th>Total comprado</th>
              <th className="em-direita">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((e) => {
              const r = resumos.get(e.id_emitente);
              return (
                <tr key={e.id_emitente}>
                  <td>
                    <div className="em-celula">
                      <strong>{e.nom_emitente}</strong>
                      <small>{e.des_email || '—'}</small>
                    </div>
                  </td>
                  <td>
                    <div className="em-celula">
                      <span className="mono">{e.des_documento || '—'}</span>
                      <small>{e.des_telefone || '—'}</small>
                    </div>
                  </td>
                  <td>{rotuloTipo[e.idc_tipo]}</td>
                  <td>{inteiro(r?.qtd ?? 0)}</td>
                  <td className="mono verde">{brl(r?.total ?? 0)}</td>
                  <td className="em-direita">
                    <button type="button" className="em-icon-btn verde" title="Editar fornecedor" onClick={() => onEditar(e)}>
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {lista.length === 0 && <tr><td colSpan={6} className="vazio">Nenhum fornecedor cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Fornecedores() {
  const chamar = useApi();
  const navegar = useNavigate();
  const [fornecedores, setFornecedores] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [visao, setVisao] = useState('cards');
  const [modal, setModal] = useState({ aberto: false, emitente: null });
  const [toast, avisar] = useToast();

  const carregar = useCallback(async () => {
    setErro('');
    try {
      const [forn, ent] = await Promise.all([chamar('/emitentes?tipo=FORNECEDOR'), chamar('/entradas')]);
      setFornecedores(forn);
      setEntradas(ent);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [chamar]);

  useEffect(() => { carregar(); }, [carregar]);

  // entradas já vêm da mais recente para a mais antiga
  const resumos = useMemo(() => {
    const mapa = new Map();
    for (const en of entradas) {
      const r = mapa.get(en.id_fornecedor) ?? { qtd: 0, total: 0, ultima: en.dat_entrada, ultimaId: en.id_estoque_entrada };
      r.qtd += 1;
      r.total += en.vlr_total;
      mapa.set(en.id_fornecedor, r);
    }
    return mapa;
  }, [entradas]);

  const kpis = useMemo(() => {
    const doMes = entradas.filter((e) => e.dat_entrada.startsWith(mesAtual));
    return {
      total: fornecedores.length,
      ambos: fornecedores.filter((f) => f.idc_tipo === 'AMBOS').length,
      comprasMes: doMes.reduce((s, e) => s + e.vlr_total, 0),
      entradasMes: doMes.length,
    };
  }, [fornecedores, entradas]);

  const abrirEdicao = (emitente) => setModal({ aberto: true, emitente });
  const abrirNovo = () => setModal({ aberto: true, emitente: null });
  const fechar = () => setModal((m) => ({ ...m, aberto: false }));

  const novaEntrada = (f) => navegar('/entradas', { state: { idFornecedor: f.id_emitente } });

  async function salvar(dados) {
    try {
      const editando = Boolean(modal.emitente);
      await chamar(editando ? `/emitentes/${modal.emitente.id_emitente}` : '/emitentes', {
        metodo: editando ? 'PUT' : 'POST',
        corpo: dados,
      });
      fechar();
      await carregar();
      avisar('Fornecedor salvo', `${dados.nom_emitente} salvo com sucesso.`);
    } catch (e) {
      avisar('Não foi possível salvar', e.message, true);
    }
  }

  async function excluir(emitente) {
    if (!window.confirm(`Excluir o fornecedor "${emitente.nom_emitente}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await chamar(`/emitentes/${emitente.id_emitente}`, { metodo: 'DELETE' });
      fechar();
      await carregar();
      avisar('Fornecedor excluído', emitente.nom_emitente);
    } catch (e) {
      avisar('Não foi possível excluir', e.message, true);
    }
  }

  return (
    <div className="dashboard emitentes-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow"><Handshake size={14} /> MÓDULO DE COMPRAS</span>
          <h1>Fornecedores &amp; Parceiros de Suprimento</h1>
          <p>Cadastro de fornecedores e histórico das entradas de estoque registradas para cada um.</p>
        </div>

        <div className="em-acoes">
          <button type="button" className="em-btn primario" onClick={abrirNovo}>
            <UserPlus size={16} /> Novo Fornecedor
          </button>
        </div>
      </div>

      {erro && (
        <div className="aviso-erro">
          <span>Não foi possível carregar os fornecedores: {erro}</span>
          <button type="button" onClick={carregar}>Tentar novamente</button>
        </div>
      )}

      <section className="stats-grid" aria-label="Resumo de fornecedores">
        <article className="stat-card">
          <div className="stat-card-top">
            <span>Fornecedores cadastrados</span>
            <span className="stat-icon green"><Users size={19} /></span>
          </div>
          <div className="em-kpi-valor">
            <strong>{inteiro(kpis.total)}</strong><small>fornecedores</small>
          </div>
          <div className="em-kpi-nota">{inteiro(kpis.ambos)} também cadastrado(s) como cliente</div>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <span>Entradas no mês</span>
            <span className="stat-icon cyan"><PackagePlus size={19} /></span>
          </div>
          <div className="em-kpi-valor">
            <strong className="ciano">{inteiro(kpis.entradasMes)}</strong><small>recebimentos</small>
          </div>
          <div className="em-kpi-nota">Desde o dia 1º do mês</div>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <span>Compras no mês</span>
            <span className="stat-icon green"><ShoppingCart size={19} /></span>
          </div>
          <div className="em-kpi-valor">
            <strong>{brl(kpis.comprasMes)}</strong>
          </div>
          <div className="em-kpi-nota">Soma das entradas do mês</div>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <span>Total comprado</span>
            <span className="stat-icon cyan"><TrendingUp size={19} /></span>
          </div>
          <div className="em-kpi-valor">
            <strong>{brl(entradas.reduce((s, e) => s + e.vlr_total, 0))}</strong>
          </div>
          <div className="em-kpi-nota">{inteiro(entradas.length)} entrada(s) no histórico</div>
        </article>
      </section>

      <div className="em-lista-topo">
        <div className="em-lista-titulo">
          <Handshake size={18} className="verde" />
          <h2>Fornecedores Cadastrados</h2>
          <span className="em-contador">{fornecedores.length} Fornecedores</span>
        </div>

        <div className="em-alternar" role="group" aria-label="Modo de visualização">
          <button type="button" className={visao === 'cards' ? 'ativa' : ''} onClick={() => setVisao('cards')}>
            <LayoutGrid size={14} /> <span>Cards</span>
          </button>
          <button type="button" className={visao === 'tabela' ? 'ativa' : ''} onClick={() => setVisao('tabela')}>
            <List size={14} /> <span>Tabela</span>
          </button>
        </div>
      </div>

      {carregando && <p className="carregando">Carregando fornecedores…</p>}
      {!carregando && fornecedores.length === 0 && !erro && (
        <p className="carregando">Nenhum fornecedor cadastrado ainda. Clique em "Novo Fornecedor".</p>
      )}

      {fornecedores.length > 0 && (visao === 'cards' ? (
        <div className="em-cards">
          {fornecedores.map((e) => (
            <CardFornecedor key={e.id_emitente} e={e} resumo={resumos.get(e.id_emitente)} onEntrada={novaEntrada} onEditar={abrirEdicao} />
          ))}
        </div>
      ) : (
        <TabelaFornecedores lista={fornecedores} resumos={resumos} onEditar={abrirEdicao} />
      ))}

      <EmitenteModal
        aberto={modal.aberto}
        emitente={modal.emitente}
        onClose={fechar}
        onSalvar={salvar}
        onExcluir={excluir}
      />
      <Toast toast={toast} />
    </div>
  );
}
