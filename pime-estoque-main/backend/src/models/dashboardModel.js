import { pool } from '../config/db.js';

export async function indicadores() {
  const [[produtos]] = await pool.query(
    `SELECT COUNT(*) AS produtos_ativos,
            COALESCE(SUM(qtd_estoque <= qtd_min_estoque), 0) AS estoque_baixo,
            COALESCE(SUM(qtd_estoque * vlr_custo_medio), 0) AS vlr_estoque
       FROM produto WHERE idc_status = 'ATIVO'`,
  );
  const [[pendentes]] = await pool.query("SELECT COUNT(*) AS pedidos_pendentes FROM pedido_venda WHERE idc_status = 'EM_PREPARACAO'");
  const [[entradas]] = await pool.query(
    `SELECT COUNT(*) AS entradas_mes FROM estoque_entrada
      WHERE dat_entrada >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')`,
  );
  const [[vendas]] = await pool.query(
    `SELECT COUNT(DISTINCT p.id_pedido_venda) AS vendas_mes,
            COALESCE(SUM(i.qtd_item), 0) AS qtd_saidas_mes,
            COALESCE(SUM(i.qtd_item * i.vlr_preco_uni), 0) AS vlr_receita_mes,
            COALESCE(SUM(i.qtd_item * (i.vlr_preco_uni - i.vlr_custo_uni)), 0) AS vlr_lucro_mes
       FROM pedido_venda p
       JOIN pedido_venda_item i ON i.id_pedido = p.id_pedido_venda
      WHERE p.idc_status = 'FINALIZADO' AND p.dat_pedido >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')`,
  );
  return {
    produtos_ativos: produtos.produtos_ativos,
    estoque_baixo: Number(produtos.estoque_baixo),
    vlr_estoque: produtos.vlr_estoque,
    pedidos_pendentes: pendentes.pedidos_pendentes,
    entradas_mes: entradas.entradas_mes,
    ...vendas,
  };
}

// Últimas entradas e vendas finalizadas, misturadas por data
export async function movimentacoes(limite = 10) {
  const [linhas] = await pool.query(
    `(SELECT 'ENTRADA' AS idc_tipo, e.id_estoque_entrada AS id, e.dat_entrada AS dat_movimento,
             f.nom_emitente AS nom_parceiro,
             COALESCE(SUM(i.qtd_item), 0) AS qtd_unidades,
             COALESCE(SUM(i.qtd_item * i.vlr_uni), 0) AS vlr_total
        FROM estoque_entrada e
        JOIN emitente f ON f.id_emitente = e.id_fornecedor
        LEFT JOIN item_estoque_entrada i ON i.id_estoque_entrada = e.id_estoque_entrada
       GROUP BY e.id_estoque_entrada, e.dat_entrada, f.nom_emitente)
     UNION ALL
     (SELECT 'VENDA', p.id_pedido_venda, p.dat_pedido, c.nom_emitente,
             COALESCE(SUM(i.qtd_item), 0), COALESCE(SUM(i.qtd_item * i.vlr_preco_uni), 0)
        FROM pedido_venda p
        JOIN emitente c ON c.id_emitente = p.id_cliente
        JOIN pedido_venda_item i ON i.id_pedido = p.id_pedido_venda
       WHERE p.idc_status = 'FINALIZADO'
       GROUP BY p.id_pedido_venda, p.dat_pedido, c.nom_emitente)
     ORDER BY dat_movimento DESC
     LIMIT ?`,
    [limite],
  );
  return linhas;
}

export async function produtosEstoqueBaixo(limite = 5) {
  const [linhas] = await pool.query(
    `SELECT id_produto, nom_produto, key_produto, qtd_estoque, qtd_min_estoque
       FROM produto
      WHERE idc_status = 'ATIVO' AND qtd_estoque <= qtd_min_estoque
      ORDER BY (qtd_estoque - qtd_min_estoque), nom_produto
      LIMIT ?`,
    [limite],
  );
  return linhas;
}
