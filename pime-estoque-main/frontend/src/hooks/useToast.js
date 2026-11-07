import { useCallback, useEffect, useRef, useState } from 'react';

export function useToast(duracao = 3800) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const avisar = useCallback(
    (titulo, mensagem = '', erro = false) => {
      setToast({ titulo, mensagem, erro });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), duracao);
    },
    [duracao],
  );

  return [toast, avisar];
}
