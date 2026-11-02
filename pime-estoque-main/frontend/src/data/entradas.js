import { Boxes, Truck, CircleDollarSign, ClipboardCheck, CloudDownload, ScanBarcode, Scale, Layers } from 'lucide-react';

// Dados ilustrativos. Troque por chamadas à API quando o backend tiver /entradas.
export const entradasIniciais = [
  { id: 'ENT-8492', nf: '004.912', serie: '1', data: '14/10/2024', hora: '14:32:08', fornecedor: 'Schneider Electric Brasil', cnpj: '82.381.129/0001-44', cd: 'CD Barueri', doca: 'Doca 04 (Paletes)', qtd: 450, skus: 4, valor: 114320, icms: 13718.4, status: 'lancado' },
  { id: 'ENT-8491', nf: '089.410', serie: '2', data: '14/10/2024', hora: '11:15:40', fornecedor: 'Siemens Automação Ind.', cnpj: '54.109.822/0004-90', cd: 'CD Curitiba', doca: 'Doca 02 (Crossdock)', qtd: 120, skus: 2, valor: 88540, icms: 10624.8, status: 'conferencia' },
  { id: 'ENT-8490', nf: '001.388', serie: '1', data: '13/10/2024', hora: '16:50:11', fornecedor: 'WEG Equipamentos Elétricos', cnpj: '07.175.725/0001-63', cd: 'CD Betim', doca: 'Doca 01 (Quarentena)', qtd: 380, skus: 3, valor: 64200, icms: 0, status: 'divergencia', divergencia: 20 },
  { id: 'ENT-8489', nf: '012.774', serie: '1', data: '13/10/2024', hora: '09:22:15', fornecedor: 'Danfoss Sensores do Brasil', cnpj: '49.332.901/0002-18', cd: 'CD Barueri', doca: 'Doca 03 (Estantes A)', qtd: 890, skus: 6, valor: 117890, icms: 14146.8, status: 'lancado' },
];

export const statusEntrada = {
  lancado: { rotulo: 'Lançado no Saldo', filtro: 'Lançado no Saldo', cor: 'verde' },
  conferencia: { rotulo: 'Em Conferência', filtro: 'Em Conferência', cor: 'ciano' },
  divergencia: { rotulo: 'Divergência Fiscal', filtro: 'Divergência Fiscal/Qtd', cor: 'erro' },
  aguardando: { rotulo: 'Aguardando Descarga', filtro: 'Aguardando Descarga', cor: 'roxo' },
};

export const filtrosStatus = Object.entries(statusEntrada).map(([valor, s]) => [valor, s.filtro]);

export const centros = [
  ['CD Barueri', 'CD-01 Barueri (SP)'],
  ['CD Curitiba', 'CD-02 Curitiba (PR)'],
  ['CD Betim', 'CD-03 Betim (MG)'],
];

export const fornecedoresEntrada = [
  { nome: 'Schneider Electric Brasil', cnpj: '82.381.129/0001-44' },
  { nome: 'Siemens Automação Ind.', cnpj: '54.109.822/0004-90' },
  { nome: 'WEG Equipamentos Elétricos', cnpj: '07.175.725/0001-63' },
  { nome: 'Danfoss Sensores do Brasil', cnpj: '49.332.901/0002-18' },
];

export const kpisEntrada = [
  {
    titulo: 'Volume recebido hoje',
    valor: '1.840',
    unidade: 'unidades',
    badge: '+18,4%',
    detalhe: 'vs ontem (Doca 1 a 4)',
    icone: Boxes,
    cor: 'green',
    barra: 78
  },
  {
    titulo: 'Valor líquido inbound',
    valor: 'R$ 384.950,00',
    detalhe: 'Ticket médio por entrada: R$ 42.100,00',
    icone: CircleDollarSign,
    cor: 'green',
    barra: 62,
    pequeno: true
  },
];

export const esteira = [
  { etapa: '01. INBOUND & XML', titulo: 'Triagem e Validação DANFE', texto: 'Assinatura digital SEFAZ e validação do CNPJ emitente no cadastro homologado.', icone: CloudDownload, cor: 'verde' },
  { etapa: '02. CONFERÊNCIA CEGA', titulo: 'Leitura dos SKUs na Doca', texto: 'Operador aponta coletor sem saber a quantidade esperada, blindando contra extravios.', icone: ScanBarcode, cor: 'ciano' },
  { etapa: '03. AUDITORIA FISCAL', titulo: 'Consistência Contábil', texto: 'Cruzamento das quantidades físicas apuradas com os itens da nota fiscal eletrônica.', icone: Scale, cor: 'roxo' },
  { etapa: '04. ALOCAÇÃO & SALDO', titulo: 'Put-away & Custo Médio', texto: 'Incremento imediato de saldo físico no CD e recálculo automático do custo médio contábil.', icone: Layers, cor: 'verde' },
];

export const brl = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });