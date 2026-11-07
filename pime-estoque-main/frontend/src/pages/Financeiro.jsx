import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Banknote, Boxes, CalendarDays, ChartLine, RotateCcw, Search, TrendingUp, Wallet,
} from 'lucide-react';
import Toast from '../components/Toast';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import { brl, dataBR, hojeISO, inteiro, margemPct, pct, somarDias } from '../utils/formatos';
import './Clientes.css'; // reaproveita KPIs, filtros, tabela e botões (classes globais)
import './Financeiro.css';

const filtrosIniciais = { busca: '', margem: '' };
const abas = [['diario', 'Diário'], ['semanal', 'Semanal'], ['mensal', 'Mensal']];
const filtroMargem = [
  ['high', 'Margem Alta (> 38%)'],
  ['mid', 'Margem Média (25% a 38%)'],
  ['low', 'Margem Apertada (< 25%)'],
];
const periodos = [
  ['hoje', 'Hoje'],
  ['7d', 'Últimos 7 dias'],
  ['30d', 'Últimos 30 dias'],
  ['mes', 'Este mês'],
  ['custom', 'Período personalizado'],
];

const faixa = (m) => (m > 38 ? 'high' : m >= 25 ? 'mid' : 'low');

function intervalo(periodo, custom) {
  const hoje = hojeISO();
  if (periodo === 'hoje') return { de: hoje, ate: hoje };
  if (periodo === '7d') return { de: somarDias(hoje, -6), ate: hoje };
  if (periodo === '30d') return { de: somarDias(hoje, -29), ate: hoje };
  if (periodo === 'mes') return { de: `${hoje.slice(0, 8)}01`, ate: hoje };
  return custom;
}

// Agrupa as linhas diárias do backend em dia / semana (segunda a domingo) / mês
function agrupar(dias, modo) {
  const grupos = new Map();
  for (const d of dias) {
    let chave = d.dat_dia;
    let rotulo = dataBR(d.dat_dia).slice(0, 5);
    if (modo === 'semanal') {
      const data = new Date(`${d.dat_dia}T12:00:00`);
      const diff = (data.getDay() + 6) % 7; // segunda = 0
      chave = somarDias(d.dat_dia, -diff);
      rotulo = `Sem ${dataBR(chave).slice(0, 5)}`;
    }
    if (modo === 'mensal') {
      chave = d.dat_dia.slice(0, 7);
      rotulo = `${chave.slice(5, 7)}/${chave.slice(0, 4)}`;
    }
    const g = grupos.get(chave) ?? { rotulo, venda: 0, lucro: 0 };
    g.venda += d.vlr_receita;
    g.lucro += d.vlr_lucro;
    grupos.set(chave, g);
  }
  return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, g]) => ({ ...g, cmv: g.venda - g.lucro }));
}

function Grafico({ dados }) {
  if (dados.length === 0) return <p className="carregando">Nenhuma venda finalizada neste período.</p>;

  const maxV = Math.max(...dados.map((d) => d.venda), 1);
  const esc = 160 / maxV;
  const passo = 700 / dados.length;
  const larg = Math.min(28, passo * 0.38);
  const pontos = dados.map((d, i) => `${i * passo + passo / 2},${180 - Math.max(d.lucro, 0) * esc}`);

  return (
    <svg className="fi-svg" viewBox="0 0 700 200" preserveAspectRatio="none" role="img" aria-label="Receita, CMV e lucro bruto por período">
      {[30, 80, 130].map((y) => <line key={y} x1="0" x2="700" y1={y} y2={y} stroke="#262a33" strokeDasharray="3 3" />)}
      <line x1="0" x2="700" y1="180" y2="180" stroke="#262a33" />
      {dados.map((d, i) => {
        const x = i * passo + passo / 2 - larg - 2;
        return (
          <g key={d.rotulo}>
            <rect x={x} y={180 - d.venda * esc} width={larg} height={d.venda * esc} rx="3" fill="#4edea3" opacity="0.9" />
            <rect x={x + larg + 4} y={180 - d.cmv * esc} width={larg} height={d.cmv * esc} rx="3" fill="#31353e" />
          </g>
        );
      })}
      <polyline points={pontos.join(' ')} fill="none" stroke="#4cd7f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {pontos.map((p) => { const [cx, cy] = p.split(','); return <circle key={p} cx={cx} cy={cy} r="4" fill="#4cd7f6" />; })}
    </svg>
  );
}

