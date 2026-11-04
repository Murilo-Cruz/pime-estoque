import { pool } from '../config/db.js';
import * as Emitente from './emitenteModel.js';
import { ErroHttp } from '../utils/erros.js';
import { arred } from '../utils/validacao.js';
import { comTransacao } from '../utils/transacao.js';

export async function listar({ de, ate }) {
  const filtros = [];
  const params = [];
  if (de) {
    filtros.push('e.dat_entrada >= ?');
    params.push(de);
  }
  if (ate) {
    filtros.push('e.dat_entrada < DATE_ADD(?, INTERVAL 1 DAY)');
    params.push(ate);
  }
  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  const [linhas] = await pool.query(
    `SELECT e.id_estoque_entrada, e.dat_entrada, e.id_fornecedor, f.nom_emitente AS nom_fornecedor,
            e.id_usuario, u.nom_usuario,
            COUNT(i.id_item_estoque_entrada) AS qtd_itens,
            COALESCE(SUM(i.qtd_item * i.vlr_uni), 0) AS vlr_total
       FROM estoque_entrada e
       JOIN emitente f ON f.id_emitente = e.id_fornecedor
       JOIN usuario u ON u.id_usuario = e.id_usuario
       LEFT JOIN item_estoque_entrada i ON i.id_estoque_entrada = e.id_estoque_entrada
       ${where}
      GROUP BY e.id_estoque_entrada, e.dat_entrada, e.id_fornecedor, f.nom_emitente, e.id_usuario, u.nom_usuario
      ORDER BY e.dat_entrada DESC, e.id_estoque_entrada DESC`,
    params,
  );
  return linhas;
}

export async function buscarPorId(id) {
  const [cabecalho] = await pool.query(
    `SELECT e.id_estoque_entrada, e.dat_entrada, e.id_fornecedor, f.nom_emitente AS nom_fornecedor,
            e.id_usuario, u.nom_usuario
       FROM estoque_entrada e
       JOIN emitente f ON f.id_emitente = e.id_fornecedor
       JOIN usuario u ON u.id_usuario = e.id_usuario
      WHERE e.id_estoque_entrada = ?`,
    [id],
  );
  if (!cabecalho[0]) return null;
  const [itens] = await pool.query(
    `SELECT i.id_item_estoque_entrada, i.id_produto, p.nom_produto, p.key_produto, i.qtd_item, i.vlr_uni,
            ROUND(i.qtd_item * i.vlr_uni, 2) AS vlr_subtotal
       FROM item_estoque_entrada i
       JOIN produto p ON p.id_produto = i.id_produto
      WHERE i.id_estoque_entrada = ?
      ORDER BY i.id_item_estoque_entrada`,
    [id],
  );
  const total = arred(itens.reduce((soma, i) => soma + i.vlr_subtotal, 0));
  return { ...cabecalho[0], vlr_total: total, itens };
}

// Registra a entrada, soma ao estoque e recalcula o custo médio ponderado de cada produto.
// Tudo na mesma transação: ou grava tudo, ou nada.
export async function criar({ idFornecedor, idUsuario, dataHora, itens }) {
  return comTransacao(async (conexao) => {
    const fornecedor = await Emitente.buscarPorId(idFornecedor, conexao);
    if (!fornecedor) throw new ErroHttp(404, 'Fornecedor não encontrado.');
    if (fornecedor.idc_tipo === 'CLIENTE') throw new ErroHttp(400, 'O emitente informado não é um fornecedor.');

    // trava as linhas dos produtos (em ordem de id, para evitar deadlock) enquanto atualizamos o estoque
    const ids = [...new Set(itens.map((i) => i.idProduto))].sort((a, b) => a - b);
    const [produtos] = await conexao.query(
      `SELECT id_produto, nom_produto, qtd_estoque, vlr_custo_medio, idc_status
         FROM produto WHERE id_produto IN (?) ORDER BY id_produto FOR UPDATE`,
      [ids],
    );
    if (produtos.length !== ids.length) throw new ErroHttp(404, 'Um ou mais produtos não foram encontrados.');
    const inativo = produtos.find((p) => p.idc_status !== 'ATIVO');
    if (inativo) throw new ErroHttp(409, `O produto "${inativo.nom_produto}" está inativo.`);

    const [cab] = await conexao.query(
      'INSERT INTO estoque_entrada (id_fornecedor, id_usuario, dat_entrada) VALUES (?, ?, IFNULL(?, CURRENT_TIMESTAMP))',
      [idFornecedor, idUsuario, dataHora],
    );
    const idEntrada = cab.insertId;

    const situacao = new Map(produtos.map((p) => [p.id_produto, { qtd: p.qtd_estoque, custo: p.vlr_custo_medio }]));
    for (const item of itens) {
      await conexao.query(
        'INSERT INTO item_estoque_entrada (id_estoque_entrada, id_produto, qtd_item, vlr_uni) VALUES (?, ?, ?, ?)',
        [idEntrada, item.idProduto, item.qtd, item.vlr],
      );
      const atual = situacao.get(item.idProduto);
      const novaQtd = atual.qtd + item.qtd;
      situacao.set(item.idProduto, {
        qtd: novaQtd,
        custo: arred((atual.qtd * atual.custo + item.qtd * item.vlr) / novaQtd),
      });
    }

    for (const [idProduto, { qtd, custo }] of situacao) {
      await conexao.query('UPDATE produto SET qtd_estoque = ?, vlr_custo_medio = ? WHERE id_produto = ?', [qtd, custo, idProduto]);
    }
    return idEntrada;
  });
}
