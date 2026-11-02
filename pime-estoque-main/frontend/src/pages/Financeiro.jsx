import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftRight, ArrowRight, BadgeDollarSign, CalendarDays, ChartColumn, ChevronLeft, ChevronRight,
  CircleCheck, Download, FileText, ListChecks, Plus, Receipt, RotateCcw, Search, ShieldCheck, TrendingUp,
} from 'lucide-react';
import LancamentoModal from '../components/LancamentoModal';
import Toast from '../components/Toast';
import {
  brl, canais, faixa, filtroCanais, filtroMargem, kpisFin, lancamentosIniciais, lucro, margemPct, markupPct,
  pct, periodos, series, statusLanc, topSkus,
} from '../data/financeiro';
import './Clientes.css'; // reaproveita KPIs, filtros, tabela e botões (classes globais)
import './Financeiro.css';

const filtrosIniciais = { busca: '', margem: '', canal: '', status: '' };
const abas = [['diario', 'Diário'], ['semanal', 'Semanal'], ['mensal', 'Mensal']];

function Grafico({ dados }) {
  const maxV = Math.max(...dados.map((d) => d.venda));
  const esc = 160 / maxV;
  const passo = 700 / dados.length;
  const pontos = dados.map((d, i) => `${i * passo + passo / 2},${180 - (d.venda - d.cmv) * esc}`);

  return (
    <svg className="fi-svg" viewBox="0 0 700 200" preserveAspectRatio="none" role="img" aria-label="Receita, CMV e lucro bruto por período">
      {[30, 80, 130].map((y) => <line key={y} x1="0" x2="700" y1={y} y2={y} stroke="#262a33" strokeDasharray="3 3" />)}
      <line x1="0" x2="700" y1="180" y2="180" stroke="#262a33" />
      {dados.map((d, i) => {
        const x = i * passo + passo / 2 - 30;
        return (
          <g key={d.rotulo}>
            <rect x={x} y={180 - d.venda * esc} width="28" height={d.venda * esc} rx="3" fill="#4edea3" opacity={d.proj ? 0.6 : 0.9} />
            <rect x={x + 32} y={180 - d.cmv * esc} width="28" height={d.cmv * esc} rx="3" fill="#31353e" opacity={d.proj ? 0.7 : 1} />
          </g>
        );
      })}
      <polyline points={pontos.join(' ')} fill="none" stroke="#4cd7f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {pontos.map((p) => { const [cx, cy] = p.split(','); return <circle key={p} cx={cx} cy={cy} r="4" fill="#4cd7f6" />; })}
    </svg>
  );
}

