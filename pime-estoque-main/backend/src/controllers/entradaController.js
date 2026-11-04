import * as Entrada from '../models/entradaModel.js';
import { ErroHttp } from '../utils/erros.js';
import { dataHora, dataISO, idDaRota, inteiro, numero } from '../utils/validacao.js';

function lerItens(lista) {
  if (!Array.isArray(lista) || lista.length === 0) throw new ErroHttp(400, 'Informe pelo menos um item.');
  if (lista.length > 200) throw new ErroHttp(400, 'Máximo de 200 itens por entrada.');
  return lista.map((item, i) => ({
    idProduto: inteiro(item?.id_produto, `Item ${i + 1} (produto)`, { min: 1 }),
    qtd: inteiro(item?.qtd_item, `Item ${i + 1} (quantidade)`, { min: 1, max: 1000000 }),
    vlr: numero(item?.vlr_uni, `Item ${i + 1} (custo unitário)`),
  }));
}

export async function listar(req, res) {
  const de = dataISO(req.query.de, 'De');
  const ate = dataISO(req.query.ate, 'Até');
  res.json(await Entrada.listar({ de, ate }));
}

export async function obter(req, res) {
  const entrada = await Entrada.buscarPorId(idDaRota(req.params.id));
  if (!entrada) throw new ErroHttp(404, 'Entrada não encontrada.');
  res.json(entrada);
}

export async function criar(req, res) {
  const corpo = req.body ?? {};
  const id = await Entrada.criar({
    idFornecedor: inteiro(corpo.id_fornecedor, 'Fornecedor', { min: 1 }),
    idUsuario: req.usuario.id,
    dataHora: dataHora(dataISO(corpo.dat_entrada, 'Data')),
    itens: lerItens(corpo.itens),
  });
  res.status(201).json(await Entrada.buscarPorId(id));
}
