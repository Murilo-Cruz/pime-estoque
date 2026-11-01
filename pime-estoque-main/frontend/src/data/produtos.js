import { Boxes, Warehouse, TriangleAlert, Wallet, Sun, Radar, Gauge, Cable, Spline } from 'lucide-react';

// Dados ilustrativos. Troque por chamadas à API quando o backend tiver /produtos.
export const produtosIniciais = [
  { sku: 'SKU-7729-X', ean: '7898950123981', nome: 'Controlador de Carga MPPT 60A Pro', marca: 'Nexus Energy', unidade: 'UN', categoria: 'controladores', ncm: '8504.40.10', origem: '0 - Nac.', custo: 540, venda: 899, minimo: 50, maximo: 300, saldo: 4, cd: 'cd01', local: 'Rua B-04-P02', ativo: true },
  { sku: 'SKU-4102-B', ean: '7898950124412', nome: 'Sensor Óptico de Automação Industrial', marca: 'OptiWave Tech', unidade: 'PC', categoria: 'sensores', ncm: '9031.80.99', origem: '1 - Imp.', custo: 112.5, venda: 245, minimo: 120, maximo: 600, saldo: 12, cd: 'cd02', local: 'Rua A-12-P01', ativo: true },
  { sku: 'SKU-9931-K', ean: '7898950129931', nome: 'Módulo Inversor Trifásico 380V Industrial', marca: 'Nexus Heavy', unidade: 'UN', categoria: 'inversores', ncm: '8504.40.90', origem: '0 - Nac.', custo: 3890, venda: 6250, minimo: 80, maximo: 400, saldo: 0, cd: 'cd01', local: 'Rua E-01-P05', ativo: true },
  { sku: 'SKU-5510-A', ean: '7898950125510', nome: 'Conector Blindado IP67 Série Gold', marca: 'Amphenol / Nexus', unidade: 'CX', categoria: 'conectores', ncm: '8536.69.90', origem: '2 - Estr.', custo: 14.8, venda: 38.5, minimo: 500, maximo: 3000, saldo: 1840, cd: 'cd03', local: 'Rua C-08-P04', ativo: true },
  { sku: 'SKU-1204-C', ean: '7898950121204', nome: 'Cabo Solar Fotovoltaico 6mm² Preto 100m', marca: 'Prysmian Condutores', unidade: 'RL', categoria: 'cabeamento', ncm: '8544.49.00', origem: '0 - Nac.', custo: 295, venda: 480, minimo: 100, maximo: 250, saldo: 320, cd: 'cd01', local: 'Rua D-02-P01', ativo: true },
];

export const categorias = [
  { valor: 'controladores', rotulo: 'Controladores', icone: Sun },
  { valor: 'sensores', rotulo: 'Sensores', icone: Radar },
  { valor: 'conectores', rotulo: 'Conectores', icone: Cable },
  { valor: 'inversores', rotulo: 'Inversores', icone: Gauge },
  { valor: 'cabeamento', rotulo: 'Cabeamento', icone: Spline },
];

export const armazens = [
  { valor: 'cd01', rotulo: 'CD-01 Barueri (SP)' },
  { valor: 'cd02', rotulo: 'CD-02 Curitiba (PR)' },
  { valor: 'cd03', rotulo: 'CD-03 Betim (MG)' },
];

export const unidades = [
  ['UN', 'UN - Unidade'],
  ['CX', 'CX - Caixa'],
  ['KG', 'KG - Quilograma'],
  ['PC', 'PC - Peça'],
  ['RL', 'RL - Rolo'],
];

export const niveis = [
  ['normal', 'Normal / Saudável'],
  ['baixo', 'Abaixo do Mínimo'],
  ['ruptura', 'Ruptura (Saldo Zero)'],
  ['excesso', 'Excesso de Estoque'],
];

export const kpis = [
  { titulo: 'Total SKUs cadastrados', valor: '14.250', badge: '+142 este mês', detalhe: '99,1% ativos', icone: Boxes, cor: 'cyan' },
  { titulo: 'Saldo físico global', valor: '382.410', badge: 'Cap. 74%', detalhe: '3 centros de distribuição', icone: Warehouse, cor: 'green' },
  { titulo: 'Alerta crítico / ruptura', valor: '8', badge: 'Ruptura imediata', detalhe: '2 POs em trânsito', icone: TriangleAlert, cor: 'red' },
  { titulo: 'Avaliação contábil (custo)', valor: 'R$ 2,45M', badge: 'Markup 44,8%', detalhe: 'WAC atualizado', icone: Wallet, cor: 'cyan' },
];

export const distribuicaoCd = [
  { rotulo: 'CD-01 Barueri (SP)', qtd: '210.450 un', pct: 55, cor: 'verde' },
  { rotulo: 'CD-02 Curitiba (PR)', qtd: '114.720 un', pct: 30, cor: 'ciano' },
  { rotulo: 'CD-03 Betim (MG)', qtd: '57.240 un', pct: 15, cor: 'roxo' },
];

// ---------- helpers ----------
export const brl = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const margem = (p) => (p.venda > 0 ? ((p.venda - p.custo) / p.venda) * 100 : 0);

export function nivelEstoque(p) {
  if (p.saldo <= 0) return 'ruptura';
  if (p.saldo < p.minimo) return 'baixo';
  if (p.maximo && p.saldo > p.maximo) return 'excesso';
  return 'normal';
}

export const rotuloNivel = {
  normal: 'Saudável',
  baixo: 'Estoque Baixo',
  ruptura: 'Ruptura Total',
  excesso: 'Excesso',
};