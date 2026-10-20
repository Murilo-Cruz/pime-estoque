import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as Usuario from '../models/usuarioModel.js';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function gerarToken(usuario) {
  return jwt.sign({ nome: usuario.nom_usuario }, process.env.JWT_SECRET, {
    subject: String(usuario.id_usuario),
    expiresIn: '8h',
  });
}

export async function registrar(req, res) {
  const { nome, email, senha } = req.body ?? {};

  if (typeof nome !== 'string' || typeof email !== 'string' || typeof senha !== 'string'
      || !nome.trim() || !email.trim() || !senha) {
    return res.status(400).json({ erro: 'Preencha nome, e-mail e senha.' });
  }
  if (nome.trim().length > 100 || email.trim().length > 150) {
    return res.status(400).json({ erro: 'Nome ou e-mail muito longo.' });
  }
  if (!EMAIL_VALIDO.test(email.trim())) {
    return res.status(400).json({ erro: 'E-mail inválido.' });
  }
  if (senha.length < 8 || senha.length > 72) {
    return res.status(400).json({ erro: 'A senha deve ter de 8 a 72 caracteres.' });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const id = await Usuario.criar({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senhaHash,
    });
    res.status(201).json({ id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    }
    throw err;
  }
}

export async function login(req, res) {
  const { email, senha } = req.body ?? {};

  if (typeof email !== 'string' || typeof senha !== 'string' || !email || !senha) {
    return res.status(400).json({ erro: 'Informe e-mail e senha.' });
  }

  const usuario = await Usuario.buscarPorEmail(email.trim().toLowerCase());
  const senhaConfere = usuario ? await bcrypt.compare(senha, usuario.des_password) : false;

  if (!senhaConfere) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }

  res.json({
    token: gerarToken(usuario),
    usuario: { id: usuario.id_usuario, nome: usuario.nom_usuario, email: usuario.des_email },
  });
}

export function me(req, res) {
  res.json({ usuario: req.usuario });
}