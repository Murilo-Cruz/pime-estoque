import { ErroHttp } from './erros.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const vazio = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
const paraNumero = (v) => (typeof v === 'string' && v.trim() !== '' ? Number(v) : v);

export const arred = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export function texto(valor, rotulo, { max, obrigatorio = true } = {}) {
  if (vazio(valor)) {
    if (obrigatorio) throw new ErroHttp(400, `${rotulo}: campo obrigatório.`);
    return null;
  }
  if (typeof valor !== 'string') throw new ErroHttp(400, `${rotulo}: valor inválido.`);
  const limpo = valor.trim();
  if (max && limpo.length > max) throw new ErroHttp(400, `${rotulo}: máximo de ${max} caracteres.`);
  return limpo;
}

export function email(valor, rotulo = 'E-mail', { obrigatorio = false } = {}) {
  const limpo = texto(valor, rotulo, { max: 150, obrigatorio });
  if (limpo && !EMAIL.test(limpo)) throw new ErroHttp(400, `${rotulo}: valor inválido.`);
  return limpo ? limpo.toLowerCase() : null;
}

// Valor monetário (DECIMAL(10,2)) ou decimal em geral
export function numero(valor, rotulo, { min = 0, max = 99999999.99 } = {}) {
  const n = paraNumero(valor);
  if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) {
    throw new ErroHttp(400, `${rotulo}: valor inválido.`);
  }
  return arred(n);
}

export function inteiro(valor, rotulo, { min = 0, max = 2147483647 } = {}) {
  const n = paraNumero(valor);
  if (!Number.isInteger(n) || n < min || n > max) throw new ErroHttp(400, `${rotulo}: valor inválido.`);
  return n;
}

export function opcao(valor, rotulo, lista, { obrigatorio = true } = {}) {
  if (vazio(valor)) {
    if (obrigatorio) throw new ErroHttp(400, `${rotulo}: campo obrigatório.`);
    return null;
  }
  if (!lista.includes(valor)) throw new ErroHttp(400, `${rotulo}: use um destes valores: ${lista.join(', ')}.`);
  return valor;
}

// Data no formato AAAA-MM-DD
export function dataISO(valor, rotulo, { obrigatorio = false } = {}) {
  if (vazio(valor)) {
    if (obrigatorio) throw new ErroHttp(400, `${rotulo}: campo obrigatório.`);
    return null;
  }
  const ok = typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)
    && new Date(`${valor}T00:00:00Z`).toISOString().slice(0, 10) === valor;
  if (!ok) throw new ErroHttp(400, `${rotulo}: use o formato AAAA-MM-DD.`);
  return valor;
}

// Um :id de rota (inteiro positivo)
export function idDaRota(valor) {
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 1) throw new ErroHttp(400, 'ID inválido.');
  return n;
}

// Parâmetro de query (?busca=...) como texto simples
export const paramTexto = (v) => (typeof v === 'string' ? v.trim() : '');

// Prepara um termo para LIKE sem deixar o usuário usar % e _ como curingas
export const like = (termo) => `%${termo.replace(/[\\%_]/g, '\\$&')}%`;

// Data/hora de gravação: se vier só a data, usa meio-dia; senão o banco usa o momento atual
export const dataHora = (dataIso) => (dataIso ? `${dataIso} 12:00:00` : null);
