import * as Pedido from '../models/pedidoModel.js';
import { ErroHttp } from '../utils/erros.js';
import { dataHora, dataISO, idDaRota, inteiro, numero, opcao, paramTexto } from '../utils/validacao.js';

const STATUS = ['EM_PREPARACAO', 'FINALIZADO', 'CANCELADO'];

function lerItens(lista) {
  if (!Array.isArray(lista) || lista.length === 0) throw new ErroHttp(400, 'Informe pelo menos um item.');
  if (lista.length > 200) throw new ErroHttp(400, 'Máximo de 200 itens por pedido.');
  return lista.map((item, i) => ({
    idProduto: inteiro(item?.id_produto, `Item ${i + 1} (produto)`, { min: 1 }),
    qtd: inteiro(item?.qtd_item, `Item ${i + 1} (quantidade)`, { min: 1, max: 1000000 }),
    // se o preço não vier, usa o preço de venda atual do produto
    preco: item?.vlr_preco_uni === undefined ? null : numero(item.vlr_preco_uni, `Item ${i + 1} (preço unitário)`),
  }));
}

async function carregar(id) {
  const pedido = await Pedido.buscarPorId(id);
  if (!pedido) throw new ErroHttp(404, 'Pedido não encontrado.');
  return pedido;
}

export async function listar(req, res) {
  res.json(
    await Pedido.listar({
      status: opcao(req.query.status, 'Status', STATUS, { obrigatorio: false }),
      busca: paramTexto(req.query.busca),
      de: dataISO(req.query.de, 'De'),
      ate: dataISO(req.query.ate, 'Até'),
    }),
  );
}

export async function obter(req, res) {
  res.json(await carregar(idDaRota(req.params.id)));
}

export async function criar(req, res) {
  const corpo = req.body ?? {};
  const id = await Pedido.criar({
    idCliente: inteiro(corpo.id_cliente, 'Cliente', { min: 1 }),
    idUsuario: req.usuario.id,
    dataHora: dataHora(dataISO(corpo.dat_pedido, 'Data')),
    itens: lerItens(corpo.itens),
  });
  res.status(201).json(await carregar(id));
}

export async function atualizar(req, res) {
  const id = idDaRota(req.params.id);
  const corpo = req.body ?? {};
  await Pedido.atualizar(id, {
    idCliente: inteiro(corpo.id_cliente, 'Cliente', { min: 1 }),
    dataHora: dataHora(dataISO(corpo.dat_pedido, 'Data')),
    itens: lerItens(corpo.itens),
  });
  res.json(await carregar(id));
}

export async function finalizar(req, res) {
  const id = idDaRota(req.params.id);
  await Pedido.finalizar(id);
  res.json(await carregar(id));
}

export async function cancelar(req, res) {
  const id = idDaRota(req.params.id);
  await Pedido.cancelar(id);
  res.json(await carregar(id));
}
