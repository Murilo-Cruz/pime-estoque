import { pool } from '../config/db.js';

// Só pedidos FINALIZADOS entram no financeiro. O período usa a data do pedido (de/ate inclusivos).
const PERIODO = "p.idc_status = 'FINALIZADO' AND p.dat_pedido >= ? AND p.dat_pedido < DATE_ADD(?, INTERVAL 1 DAY)";

export async function resumo(de, ate) {
  const [[linha]] = await pool.query(
    `SELECT COUNT(DISTINCT p.id_pedido_venda) AS qtd_pedidos,
            COALESCE(SUM(i.qtd_item * i.vlr_preco_uni), 0) AS vlr_receita,
            COALESCE(SUM(i.qtd_item * i.vlr_custo_uni), 0) AS vlr_custo,
            COALESCE(SUM(i.qtd_item * (i.vlr_preco_uni - i.vlr_custo_uni)), 0) AS vlr_lucro
       FROM pedido_venda p
       JOIN pedido_venda_item i ON i.id_pedido = p.id_pedido_venda
      WHERE ${PERIODO}`,
    [de, ate],
  );
  return linha;
}

export async function vendas(de, ate) {
  const [linhas] = await pool.query(
    `SELECT p.id_pedido_venda, p.dat_pedido, c.nom_emitente AS nom_cliente,
            COALESCE(SUM(i.qtd_item * i.vlr_preco_uni), 0) AS vlr_receita,
            COALESCE(SUM(i.qtd_item * i.vlr_custo_uni), 0) AS vlr_custo,
            COALESCE(SUM(i.qtd_item * (i.vlr_preco_uni - i.vlr_custo_uni)), 0) AS vlr_lucro
       FROM pedido_venda p
       JOIN emitente c ON c.id_emitente = p.id_cliente
       JOIN pedido_venda_item i ON i.id_pedido = p.id_pedido_venda
      WHERE ${PERIODO}
      GROUP BY p.id_pedido_venda, p.dat_pedido, c.nom_emitente
      ORDER BY p.dat_pedido DESC, p.id_pedido_venda DESC`,
    [de, ate],
  );
  return linhas;
}

export async function porProduto(de, ate) {
  const [linhas] = await pool.query(
    `SELECT pr.id_produto, pr.nom_produto, pr.key_produto,
            SUM(i.qtd_item) AS qtd_vendida,
            SUM(i.qtd_item * i.vlr_preco_uni) AS vlr_receita,
            SUM(i.qtd_item * i.vlr_custo_uni) AS vlr_custo,
            SUM(i.qtd_item * (i.vlr_preco_uni - i.vlr_custo_uni)) AS vlr_lucro
       FROM pedido_venda p
       JOIN pedido_venda_item i ON i.id_pedido = p.id_pedido_venda
       JOIN produto pr ON pr.id_produto = i.id_produto
      WHERE ${PERIODO}
      GROUP BY pr.id_produto, pr.nom_produto, pr.key_produto
      ORDER BY vlr_lucro DESC
      LIMIT 10`,
    [de, ate],
  );
  return linhas;
}

export async function porDia(de, ate) {
  const [linhas] = await pool.query(
    `SELECT DATE(p.dat_pedido) AS dat_dia,
            SUM(i.qtd_item * i.vlr_preco_uni) AS vlr_receita,
            SUM(i.qtd_item * (i.vlr_preco_uni - i.vlr_custo_uni)) AS vlr_lucro
       FROM pedido_venda p
       JOIN pedido_venda_item i ON i.id_pedido = p.id_pedido_venda
      WHERE ${PERIODO}
      GROUP BY DATE(p.dat_pedido)
      ORDER BY dat_dia`,
    [de, ate],
  );
  return linhas;
}
