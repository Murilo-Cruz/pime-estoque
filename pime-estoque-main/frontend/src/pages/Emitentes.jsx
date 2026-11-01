import { useEffect, useRef, useState } from 'react';
import {
  CalendarClock,
  Download,
  Factory,
  FileCheck,
  FileUp,
  Handshake,
  LayoutGrid,
  List,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Ship,
  ShoppingCart,
  Timer,
  TrendingUp,
  Truck,
  UserPlus,
  Users,
} from 'lucide-react';
import EmitenteModal from '../components/EmitenteModal';
import Toast from '../components/Toast';
import { emitentes } from '../data/emitentes';
import './Emitentes.css';

const iconesTipo = { fabricante: Factory, distribuidor: Truck, importador: Ship, servico: Handshake };
const corTipo = { fabricante: 'verde', distribuidor: 'ciano', importador: 'verde', servico: 'muted' };
const iconesContrato = { atencao: CalendarClock, ok: FileCheck, pendente: FileUp };
const corStatus = { ativo: 'verde', analise: 'ciano', bloqueado: 'erro' };
const rotuloStatus = { ativo: 'Ativo', analise: 'Em análise', bloqueado: 'Bloqueado' };
const corPontualidade = { ok: 'verde', atencao: 'ciano', pendente: '' };

function Info({ rotulo, children, cor = '' }) {
  return (
    <div className="em-info">
      <span>{rotulo}</span>
      <strong className={cor}>{children}</strong>
    </div>
  );
}

function CardFornecedor({ e, onPedido, onEditar }) {
  const IconeTipo = iconesTipo[e.tipo];
  const IconeContrato = iconesContrato[e.contratoSituacao];

  return (
    <article className="em-card">
      <div className="em-card-topo">
        <span className={`em-card-icone ${corTipo[e.tipo]}`}><IconeTipo size={24} /></span>
        <div className="em-card-titulo">
          <div>
            <strong>{e.nome}</strong>
            <span className={`em-tag ${corTipo[e.tipo]}`}>{e.tipoRotulo}</span>
          </div>
          <small>{e.razaoSocial}</small>
        </div>
        <span className={`em-sefaz ${corStatus[e.status]}`}>
          <i />{rotuloStatus[e.status]}
        </span>
      </div>

      <div className="em-info-grid">
        <Info rotulo="CNPJ"><span className="mono">{e.cnpj}</span></Info>
        <Info rotulo="Localidade">{e.localidade}</Info>
        <Info rotulo="Categorias">{e.categoria}</Info>
        <Info rotulo="Condição de Pagamento">{e.pagamento}</Info>
        <Info rotulo="Prazo de Entrega">
          <span className="mono">{e.prazoEntrega}</span>
        </Info>
        <Info rotulo="Pontualidade (OTIF)" cor={corPontualidade[e.pontualidadeSituacao]}>
          {e.pontualidade}
        </Info>
      </div>

      <div className="em-cert-linha">
        <span className={`em-cert-icone ${e.contratoSituacao === 'ok' ? 'verde' : 'ciano'}`}>
          <IconeContrato size={18} />
        </span>
        <div>
          <strong>{e.contratoNome}</strong>
          <small>{e.contratoDetalhe}</small>
        </div>
        <button
          type="button"
          className={`em-btn-mini ${e.contratoSituacao === 'pendente' ? 'destaque' : ''}`}
        >
          {e.contratoAcao}
        </button>
      </div>

      <div className="em-card-rodape">
        <small>{e.ultimoDoc}</small>
        <div>
          <button type="button" className="em-btn-mini" onClick={() => onPedido(e)}>
            <ShoppingCart size={14} className="ciano" /> Novo Pedido
          </button>
          <button type="button" className="em-btn-mini" onClick={() => onEditar(e)}>
            <Pencil size={14} className="verde" /> Editar
          </button>
        </div>
      </div>
    </article>
  );
}