export default function Financeiro() {
  const [lista, setLista] = useState(lancamentosIniciais);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [selecionados, setSelecionados] = useState([]);
  const [periodo, setPeriodo] = useState('month');
  const [aba, setAba] = useState('semanal');
  const [modal, setModal] = useState({ aberto: false, lancamento: null });
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const avisar = (titulo, mensagem = '') => {
    setToast({ titulo, mensagem });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3600);
  };

  const filtrados = useMemo(() => {
    const t = filtros.busca.trim().toLowerCase();
    return lista.filter((l) => {
      const texto = `${l.id} ${l.cliente} ${l.nf} ${l.mix} ${l.cnpj}`.toLowerCase();
      return (
        (!t || texto.includes(t)) &&
        (!filtros.margem || faixa(l) === filtros.margem) &&
        (!filtros.canal || l.canal === filtros.canal) &&
        (!filtros.status || l.status === filtros.status)
      );
    });
  }, [lista, filtros]);

  const tot = useMemo(() => {
    const venda = filtrados.reduce((s, l) => s + l.venda, 0);
    const custo = filtrados.reduce((s, l) => s + l.custo, 0);
    return { venda, custo, lucro: venda - custo, margem: venda > 0 ? ((venda - custo) / venda) * 100 : 0 };
  }, [filtrados]);

  const mudar = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));
  const todos = filtrados.length > 0 && filtrados.every((l) => selecionados.includes(l.id));
  const alternar = (id) => setSelecionados((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const alternarTodos = () => setSelecionados(todos ? [] : filtrados.map((l) => l.id));

  const abrir = (lancamento = null) => setModal({ aberto: true, lancamento });
  const fechar = () => setModal((m) => ({ ...m, aberto: false }));

  function salvar(d) {
    if (modal.lancamento) {
      setLista((l) => l.map((x) => (x.id === modal.lancamento.id
        ? { ...x, cliente: d.cliente, mix: d.mix, canal: d.canal, venda: d.venda, custo: d.custo, status: d.status } : x)));
      avisar('Lançamento atualizado', `#${d.id} recalculado com a nova composição de margem.`);
    } else {
      setLista((l) => [{
        id: d.id, nf: '—', cliente: d.cliente, mix: d.mix || 'Operação diversa', canal: d.canal, cnpj: 'Lançamento manual',
        venda: d.venda, custo: d.custo, unitVenda: '—', unitCusto: '—', status: d.status,
      }, ...l]);
      avisar('Lançamento apurado', `#${d.id} incluído na consolidação de margem.`);
    }
    fechar();
  }

  function conciliar(l) {
    setLista((arr) => arr.map((x) => (x.id === l.id ? { ...x, status: 'faturado' } : x)));
    avisar('Título conciliado', `Lançamento #${l.id} foi conciliado com o financeiro.`);
  }

  const dados = series[aba];

  return (
    <div className="dashboard financeiro-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">
            FINANCEIRO &amp; CONTROLADORIA 
          
          </span>
          <h1>Gestão Financeira &amp; Lucratividade de Vendas</h1>
          <p>
            Consolidação analítica de margem bruta entre preço de venda praticado e custo de aquisição dos itens
            (CPV/CMV por SKU/lote). Auditoria automática de markup, margem de contribuição e lucratividade por pedido faturado.
          </p>
        </div>

        <div className="page-actions">
          <label className="fi-periodo">
            <CalendarDays size={16} />
            <select value={periodo} onChange={(e) => { setPeriodo(e.target.value); avisar('Período alterado', periodos.find(([v]) => v === e.target.value)[1]); }}>
              {periodos.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
            </select>
          </label>
         
          <button type="button" className="primary-button" onClick={() => abrir()}>
            <Plus size={15} /> Apurar Lançamento
          </button>
        </div>
      </div>

      <section className="stats-grid" aria-label="Indicadores financeiros">
        {kpisFin.map((k) => {
          const Icone = k.icone;
          return (
            <article className={`stat-card ${k.cor}`} key={k.titulo}>
              <div className="stat-card-top">
                <span className={k.destaque ? 'verde' : ''}>{k.titulo}</span>
                <span className={`stat-icon ${k.cor}`}><Icone size={19} /></span>
              </div>
              <div className={`fi-kpi-valor ${k.destaque ? 'verde' : ''}`}><strong>{k.valor}</strong></div>
              <div className="fi-kpi-linha">
                <span className={`fi-chip ${k.destaque ? 'verde' : ''}`}>{k.badge}</span>
                <small>{k.nota}</small>
              </div>
              <div className="fi-kpi-rodape">
                <span>{k.rodape[0]}</span><b className={`mono ${k.rodape[2]}`}>{k.rodape[1]}</b>
              </div>
            </article>
          );
        })}
      </section>

      <section className="fi-cockpit">
        <article className="fi-painel">
          <header>
            <div>
              <h2>Consolidação de Lucro &amp; Margem por Período</h2>
              <small>Faturamento bruto (preço de venda) vs. CMV acumulado dos itens e margem operacional realizada</small>
            </div>
            <div className="fi-abas">
              {abas.map(([v, r]) => <button key={v} type="button" className={aba === v ? 'ativa' : ''} onClick={() => setAba(v)}>{r}</button>)}
            </div>
          </header>

          <div className="fi-grafico">
            <div className="fi-legenda">
              <span><i className="v" /> Receita Bruta (Venda)</span>
              <span><i className="c" /> Custo Mercadoria (CMV)</span>
              <span className="ciano"><i className="l" /> Lucro Bruto Apurado (R$)</span>
              <span className="verde fi-direita"><i className="p" /> Margem média: 39,4% (spread seguro)</span>
            </div>
            <Grafico dados={dados} />
            <div className="fi-eixo" style={{ gridTemplateColumns: `repeat(${dados.length}, 1fr)` }}>
              {dados.map((d) => {
                const m = ((d.venda - d.cmv) / d.venda) * 100;
                return (
                  <div key={d.rotulo} className={d.proj ? 'ciano' : ''}>
                    <span>{d.rotulo}</span>
                    <b className={d.proj || m < 38 ? 'ciano' : 'verde'}>Margem: {pct(m)}</b>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="fi-insight">
            <span><TrendingUp size={17} /> Margem de contribuição média ponderada de <b>39,4%</b> calculada sobre 184 faturas e 1.420 itens expedidos.</span>
            <button type="button" onClick={() => avisar('DRE por SKU', 'Visão detalhada por SKU em desenvolvimento.')}>DRE Detalhado por SKU <ArrowRight size={13} /></button>
          </div>
        </article>

        <article className="fi-painel fi-top">
          <header>
            <div>
              <h2>Top SKUs Mais Lucrativos</h2>
              <small>Preço Venda vs Custo Aquisição (Margem Unitária)</small>
            </div>
            <TrendingUp size={20} className="verde" />
          </header>

          <div className="fi-skus">
            {topSkus.map((s) => (
              <div className="fi-sku" key={s.pos}>
                <span className={`fi-pos ${s.cor}`}>{s.pos}</span>
                <div><strong>{s.nome}</strong><small>{s.info}</small></div>
                <div className="fi-dir"><b className="mono verde">{s.margem}</b><small className="mono">{s.lucro}</small></div>
              </div>
            ))}
          </div>

          <div className="fi-eficiencia">
            <div><span>Eficiência de precificação global</span><b className="verde">Markup: 1,65x</b></div>
            <div><strong>Margem bruta média alvo:</strong><b className="mono verde">39,4% (Meta: 38%)</b></div>
            <div className="fi-barra"><div style={{ width: '82%' }} /></div>
          </div>
        </article>
      </section>

      <section className="filters-bar">
        <div className="search-field">
          <Search size={16} />
          <input type="text" value={filtros.busca} onChange={mudar('busca')} placeholder="Buscar por pedido (#PV), cliente, SKU, lote ou NF-e..." />
        </div>
        <select value={filtros.margem} onChange={mudar('margem')} aria-label="Faixa de margem">
          <option value="">Faixa de margem: todas</option>
          {filtroMargem.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
        </select>
        <select value={filtros.canal} onChange={mudar('canal')} aria-label="Canal">
          <option value="">Canal: todos os canais</option>
          {filtroCanais.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
        </select>
        <select value={filtros.status} onChange={mudar('status')} aria-label="Status">
          <option value="">Status: todos os pedidos</option>
          {Object.entries(statusLanc).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
        </select>
        <button type="button" className="secondary-button" onClick={() => setFiltros(filtrosIniciais)}><RotateCcw size={14} /> Limpar</button>
      </section>

      {selecionados.length > 0 && (
        <div className="fi-bulk">
          <span><ListChecks size={16} /> {selecionados.length} título(s) selecionado(s)</span>
          <div>
            <button type="button" className="primary-button" onClick={() => avisar('Baixa em lote', 'Títulos selecionados baixados.')}>Baixar em Lote</button>
            <button type="button" className="btn-neutro" onClick={() => avisar('Remessa CNAB', 'Arquivo de remessa gerado.')}>Gerar Remessa CNAB</button>
          </div>
        </div>
      )}

      <section className="dashboard-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="col-check"><input type="checkbox" checked={todos} onChange={alternarTodos} aria-label="Selecionar todos" /></th>
                <th>Pedido / Ref</th>
                <th>Cliente &amp; mix de itens</th>
                <th>Faturamento bruto (PV)</th>
                <th>Custo itens (CMV)</th>
                <th className="col-num">Lucro bruto apurado</th>
                <th>Margem (%)</th>
                <th>Ações DRE</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((l) => {
                const m = margemPct(l);
                const cor = m >= 38 ? 'verde' : m >= 25 ? 'ciano' : 'erro';
                return (
                  <tr key={l.id}>
                    <td className="col-check"><input type="checkbox" checked={selecionados.includes(l.id)} onChange={() => alternar(l.id)} aria-label={`Selecionar ${l.id}`} /></td>
                    <td>
                      <div className="celula-dupla">
                        <span className="fi-ref"><b className="mono verde">#{l.id}</b><i><Receipt size={12} /> NF {l.nf}</i></span>
                        <small>{statusLanc[l.status]}</small>
                      </div>
                    </td>
                    <td>
                      <div className="celula-dupla">
                        <span><b>{l.cliente}</b></span>
                        <small>{l.mix} • {canais[l.canal]} • <em className="mono ciano">CNPJ: {l.cnpj}</em></small>
                      </div>
                    </td>
                    <td><div className="celula-dupla"><span className="mono">{brl(l.venda)}</span><small>Preço venda médio: {l.unitVenda}</small></div></td>
                    <td><div className="celula-dupla"><span className="mono mudo">{brl(l.custo)}</span><small className="mono">Custo aquisição: {l.unitCusto}</small></div></td>
                    <td className="col-num">
                      <div className="celula-dupla fi-dir">
                        <span className="mono verde"><b>+{brl(lucro(l))}</b></span>
                        <small className="mono">Markup: +{pct(markupPct(l))}</small>
                      </div>
                    </td>
                    <td><span className={`pill fi-pill ${cor}`}><span />{pct(m)} Margem</span></td>
                    <td>
                      <div className="acoes">
                        <button type="button" title="Composição detalhada de margem por item" onClick={() => abrir(l)}><ChartColumn size={15} /></button>
                        <button type="button" title="Conciliar DRE com financeiro" onClick={() => conciliar(l)}><CircleCheck size={15} /></button>
                        <button type="button" title="Exportar espelho de custos" onClick={() => avisar('Espelho de custos', `Exportando espelho de custos de #${l.id}...`)}><FileText size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && <tr><td colSpan={8} className="vazio">Nenhum lançamento encontrado com esses filtros.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="table-footer fi-rodape">
          <span>Exibindo <strong>{filtrados.length}</strong> de <strong>184</strong> pedidos faturados • Venda total: <strong>{brl(tot.venda)}</strong> • CMV total: {brl(tot.custo)} • <b className="verde">Lucro bruto: +{brl(tot.lucro)} (Margem: {pct(tot.margem)})</b></span>
          <div className="fi-pager">
            <button type="button" disabled><ChevronLeft size={16} /></button>
            <b>1</b><button type="button">2</button><button type="button">3</button><span>...</span><button type="button">37</button>
            <button type="button"><ChevronRight size={16} /></button>
          </div>
        </div>
      </section>

      

      

      <LancamentoModal
        aberto={modal.aberto}
        lancamento={modal.lancamento}
        onClose={fechar}
        onSalvar={salvar}
        onErro={(m) => avisar('Atenção', m)}
      />
      <Toast toast={toast} />
    </div>
  );
}