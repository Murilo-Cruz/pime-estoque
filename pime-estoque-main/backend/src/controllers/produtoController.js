import * as Produto from '../models/produtoModel.js';
import { ErroHttp } from '../utils/erros.js';
import { idDaRota, inteiro, numero, opcao, paramTexto, texto } from '../utils/validacao.js';

const STATUS = ['ATIVO', 'INATIVO'];

function lerCorpo(corpo = {}) {
  return {
    nome: texto(corpo.nom_produto, 'Nome', { max: 150 }),
    sku: texto(corpo.key_produto, 'SKU', { max: 50 }),
    vlrVenda: numero(corpo.vlr_venda, 'Preço de venda'),
    qtdMin: corpo.qtd_min_estoque === undefined ? 0 : inteiro(corpo.qtd_min_estoque, 'Estoque mínimo'),
    status: opcao(corpo.idc_status, 'Status', STATUS, { obrigatorio: false }),
  };
}

async function carregar(id) {
  const produto = await Produto.buscarPorId(id);
  if (!produto) throw new ErroHttp(404, 'Produto não encontrado.');
  return produto;
}

const skuDuplicado = (err) => {
  if (err?.code === 'ER_DUP_ENTRY') throw new ErroHttp(409, 'Já existe um produto com esse SKU.');
  throw err;
};

export async function listar(req, res) {
  res.json(
    await Produto.listar({
      busca: paramTexto(req.query.busca),
      status: opcao(req.query.status, 'Status', STATUS, { obrigatorio: false }),
      estoqueBaixo: req.query.estoqueBaixo === 'true',
    }),
  );
}

export async function obter(req, res) {
  res.json(await carregar(idDaRota(req.params.id)));
}

export async function criar(req, res) {
  const id = await Produto.criar(lerCorpo(req.body)).catch(skuDuplicado);
  res.status(201).json(await Produto.buscarPorId(id));
}

export async function atualizar(req, res) {
  const id = idDaRota(req.params.id);
  await carregar(id);
  await Produto.atualizar(id, lerCorpo(req.body)).catch(skuDuplicado);
  res.json(await Produto.buscarPorId(id));
}

export async function alterarStatus(req, res) {
  const id = idDaRota(req.params.id);
  await carregar(id);
  await Produto.alterarStatus(id, opcao(req.body?.idc_status, 'Status', STATUS));
  res.json(await Produto.buscarPorId(id));
}

export async function excluir(req, res) {
  const id = idDaRota(req.params.id);
  await carregar(id);
  try {
    await Produto.excluir(id);
  } catch (err) {
    if (err?.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new ErroHttp(409, 'Este produto possui movimentações e não pode ser excluído. Inative-o.');
    }
    throw err;
  }
  res.status(204).end();
}