function TabelaFornecedores({ onEditar }) {
  return (
    <div className="dashboard-panel">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fornecedor / Razão Social</th>
              <th>CNPJ / Contato</th>
              <th>Categorias</th>
              <th>Pagamento / Prazo</th>
              <th>Contrato</th>
              <th>Pontualidade</th>
              <th>Status</th>
              <th className="em-direita">Ações</th>
            </tr>
          </thead>
          <tbody>
            {emitentes.map((e) => (
              <tr key={e.id}>
                <td>
                  <div className="em-celula">
                    <strong>{e.nome}</strong>
                    <small>{e.razaoSocial} ({e.localidade})</small>
                  </div>
                </td>
                <td>
                  <div className="em-celula">
                    <span className="mono">{e.cnpj}</span>
                    <small>{e.contato} • {e.telefone}</small>
                  </div>
                </td>
                <td>{e.categoria}</td>
                <td>
                  {e.pagamento} · <span className="mono">{e.prazoEntrega}</span>
                </td>
                <td>
                  {e.contratoVence ? (
                    <span className={`mono ${e.contratoSituacao === 'atencao' ? 'ciano' : 'verde'}`}>
                      Vence {e.contratoVence}
                    </span>
                  ) : (
                    <span className="mono erro">Sem contrato</span>
                  )}
                </td>
                <td className={corPontualidade[e.pontualidadeSituacao]}>{e.pontualidade}</td>
                <td>
                  <span className={`em-sefaz pill ${corStatus[e.status]}`}>
                    <i />{rotuloStatus[e.status]}
                  </span>
                </td>
                <td className="em-direita">
                  <button
                    type="button"
                    className="em-icon-btn verde"
                    title="Editar fornecedor"
                    onClick={() => onEditar(e)}
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Emitentes() {
  const [visao, setVisao] = useState('cards');
  const [modal, setModal] = useState({ aberto: false, emitente: null });
  const [toast, setToast] = useState(null);
  const [atualizando, setAtualizando] = useState(false);
  const timerToast = useRef(null);

  useEffect(() => () => clearTimeout(timerToast.current), []);

  function mostrarToast(titulo, mensagem) {
    setToast({ titulo, mensagem });
    clearTimeout(timerToast.current);
    timerToast.current = setTimeout(() => setToast(null), 3800);
  }



  function novoPedido(f) {
    mostrarToast('Pedido de Compra', `Rascunho de pedido iniciado para ${f.nome}.`);
  }

  const abrirEdicao = (emitente) => setModal({ aberto: true, emitente });
  const abrirNovo = () => setModal({ aberto: true, emitente: null });
  const fechar = () => setModal((m) => ({ ...m, aberto: false }));

  function salvar() {
    fechar();
    mostrarToast('Fornecedor Salvo', 'Dados cadastrais e condições comerciais atualizados com sucesso.');
  }

  function excluir() {
    const ok = window.confirm(
      'Atenção: inativar um fornecedor com histórico de compras impede novos pedidos, mas mantém a rastreabilidade dos recebimentos anteriores. Deseja continuar?'
    );
    if (!ok) return;
    fechar();
    mostrarToast('Fornecedor Inativado', 'O fornecedor foi bloqueado para novos pedidos de compra.');
  }

  return (
    <div className="dashboard emitentes-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">
            <Handshake size={14} /> MÓDULO DE COMPRAS <span className="em-versao"></span>
          </span>
          <h1>Fornecedores &amp; Parceiros de Suprimento</h1>
          <p>
            Cadastro centralizado de fornecedores, condições comerciais, prazos de entrega,
            contratos de fornecimento e desempenho de recebimento (OTIF).
          </p>
        </div>

        <div className="em-acoes">
          
          
          <button type="button" className="em-btn primario" onClick={abrirNovo}>
            <UserPlus size={16} /> Novo Fornecedor
          </button>
        </div>
      </div>

      <section className="stats-grid" aria-label="Resumo de fornecedores">
        <article className="stat-card">
          <div className="stat-card-top">
            <span>Fornecedores ativos</span>
            <span className="stat-icon green"><Users size={19} /></span>
          </div>
          <div className="em-kpi-valor">
            <strong>126</strong><small>fornecedores</small>
            <span className="em-badge verde">+4 este mês</span>
          </div>
          <div className="em-barra"><div style={{ width: '92%' }} /></div>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <span>Entregas no prazo (OTIF)</span>
            <span className="stat-icon cyan"><Timer size={19} /></span>
          </div>
          <div className="em-kpi-valor">
            <strong className="menor"><i className="em-ponto" />94,2%</strong>
            <span className="mono ciano em-lateral">Meta 95%</span>
          </div>
          <div className="em-kpi-nota">Média dos últimos 90 dias de recebimento</div>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <span>Contratos a vencer</span>
            <span className="stat-icon cyan"><CalendarClock size={19} /></span>
          </div>
          <div className="em-kpi-valor">
            <strong className="ciano">3</strong><small>nos próximos 60 dias</small>
            <span className="em-badge ciano">Atenção</span>
          </div>
          <div className="em-kpi-nota dupla">
            <span>Nexus Energy Solar</span>
            <span className="mono">15/12/2026</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <span>Compras no mês</span>
            <span className="stat-icon green"><ShoppingCart size={19} /></span>
          </div>
          <div className="em-kpi-valor">
            <strong>R$ 1,28M</strong>
            <span className="verde em-lateral em-tendencia"><TrendingUp size={14} /> +8,4%</span>
          </div>
          <div className="em-kpi-nota dupla">
            <span>Pedidos de compra em aberto</span>
            <span className="mono verde">37 POs</span>
          </div>
        </article>
      </section>

      <div className="em-lista-topo">
        <div className="em-lista-titulo">
          <Handshake size={18} className="verde" />
          <h2>Fornecedores Cadastrados</h2>
          <span className="em-contador">{emitentes.length} Fornecedores</span>
        </div>

        <div className="em-alternar" role="group" aria-label="Modo de visualização">
          <button
            type="button"
            className={visao === 'cards' ? 'ativa' : ''}
            onClick={() => setVisao('cards')}
          >
            <LayoutGrid size={14} /> <span>Cards</span>
          </button>
          <button
            type="button"
            className={visao === 'tabela' ? 'ativa' : ''}
            onClick={() => setVisao('tabela')}
          >
            <List size={14} /> <span>Tabela</span>
          </button>
        </div>
      </div>

      {visao === 'cards' ? (
        <div className="em-cards">
          {emitentes.map((e) => (
            <CardFornecedor key={e.id} e={e} onPedido={novoPedido} onEditar={abrirEdicao} />
          ))}
        </div>
      ) : (
        <TabelaFornecedores onEditar={abrirEdicao} />
      )}

      

      

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