export default function Financeiro() {
  const chamar = useApi();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [periodo, setPeriodo] = useState('30d');
  const [custom, setCustom] = useState({ de: somarDias(hojeISO(), -29), ate: hojeISO() });
  const [aba, setAba] = useState('diario');
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [toast, avisar] = useToast();

  const { de, ate } = intervalo(periodo, custom);

  const carregar = useCallback(async () => {
    if (!de || !ate || de > ate) return;
    setErro('');
    setCarregando(true);
    try {
      setDados(await chamar(`/financeiro?de=${de}&ate=${ate}`));
    } catch (e) {
      setErro(e.message);
      avisar('Não foi possível carregar o financeiro', e.message, true);
    } finally {
      setCarregando(false);
    }
  }, [chamar, de, ate, avisar]);

  useEffect(() => { carregar(); }, [carregar]);

  const resumo = dados?.resumo;
  const kpis = resumo && [
    { titulo: 'Receita bruta de vendas', valor: brl(resumo.vlr_receita), icone: Banknote, cor: 'cyan', badge: `${inteiro(resumo.qtd_pedidos)} pedido(s) finalizado(s)`, nota: 'Somente pedidos finalizados', rodape: ['Ticket médio por pedido:', brl(resumo.vlr_ticket_medio), 'ciano'] },
    { titulo: 'Custo mercadorias (CMV)', valor: brl(resumo.vlr_custo), icone: Boxes, cor: 'neutro', badge: `${pct(resumo.vlr_receita > 0 ? (resumo.vlr_custo / resumo.vlr_receita) * 100 : 0)} da receita`, nota: 'Custo médio no momento da venda', rodape: ['Custo unitário congelado:', 'na finalização', 'verde'] },
    { titulo: 'Lucro bruto consolidado', valor: `${resumo.vlr_lucro >= 0 ? '+' : ''}${brl(resumo.vlr_lucro)}`, icone: ChartLine, cor: 'green', destaque: true, badge: `Margem bruta: ${pct(resumo.vlr_margem * 100)}`, nota: 'Receita − CMV', rodape: ['Período analisado:', `${dataBR(dados.periodo.de)} a ${dataBR(dados.periodo.ate)}`, 'verde'] },
    { titulo: 'Markup', valor: `${resumo.vlr_custo > 0 ? `+${pct((resumo.vlr_lucro / resumo.vlr_custo) * 100)}` : '—'}`, icone: Wallet, cor: 'purple', badge: 'Lucro ÷ custo', nota: 'Sobre o CMV do período', rodape: ['Retorno sobre custo:', resumo.vlr_custo > 0 ? `${(resumo.vlr_receita / resumo.vlr_custo).toFixed(2).replace('.', ',')}x` : '—', 'ciano'] },
  ];

  const serie = useMemo(() => (dados ? agrupar(dados.por_dia, aba) : []), [dados, aba]);

  const vendas = useMemo(() => {
    if (!dados) return [];
    const t = filtros.busca.trim().toLowerCase();
    return dados.vendas.filter((v) => (
      (!t || `${v.id_pedido_venda} ${v.nom_cliente}`.toLowerCase().includes(t)) &&
      (!filtros.margem || faixa(margemPct(v.vlr_receita, v.vlr_lucro)) === filtros.margem)
    ));
  }, [dados, filtros]);

  const tot = useMemo(() => {
    const venda = vendas.reduce((s, v) => s + v.vlr_receita, 0);
    const custo = vendas.reduce((s, v) => s + v.vlr_custo, 0);
    return { venda, custo, lucro: venda - custo, margem: margemPct(venda, venda - custo) };
  }, [vendas]);

  const mudar = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));
  const margemGeral = resumo ? resumo.vlr_margem * 100 : 0;

  return (
    <div className="dashboard financeiro-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">FINANCEIRO &amp; CONTROLADORIA</span>
          <h1>Gestão Financeira &amp; Lucratividade de Vendas</h1>
          <p>
            Consolidação da margem bruta entre o preço de venda praticado e o custo médio dos itens no momento da venda.
            Apenas pedidos finalizados entram nos números.
          </p>
        </div>

        <div className="page-actions">
          <label className="fi-periodo">
            <CalendarDays size={16} />
            <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              {periodos.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
            </select>
          </label>
        </div>
      </div>

      {periodo === 'custom' && (
        <section className="filters-bar">
          <label className="check-ativos">De
            <input type="date" value={custom.de} max={custom.ate} onChange={(e) => setCustom((c) => ({ ...c, de: e.target.value }))} />
          </label>
          <label className="check-ativos">Até
            <input type="date" value={custom.ate} min={custom.de} onChange={(e) => setCustom((c) => ({ ...c, ate: e.target.value }))} />
          </label>
        </section>
      )}

      {erro && (
        <div className="aviso-erro">
          <span>Não foi possível carregar o financeiro: {erro}</span>
          <button type="button" onClick={carregar}>Tentar novamente</button>
        </div>
      )}

      {carregando && !dados && <p className="carregando">Carregando indicadores…</p>}

      {kpis && (
        <section className="stats-grid" aria-label="Indicadores financeiros">
          {kpis.map((k) => {
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
      )}

      {dados && (
        <section className="fi-cockpit">
          <article className="fi-painel">
            <header>
              <div>
                <h2>Consolidação de Lucro &amp; Margem por Período</h2>
                <small>Receita bruta vs. CMV e lucro bruto realizado no período selecionado</small>
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
                <span className="verde fi-direita"><i className="p" /> Margem média: {pct(margemGeral)}</span>
              </div>
              <Grafico dados={serie} />
              <div className="fi-eixo" style={{ gridTemplateColumns: `repeat(${Math.max(serie.length, 1)}, 1fr)` }}>
                {serie.map((d) => {
                  const m = margemPct(d.venda, d.lucro);
                  return (
                    <div key={d.rotulo}>
                      <span>{d.rotulo}</span>
                      <b className={m < 38 ? 'ciano' : 'verde'}>Margem: {pct(m)}</b>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="fi-insight">
              <span><TrendingUp size={17} /> Margem de contribuição de <b>{pct(margemGeral)}</b> calculada sobre {inteiro(resumo.qtd_pedidos)} pedido(s) finalizado(s).</span>
            </div>
          </article>

          <article className="fi-painel fi-top">
            <header>
              <div>
                <h2>Produtos Mais Lucrativos</h2>
                <small>Top 5 por lucro bruto no período</small>
              </div>
              <TrendingUp size={20} className="verde" />
            </header>

            <div className="fi-skus">
              {dados.por_produto.slice(0, 5).map((s, idx) => {
                const m = margemPct(s.vlr_receita, s.vlr_lucro);
                return (
                  <div className="fi-sku" key={s.id_produto}>
                    <span className={`fi-pos ${['verde', 'ciano', '', 'roxo'][idx] ?? ''}`}>{String(idx + 1).padStart(2, '0')}</span>
                    <div><strong>{s.nom_produto}</strong><small>{s.key_produto} • {inteiro(s.qtd_vendida)} un vendidas</small></div>
                    <div className="fi-dir"><b className="mono verde">{pct(m)} Margem</b><small className="mono">Lucro: {brl(s.vlr_lucro)}</small></div>
                  </div>
                );
              })}
              {dados.por_produto.length === 0 && <p className="carregando">Sem vendas no período.</p>}
            </div>
          </article>
        </section>
      )}

      {dados && (
        <>
          <section className="filters-bar">
            <div className="search-field">
              <Search size={16} />
              <input type="text" value={filtros.busca} onChange={mudar('busca')} placeholder="Buscar por nº do pedido ou cliente..." />
            </div>
            <select value={filtros.margem} onChange={mudar('margem')} aria-label="Faixa de margem">
              <option value="">Faixa de margem: todas</option>
              {filtroMargem.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
            </select>
            <button type="button" className="secondary-button" onClick={() => setFiltros(filtrosIniciais)}><RotateCcw size={14} /> Limpar</button>
          </section>

          <section className="dashboard-panel">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Faturamento bruto (PV)</th>
                    <th>Custo itens (CMV)</th>
                    <th className="col-num">Lucro bruto apurado</th>
                    <th>Margem (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map((v) => {
                    const m = margemPct(v.vlr_receita, v.vlr_lucro);
                    const cor = m >= 38 ? 'verde' : m >= 25 ? 'ciano' : 'erro';
                    return (
                      <tr key={v.id_pedido_venda}>
                        <td>
                          <div className="celula-dupla">
                            <span className="fi-ref"><b className="mono verde">#{v.id_pedido_venda}</b></span>
                            <small>{dataBR(v.dat_pedido)}</small>
                          </div>
                        </td>
                        <td><b>{v.nom_cliente}</b></td>
                        <td><span className="mono">{brl(v.vlr_receita)}</span></td>
                        <td><span className="mono mudo">{brl(v.vlr_custo)}</span></td>
                        <td className="col-num">
                          <div className="celula-dupla fi-dir">
                            <span className="mono verde"><b>{v.vlr_lucro >= 0 ? '+' : ''}{brl(v.vlr_lucro)}</b></span>
                            <small className="mono">Markup: {v.vlr_custo > 0 ? `+${pct((v.vlr_lucro / v.vlr_custo) * 100)}` : '—'}</small>
                          </div>
                        </td>
                        <td><span className={`pill fi-pill ${cor}`}><span />{pct(m)} Margem</span></td>
                      </tr>
                    );
                  })}
                  {vendas.length === 0 && (
                    <tr><td colSpan={6} className="vazio">Nenhuma venda finalizada encontrada neste período.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer fi-rodape">
              <span>
                Exibindo <strong>{vendas.length}</strong> de <strong>{dados.vendas.length}</strong> pedidos finalizados •
                Venda total: <strong>{brl(tot.venda)}</strong> • CMV total: {brl(tot.custo)} •{' '}
                <b className="verde">Lucro bruto: {tot.lucro >= 0 ? '+' : ''}{brl(tot.lucro)} (Margem: {pct(tot.margem)})</b>
              </span>
            </div>
          </section>
        </>
      )}

      <Toast toast={toast} />
    </div>
  );
}
