import { Banknote, Boxes, ChartLine, Wallet } from 'lucide-react';

// Dados ilustrativos. Troque por chamadas à API quando o backend tiver /financeiro.
export const lancamentosIniciais = [
  { id: 'PV-9104', nf: '4819', cliente: 'Votorantim Cimentos S.A.', mix: '100t Cimento CP-IV', canal: 'b2b', cnpj: '01.637.892/0001-44', venda: 48750, custo: 29800, unitVenda: 'R$ 487,50/t', unitCusto: 'R$ 298,00/t', status: 'aberto' },
  { id: 'PV-9103', nf: '4820', cliente: 'TechLog Distribuidora Brasil', mix: '12 Paletes Embalagem SCM', canal: 'b2b', cnpj: '33.109.442/0002-81', venda: 17840, custo: 10320, unitVenda: 'R$ 1.486,67', unitCusto: 'R$ 860,00', status: 'faturado' },
  { id: 'PV-9101', nf: '4821', cliente: 'Suzano Papel e Celulose S.A.', mix: '96 Bobinas Papel Kraft', canal: 'gov', cnpj: '16.402.190/0001-12', venda: 82400, custo: 51200, unitVenda: 'R$ 858,33', unitCusto: 'R$ 533,33', status: 'faturamento' },
  { id: 'PV-9098', nf: '4822', cliente: 'Siemens Automação Ind.', mix: '38 Sensores Ópticos & Relés', canal: 'b2b', cnpj: '44.009.281/0001-09', venda: 64300, custo: 37600, unitVenda: 'R$ 1.692,10', unitCusto: 'R$ 989,47', status: 'faturado' },
  { id: 'PV-9095', nf: '4823', cliente: 'Schneider Electric Brasil', mix: '50 Disjuntores Modulares', canal: 'direto', cnpj: '52.810.923/0001-90', venda: 44500, custo: 31800, unitVenda: 'R$ 890,00', unitCusto: 'R$ 636,00', status: 'aberto' },
];

export const canais = { b2b: 'Canal B2B', gov: 'Industrial', direto: 'Faturamento Direto' };
export const filtroCanais = [['b2b', 'Vendas Corporativas B2B'], ['gov', 'Contratos Industriais'], ['direto', 'Faturamento Direto']];
export const statusLanc = {
  faturado: 'Faturado & Liquidado',
  aberto: 'Aguardando Quitação',
  faturamento: 'Em Faturamento',
};
export const filtroMargem = [
  ['high', 'Margem Alta (> 38%)'],
  ['mid', 'Margem Média (25% a 38%)'],
  ['low', 'Margem Apertada (< 25%)'],
];
export const periodos = [
  ['today', 'Hoje'], ['7d', 'Últimos 7 dias'], ['month', 'Este Mês (Maio/2025)'],
  ['quarter', '2º Trimestre / 2025'], ['custom', 'Período Personalizado'],
];

export const MARGEM_MINIMA = 22;

export const kpisFin = [
  { titulo: 'Receita bruta de vendas', valor: 'R$ 845.620,00', icone: Banknote, cor: 'cyan', badge: '+14,8% vs período ant.', nota: '184 pedidos faturados', rodape: ['Preço médio por pedido:', 'R$ 4.595,76', 'ciano'] },
  { titulo: 'Custo mercadorias (CMV/CPV)', valor: 'R$ 512.180,00', icone: Boxes, cor: 'neutro', badge: '60,6% do faturamento', nota: 'Custo médio ponderado', rodape: ['Custo reposição vs aquisição:', '-1,8% economia', 'verde'] },
  { titulo: 'Lucro bruto consolidado', valor: '+R$ 333.440,00', icone: ChartLine, cor: 'green', destaque: true, badge: 'Margem bruta: 39,4%', nota: 'Spread positivo', rodape: ['Meta trimestral (38,0%):', '+1,4 p.p. acima da meta', 'verde'] },
  { titulo: 'Markup & liquidez caixa', valor: '+65,1% Markup', icone: Wallet, cor: 'purple', badge: 'R$ 1.842.350 saldo', nota: '4 contas ativas', rodape: ['ROI médio sobre aquisições:', '1,65x retorno', 'ciano'] },
];

// Valores em milhares de reais
export const series = {
  diario: [
    { rotulo: 'Seg 12/05', venda: 31, cmv: 19 }, { rotulo: 'Ter 13/05', venda: 42, cmv: 25 }, { rotulo: 'Qua 14/05', venda: 38, cmv: 23 },
    { rotulo: 'Qui 15/05', venda: 46, cmv: 27 }, { rotulo: 'Sex 16/05 (Proj.)', venda: 40, cmv: 24, proj: true },
  ],
  semanal: [
    { rotulo: 'Sem 21 (18-24 Mai)', venda: 160, cmv: 98 }, { rotulo: 'Sem 22 (25-31 Mai)', venda: 195, cmv: 115 },
    { rotulo: 'Sem 23 (01-07 Jun)', venda: 140, cmv: 88 }, { rotulo: 'Sem 24 (08-14 Jun)', venda: 215, cmv: 128 },
    { rotulo: 'Sem 25 (Proj.)', venda: 175, cmv: 105, proj: true },
  ],
  mensal: [
    { rotulo: 'Jan/25', venda: 610, cmv: 372 }, { rotulo: 'Fev/25', venda: 680, cmv: 415 }, { rotulo: 'Mar/25', venda: 742, cmv: 452 },
    { rotulo: 'Abr/25', venda: 790, cmv: 478 }, { rotulo: 'Mai/25 (Proj.)', venda: 846, cmv: 512, proj: true },
  ],
};

export const topSkus = [
  { pos: '01', nome: 'Módulos CLP S7-1500', info: 'PV: R$ 4.850 • Custo: R$ 2.810', margem: '+42,1% Margem', lucro: 'Lucro: +R$ 2.040/un', cor: 'verde' },
  { pos: '02', nome: 'Disjuntor Schneider 630A', info: 'PV: R$ 1.980 • Custo: R$ 1.190', margem: '+39,9% Margem', lucro: 'Lucro: +R$ 790/un', cor: 'ciano' },
  { pos: '03', nome: 'Bobinas Kraft 450g/m²', info: 'PV: R$ 820 • Custo: R$ 515', margem: '+37,2% Margem', lucro: 'Lucro: +R$ 305/un', cor: '' },
  { pos: '04', nome: 'Cimento CP-IV a Granel', info: 'PV: R$ 487/t • Custo: R$ 326/t', margem: '+33,1% Margem', lucro: 'Lucro: +R$ 161/t', cor: 'roxo' },
];

// ---------- helpers ----------
export const brl = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const lucro = (l) => l.venda - l.custo;
export const margemPct = (l) => (l.venda > 0 ? ((l.venda - l.custo) / l.venda) * 100 : 0);
export const markupPct = (l) => (l.custo > 0 ? ((l.venda - l.custo) / l.custo) * 100 : 0);
export const faixa = (l) => { const m = margemPct(l); return m > 38 ? 'high' : m >= 25 ? 'mid' : 'low'; };
export const pct = (n) => `${n.toFixed(1).replace('.', ',')}%`;