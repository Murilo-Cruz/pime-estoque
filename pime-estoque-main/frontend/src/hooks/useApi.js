import { useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Devolve uma função que chama a API já com o token do usuário.
// Se o servidor responder 401 (token vencido/ inválido), encerra a sessão.
export function useApi() {
  const { token, sair } = useAuth();

  return useCallback(
    async (caminho, opcoes = {}) => {
      try {
        return await api(caminho, { ...opcoes, token });
      } catch (erro) {
        if (erro.status === 401) sair();
        throw erro;
      }
    },
    [token, sair],
  );
}
