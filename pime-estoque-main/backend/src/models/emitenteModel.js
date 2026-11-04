import { pool } from '../config/db.js';
import { like } from '../utils/validacao.js';

const COLUNAS = 'id_emitente, nom_emitente, des_documento, des_telefone, des_email, idc_tipo';

// tipo = 'CLIENTE' traz CLIENTE e AMBOS; tipo = 'FORNECEDOR' traz FORNECEDOR e AMBOS
export async function listar({ tipo, busca }) {
  const filtros = [];
  const params = [];
  if (tipo === 'CLIENTE') filtros.push("idc_tipo IN ('CLIENTE', 'AMBOS')");
  if (tipo === 'FORNECEDOR') filtros.push("idc_tipo IN ('FORNECEDOR', 'AMBOS')");
  if (busca) {
    filtros.push('(nom_emitente LIKE ? OR des_documento LIKE ?)');
    params.push(like(busca), like(busca));
  }
  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  const [linhas] = await pool.query(`SELECT ${COLUNAS} FROM emitente ${where} ORDER BY nom_emitente`, params);
  return linhas;
}

export async function buscarPorId(id, conexao = pool) {
  const [linhas] = await conexao.query(`SELECT ${COLUNAS} FROM emitente WHERE id_emitente = ?`, [id]);
  return linhas[0] ?? null;
}

export async function criar(d) {
  const [resultado] = await pool.query(
    'INSERT INTO emitente (nom_emitente, des_documento, des_telefone, des_email, idc_tipo) VALUES (?, ?, ?, ?, ?)',
    [d.nome, d.documento, d.telefone, d.email, d.tipo],
  );
  return resultado.insertId;
}

export async function atualizar(id, d) {
  await pool.query(
    'UPDATE emitente SET nom_emitente = ?, des_documento = ?, des_telefone = ?, des_email = ?, idc_tipo = ? WHERE id_emitente = ?',
    [d.nome, d.documento, d.telefone, d.email, d.tipo, id],
  );
}

export async function contarUso(id) {
  const [[uso]] = await pool.query(
    `SELECT (SELECT COUNT(*) FROM pedido_venda WHERE id_cliente = ?) AS pedidos,
            (SELECT COUNT(*) FROM estoque_entrada WHERE id_fornecedor = ?) AS entradas`,
    [id, id],
  );
  return uso;
}

export async function excluir(id) {
  await pool.query('DELETE FROM emitente WHERE id_emitente = ?', [id]);
}
