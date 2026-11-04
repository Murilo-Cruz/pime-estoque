import { pool } from '../config/db.js';
import * as Emitente from './emitenteModel.js';
import { ErroHttp } from '../utils/erros.js';
import { arred, like } from '../utils/validacao.js';
import { comTransacao } from '../utils/transacao.js';

export async function listar({ status, busca, de, ate }) {
  const filtros = [];
  const params = [];
  if (status) {
    filtros.push('p.idc_status = ?');
    params.push(status);
  }
  if (busca) {
    filtros.push('(c.nom_emitente LIKE ? OR p.id_pedido_venda = ?)');
    params.push(like(busca), Number(busca) || 0);
  }
  if (de) {
    filtros.push('p.dat_pedido >= ?');
    params.push(de);
  }
  if (ate) {
    filtros.push('p.dat_pedido < DATE_ADD(?, INTERVAL 1 DAY)');
    params.push(ate);
  }
  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  const [linhas] = await pool.query(
    `SELECT p.id_pedido_venda, p.dat_pedido, p.idc_status, p.vlr_total, p.id_cliente,
            c.nom_emitente AS nom_cliente, p.id_usuario,
            COUNT(i.id_pedido_vend_item) AS qtd_itens,
            COALESCE(SUM(i.qtd_item * (i.vlr_preco_uni - i.vlr_custo_uni)), 0) AS vlr_lucro
       FROM pedido_venda p
       JOIN emitente c ON c.id_emitente = p.id_cliente
       LEFT JOIN pedido_venda_item i ON i.id_pedido = p.id_pedido_venda
       ${where}
      GROUP BY p.id_pedido_venda, p.dat_pedido, p.idc_status, p.vlr_total, p.id_cliente, c.nom_emitente, p.id_usuario
      ORDER BY p.dat_pedido DESC, p.id_pedido_venda DESC`,
    params,
  );
  return linhas;
}

export async function buscarPorId(id, conexao = pool) {
  const [cabecalho] = await conexao.query(
    `SELECT p.id_pedido_venda, p.dat_pedido, p.idc_status, p.vlr_total, p.id_cliente,
            c.nom_emitente AS nom_cliente, p.id_usuario, u.nom_usuario
       FROM pedido_venda p
       JOIN emitente c ON c.id_emitente = p.id_cliente
       JOIN usuario u ON u.id_usuario = p.id_usuario
      WHERE p.id_pedido_venda = ?`,
    [id],
  );
  if (!cabecalho[0]) return null;
  const [itens] = await conexao.query(
    `SELECT i.id_pedido_vend_item, i.id_produto, pr.nom_produto, pr.key_produto, i.qtd_item,
            i.vlr_preco_uni, i.vlr_custo_uni,
            ROUND(i.qtd_item * i.vlr_preco_uni, 2) AS vlr_subtotal,
            ROUND(i.qtd_item * (i.vlr_preco_uni - i.vlr_custo_uni), 2) AS vlr_lucro
       FROM pedido_venda_item i
       JOIN produto pr ON pr.id_produto = i.id_produto
      WHERE i.id_pedido = ?
      ORDER BY i.id_pedido_vend_item`,
    [id],
  );
  return { ...cabecalho[0], itens };
}

// Valida o cliente e os produtos e monta as linhas do pedido com o preço e o custo do momento.
async function prepararItens(conexao, idCliente, itens) {
  const cliente = await Emitente.buscarPorId(idCliente, conexao);
  if (!cliente) throw new ErroHttp(404, 'Cliente não encontrado.');
  if (cliente.idc_tipo === 'FORNECEDOR') throw new ErroHttp(400, 'O emitente informado não é um cliente.');

  const ids = [...new Set(itens.map((i) => i.idProduto))];
  const [produtos] = await conexao.query(
    'SELECT id_produto, nom_produto, vlr_venda, vlr_custo_medio, idc_status FROM produto WHERE id_produto IN (?)',
    [ids],
  );
  if (produtos.length !== ids.length) throw new ErroHttp(404, 'Um ou mais produtos não foram encontrados.');
  const inativo = produtos.find((p) => p.idc_status !== 'ATIVO');
  if (inativo) throw new ErroHttp(409, `O produto "${inativo.nom_produto}" está inativo.`);

  const porId = new Map(produtos.map((p) => [p.id_produto, p]));
  const linhas = itens.map((item) => {
    const produto = porId.get(item.idProduto);
    return {
      idProduto: item.idProduto,
      qtd: item.qtd,
      preco: item.preco ?? produto.vlr_venda,
      custo: produto.vlr_custo_medio,
    };
  });
  const total = arred(linhas.reduce((soma, l) => soma + arred(l.qtd * l.preco), 0));
  return { linhas, total };
}

