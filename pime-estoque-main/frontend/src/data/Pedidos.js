import { Building2, Store, Truck, ShoppingBag, Lock, Clock, Warehouse, TriangleAlert } from 'lucide-react';

// Dados ilustrativos. Troque por chamadas à API quando o backend tiver /pedidos.
export const pedidosIniciais = [
  { id: 'PV-9104', canal: 'B2B', cliente: 'Votorantim Cimentos S.A.', cnpj: '01.838.723/0001-27', credito: 'AAA', emissao: '14/05/2025 09:12', previsao: 'Prev: 16/05 (D+2)', skus: 6, volumes: '320 un', embalagem: 'Paletizado (12 pallets)', valor: 48750, pagamento: 'Boleto Faturado 30D', statusCom: 'FATURADO', statusEst: 'BAIXADO', estoqueTexto: 'Baixa Concluída - CD Barueri', nfe: true },
  { id: 'PV-9103', canal: 'ML', cliente: 'TechLog Distribuidora Brasil Ltda', cnpj: '14.922.019/0002-88', credito: 'AA', emissao: '14/05/2025 10:44', previsao: 'Prev: Hoje 17:00 (SLA Express)', skus: 3, volumes: '85 volumes', embalagem: 'Box Expedição #04', valor: 17840, pagamento: 'Mercado Pago Gateway', statusCom: 'SEPARACAO', statusEst: 'RESERVADO', estoqueTexto: 'Reserva Ativa - CD Extrema', api: true },
  { id: 'PV-9102', canal: 'AMAZON', cliente: 'Amazon Serviços de Varejo do Brasil', cnpj: '15.436.940/0001-03', credito: 'AAA', emissao: '14/05/2025 08:30', previsao: 'Bloqueado p/ Ruptura', previsaoErro: true, skus: 2, volumes: '150 un', embalagem: 'Faltam 18 un (SKU-7729)', embalagemErro: true, valor: 134850, pagamento: 'Transferência Bancária', statusCom: 'RUPTURA', statusEst: 'RUPTURA', estoqueTexto: 'Alerta: 1 SKU sem Saldo', erro: true },
  { id: 'PV-9101', canal: 'B2B', cliente: 'Suzano Papel e Celulose S.A.', cnpj: '16.404.287/0001-55', credito: 'AAA', emissao: '14/05/2025 07:15', previsao: 'Prev: 18/05 (D+4)', skus: 4, volumes: '210 un', embalagem: 'Carga Fechada (FTL)', valor: 82400, pagamento: 'Boleto 30/60/90 Dias', statusCom: 'APROVADO', statusEst: 'RESERVADO', estoqueTexto: 'Reserva Ativa - CD Barueri' },
  { id: 'PV-9100', canal: 'DTC', cliente: 'EletroMetal Componentes Industriais', cnpj: '07.112.544/0001-90', credito: 'B+', emissao: '13/05/2025 18:40', previsao: 'Aguardando Aprovação Financeira', skus: 1, volumes: '12 un', embalagem: 'Caixa Padrão Correios', valor: 14560, pagamento: 'Cartão Corporativo', statusCom: 'PENDENTE', statusEst: 'PROVISORIA', estoqueTexto: 'Reserva Provisória (24h)' },
];

export const canais = {
  B2B: { rotulo: 'B2B Corporativo Direto', icone: Building2 },
  ML: { rotulo: 'Mercado Livre Full', icone: Store },
  AMAZON: { rotulo: 'Amazon FBA Inbound', icone: Truck },
  DTC: { rotulo: 'E-commerce Próprio (D2C)', icone: ShoppingBag },
};

export const filtroCanais = [
  ['B2B', 'B2B Corporativo Direto'],
  ['ML', 'Mercado Livre Full'],
  ['AMAZON', 'Amazon FBA Fulfillment'],
  ['DTC', 'E-commerce Próprio (D2C)'],
];

export const statusComercial = {
  FATURADO: { rotulo: 'Faturado / NF Emitida', cor: 'verde' },
  SEPARACAO: { rotulo: 'Em Separação / Picking', cor: 'ciano', pulso: true },
  APROVADO: { rotulo: 'Aprovado Comercial', cor: 'neutro' },
  PENDENTE: { rotulo: 'Pendente Crédito', cor: 'roxo' },
  CANCELADO: { rotulo: 'Cancelado', cor: 'mudo' },
  RUPTURA: { rotulo: 'Alerta de Ruptura Multi-CD', cor: 'erro' },
};

export const filtroStatusComercial = [
  ['FATURADO', 'Faturado / NF Emitida'],
  ['SEPARACAO', 'Em Separação'],
  ['APROVADO', 'Aprovado Comercial'],
  ['PENDENTE', 'Pendente Crédito'],
  ['CANCELADO', 'Cancelado'],
];

export const statusEstoque = {
  BAIXADO: { cor: 'verde', icone: Warehouse },
  RESERVADO: { cor: 'ciano', icone: Lock },
  RUPTURA: { cor: 'erro', icone: TriangleAlert },
  PROVISORIA: { cor: 'mudo', icone: Clock },
  LIBERADO: { cor: 'mudo', icone: Warehouse },
};

export const filtroStatusEstoque = [
  ['BAIXADO', 'Baixa Concluída Multi-CD'],
  ['RESERVADO', 'Reserva Ativa'],
  ['RUPTURA', 'Risco / Ruptura Parcial'],
];

export const clientes = [
  { chave: 'VOTORANTIM', nome: 'Votorantim Cimentos S.A.', cnpj: '01.838.723/0001-27', credito: 'AAA' },
  { chave: 'SUZANO', nome: 'Suzano Papel e Celulose S.A.', cnpj: '16.404.287/0001-55', credito: 'AAA' },
  { chave: 'TECHLOG', nome: 'TechLog Distribuidora Brasil Ltda', cnpj: '14.922.019/0002-88', credito: 'AA' },
  { chave: 'AMAZON', nome: 'Amazon Serviços de Varejo do Brasil', cnpj: '15.436.940/0001-03', credito: 'AAA' },
  { chave: 'ELETROMETAL', nome: 'EletroMetal Componentes Industriais', cnpj: '07.112.544/0001-90', credito: 'B+' },
];

export const centrosVenda = [
  ['CD01', 'CD-01 Barueri / SP (Principal)'],
  ['CD02', 'CD-02 Extrema / MG (Fiscal)'],
  ['CD03', 'CD-03 Navegantes / SC (Inbound)'],
];

export const kpisPedido = [
  { titulo: 'Pedidos emitidos hoje', valor: '142', unidade: 'pedidos', linha: 'R$ 298.400,00 faturados', badge: 'Conv. 94,2%', nota: 'Meta: 150/dia', cor: 'green' },
  { titulo: 'Em separação / picking', valor: '28', unidade: 'na esteira CD', linha: 'Tempo médio: 16 min / pedido', badge: 'SLA on-time 98,4%', nota: '3 CDs operando', cor: 'cyan' },
  { titulo: 'Risco de ruptura / bloqueados', valor: '04', unidade: 'pedidos retidos', linha: 'Saldo insuficiente p/ atendimento total', badge: 'Reposição CD-02 pendente', nota: 'R$ 38.640,00', cor: 'red' },
  { titulo: 'Ticket médio faturado', valor: 'R$ 2.101,40', linha: '+6,2% vs semana anterior', badge: 'B2B Indústria liderando', nota: 'LTV projetado ↑', cor: 'purple' },
];

export const brl = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });