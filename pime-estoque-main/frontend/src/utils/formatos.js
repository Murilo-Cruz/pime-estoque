export const brl = (n) => Number(n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const inteiro = (n) => Number(n ?? 0).toLocaleString('pt-BR');

export const pct = (n) => `${Number(n ?? 0).toFixed(1).replace('.', ',')}%`;

// "2026-11-06 14:32:08" -> "06/11/2026"
export function dataBR(valor) {
  if (!valor) return '—';
  const [ano, mes, dia] = String(valor).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

// "2026-11-06 14:32:08" -> "14:32"
export const horaBR = (valor) => (valor ? String(valor).slice(11, 16) : '');

export const hojeISO = () => new Date().toLocaleDateString('sv-SE');

export function somarDias(iso, dias) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return d.toLocaleDateString('sv-SE');
}

export const codigo = (prefixo, id) => `${prefixo}-${String(id).padStart(4, '0')}`;

export const margemPct = (receita, lucro) => (receita > 0 ? (lucro / receita) * 100 : 0);
