import { pool } from '../config/db.js';
import { like } from '../utils/validacao.js';

const COLUNAS = 'id_produto, nom_produto, key_produto, vlr_venda, vlr_custo_medio, qtd_estoque, qtd_min_estoque, idc_status';

export async function listar({ busca, status, estoqueBaixo }) {
  const filtros = [];
  const params = [];
  if (busca) {
    filtros.push('(nom_produto LIKE ? OR key_produto LIKE ?)');
    params.push(like(busca), like(busca));
  }
  if (status) {
    filtros.push('idc_status = ?');
    params.push(status);
  }
  if (estoqueBaixo) filtros.push("idc_status = 'ATIVO' AND qtd_estoque <= qtd_min_estoque");
  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  const [linhas] = await pool.query(`SELECT ${COLUNAS} FROM produto ${where} ORDER BY nom_produto`, params);
  return linhas;
}

export async function buscarPorId(id, conexao = pool) {
  const [linhas] = await conexao.query(`SELECT ${COLUNAS} FROM produto WHERE id_produto = ?`, [id]);
  return linhas[0] ?? null;
}

// Estoque e custo médio começam zerados: quem os altera são as entradas e os pedidos.
export async function criar(d) {
  const [resultado] = await pool.query(
    'INSERT INTO produto (nom_produto, key_produto, vlr_venda, qtd_min_estoque) VALUES (?, ?, ?, ?)',
    [d.nome, d.sku, d.vlrVenda, d.qtdMin],
  );
  return resultado.insertId;
}

export async function atualizar(id, d) {
  await pool.query(
    `UPDATE produto
        SET nom_produto = ?, key_produto = ?, vlr_venda = ?, qtd_min_estoque = ?, idc_status = COALESCE(?, idc_status)
      WHERE id_produto = ?`,
    [d.nome, d.sku, d.vlrVenda, d.qtdMin, d.status, id],
  );
}

export async function alterarStatus(id, status) {
  await pool.query('UPDATE produto SET idc_status = ? WHERE id_produto = ?', [status, id]);
}

export async function excluir(id) {
  await pool.query('DELETE FROM produto WHERE id_produto = ?', [id]);
}