async function gravarItens(conexao, idPedido, linhas) {
  await conexao.query(
    'INSERT INTO pedido_venda_item (id_pedido, id_produto, qtd_item, vlr_preco_uni, vlr_custo_uni) VALUES ?',
    [linhas.map((l) => [idPedido, l.idProduto, l.qtd, l.preco, l.custo])],
  );
}

export async function criar({ idCliente, idUsuario, dataHora, itens }) {
  return comTransacao(async (conexao) => {
    const { linhas, total } = await prepararItens(conexao, idCliente, itens);
    const [cab] = await conexao.query(
      `INSERT INTO pedido_venda (id_cliente, id_usuario, dat_pedido, idc_status, vlr_total)
       VALUES (?, ?, IFNULL(?, CURRENT_TIMESTAMP), 'EM_PREPARACAO', ?)`,
      [idCliente, idUsuario, dataHora, total],
    );
    await gravarItens(conexao, cab.insertId, linhas);
    return cab.insertId;
  });
}

// Só pedidos em preparação podem ser alterados.
export async function atualizar(id, { idCliente, dataHora, itens }) {
  return comTransacao(async (conexao) => {
    const [[pedido]] = await conexao.query('SELECT idc_status FROM pedido_venda WHERE id_pedido_venda = ? FOR UPDATE', [id]);
    if (!pedido) throw new ErroHttp(404, 'Pedido não encontrado.');
    if (pedido.idc_status !== 'EM_PREPARACAO') throw new ErroHttp(409, 'Só pedidos em preparação podem ser alterados.');

    const { linhas, total } = await prepararItens(conexao, idCliente, itens);
    await conexao.query('DELETE FROM pedido_venda_item WHERE id_pedido = ?', [id]);
    await gravarItens(conexao, id, linhas);
    await conexao.query(
      'UPDATE pedido_venda SET id_cliente = ?, dat_pedido = IFNULL(?, dat_pedido), vlr_total = ? WHERE id_pedido_venda = ?',
      [idCliente, dataHora, total, id],
    );
    return id;
  });
}

// Confere o estoque, dá baixa e congela o custo de cada item. Tudo ou nada.
export async function finalizar(id) {
  return comTransacao(async (conexao) => {
    const [[pedido]] = await conexao.query('SELECT idc_status FROM pedido_venda WHERE id_pedido_venda = ? FOR UPDATE', [id]);
    if (!pedido) throw new ErroHttp(404, 'Pedido não encontrado.');
    if (pedido.idc_status !== 'EM_PREPARACAO') throw new ErroHttp(409, 'Só pedidos em preparação podem ser finalizados.');

    const [necessario] = await conexao.query(
      'SELECT id_produto, SUM(qtd_item) AS qtd FROM pedido_venda_item WHERE id_pedido = ? GROUP BY id_produto ORDER BY id_produto',
      [id],
    );
    if (necessario.length === 0) throw new ErroHttp(409, 'O pedido não tem itens.');

    const [estoque] = await conexao.query(
      'SELECT id_produto, nom_produto, qtd_estoque FROM produto WHERE id_produto IN (?) ORDER BY id_produto FOR UPDATE',
      [necessario.map((n) => n.id_produto)],
    );
    const saldo = new Map(estoque.map((p) => [p.id_produto, p]));
    const faltas = necessario
      .filter((n) => saldo.get(n.id_produto).qtd_estoque < n.qtd)
      .map((n) => `${saldo.get(n.id_produto).nom_produto} (disponível: ${saldo.get(n.id_produto).qtd_estoque}, no pedido: ${n.qtd})`);
    if (faltas.length > 0) throw new ErroHttp(409, `Estoque insuficiente: ${faltas.join('; ')}.`);

    for (const n of necessario) {
      await conexao.query('UPDATE produto SET qtd_estoque = qtd_estoque - ? WHERE id_produto = ?', [n.qtd, n.id_produto]);
    }
    await conexao.query(
      `UPDATE pedido_venda_item i
         JOIN produto p ON p.id_produto = i.id_produto
          SET i.vlr_custo_uni = p.vlr_custo_medio
        WHERE i.id_pedido = ?`,
      [id],
    );
    await conexao.query("UPDATE pedido_venda SET idc_status = 'FINALIZADO' WHERE id_pedido_venda = ?", [id]);
    return id;
  });
}

export async function cancelar(id) {
  const [resultado] = await pool.query(
    "UPDATE pedido_venda SET idc_status = 'CANCELADO' WHERE id_pedido_venda = ? AND idc_status = 'EM_PREPARACAO'",
    [id],
  );
  if (resultado.affectedRows > 0) return;
  const existe = await buscarPorId(id);
  throw existe
    ? new ErroHttp(409, 'Só pedidos em preparação podem ser cancelados.')
    : new ErroHttp(404, 'Pedido não encontrado.');
}
