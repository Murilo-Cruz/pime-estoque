import jwt from 'jsonwebtoken';

export function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Token ausente.' });
  }

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: Number(dados.sub), nome: dados.nome };
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}