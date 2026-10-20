const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

export async function api(caminho, { metodo = 'GET', corpo, token } = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    const erro = new Error(dados.erro ?? 'Erro inesperado.');
    erro.status = resposta.status;
    throw erro;
  }
  return dados;
}