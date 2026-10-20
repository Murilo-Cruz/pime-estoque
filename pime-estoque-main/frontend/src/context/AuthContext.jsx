import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);
const CHAVE = 'mg_auth';

function expiracaoDoToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)).exp * 1000;
  } catch {
    return 0;
  }
}

function lerSessao() {
  const bruto = localStorage.getItem(CHAVE) ?? sessionStorage.getItem(CHAVE);
  if (!bruto) return null;
  try {
    const sessao = JSON.parse(bruto);
    return expiracaoDoToken(sessao.token) > Date.now() ? sessao : null;
  } catch {
    return null;
  }
}

function limparSessao() {
  localStorage.removeItem(CHAVE);
  sessionStorage.removeItem(CHAVE);
}

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(lerSessao);

  const sair = useCallback(() => {
    limparSessao();
    setSessao(null);
  }, []);

  const entrar = useCallback(async (email, senha, lembrar) => {
    const dados = await api('/auth/login', { metodo: 'POST', corpo: { email, senha } });
    const nova = { token: dados.token, usuario: dados.usuario };
    limparSessao();
    (lembrar ? localStorage : sessionStorage).setItem(CHAVE, JSON.stringify(nova));
    setSessao(nova);
  }, []);

  useEffect(() => {
    if (!sessao) return;
    const restante = expiracaoDoToken(sessao.token) - Date.now();
    const id = setTimeout(sair, Math.max(restante, 0));
    return () => clearTimeout(id);
  }, [sessao, sair]);

  const valor = {
    token: sessao?.token ?? null,
    usuario: sessao?.usuario ?? null,
    autenticado: Boolean(sessao),
    entrar,
    sair,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}