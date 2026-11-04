// Erro com status HTTP. Os controllers lançam; o tratador no final do app.js transforma em JSON.
export class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

export function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada.' });
}

export function tratadorDeErros(err, req, res, _next) {
  if (err instanceof ErroHttp) return res.status(err.status).json({ erro: err.message });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido.' });
  if (err?.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Já existe um registro com esse valor.' });
  if (err?.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ erro: 'Registro em uso por outros dados e não pode ser removido.' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno no servidor.' });
}
