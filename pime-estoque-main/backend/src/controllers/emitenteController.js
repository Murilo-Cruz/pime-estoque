import * as Emitente from '../models/emitenteModel.js';
import { ErroHttp } from '../utils/erros.js';
import { email, idDaRota, opcao, paramTexto, texto } from '../utils/validacao.js';

const TIPOS = ['CLIENTE', 'FORNECEDOR', 'AMBOS'];

function lerCorpo(corpo = {}) {
  return {
    nome: texto(corpo.nom_emitente, 'Nome', { max: 150 }),
    documento: texto(corpo.des_documento, 'Documento', { max: 18, obrigatorio: false }),
    telefone: texto(corpo.des_telefone, 'Telefone', { max: 20, obrigatorio: false }),
    email: email(corpo.des_email, 'E-mail'),
    tipo: opcao(corpo.idc_tipo, 'Tipo', TIPOS),
  };
}

async function carregar(id) {
  const emitente = await Emitente.buscarPorId(id);
  if (!emitente) throw new ErroHttp(404, 'Emitente não encontrado.');
  return emitente;
}

export async function listar(req, res) {
  const tipo = opcao(req.query.tipo, 'Tipo', ['CLIENTE', 'FORNECEDOR'], { obrigatorio: false });
  res.json(await Emitente.listar({ tipo, busca: paramTexto(req.query.busca) }));
}

export async function obter(req, res) {
  res.json(await carregar(idDaRota(req.params.id)));
}

export async function criar(req, res) {
  const id = await Emitente.criar(lerCorpo(req.body));
  res.status(201).json(await Emitente.buscarPorId(id));
}

export async function atualizar(req, res) {
  const id = idDaRota(req.params.id);
  await carregar(id);
  const dados = lerCorpo(req.body);

  const uso = await Emitente.contarUso(id);
  if (uso.pedidos > 0 && dados.tipo === 'FORNECEDOR') {
    throw new ErroHttp(409, 'Este emitente tem pedidos de venda e precisa continuar como cliente.');
  }
  if (uso.entradas > 0 && dados.tipo === 'CLIENTE') {
    throw new ErroHttp(409, 'Este emitente tem entradas de estoque e precisa continuar como fornecedor.');
  }

  await Emitente.atualizar(id, dados);
  res.json(await Emitente.buscarPorId(id));
}

export async function excluir(req, res) {
  const id = idDaRota(req.params.id);
  await carregar(id);
  const uso = await Emitente.contarUso(id);
  if (uso.pedidos > 0 || uso.entradas > 0) {
    throw new ErroHttp(409, 'Este emitente possui movimentações e não pode ser excluído.');
  }
  await Emitente.excluir(id);
  res.status(204).end();
}
