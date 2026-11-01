import { useEffect } from 'react';
import { TriangleAlert } from 'lucide-react';

export default function ExcluirProdutoModal({ produto, onCancelar, onConfirmar }) {
  useEffect(() => {
    if (!produto) return;
    const aoTeclar = (e) => e.key === 'Escape' && onCancelar();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [produto, onCancelar]);

  if (!produto) return null;

  return (
    <div className="pr-modal-fundo" onClick={onCancelar}>
      <div className="pr-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="pr-modal-titulo">
          <TriangleAlert size={26} />
          <h3>Validar Exclusão de SKU</h3>
        </div>

        <p>
          Você está prestes a excluir o produto{' '}
          <strong className="mono">{produto.sku} - {produto.nome}</strong>. O sistema verifica
          pendências operacionais antes de confirmar a exclusão.
        </p>

        <div className="pr-modal-caixa">
          <div><span>Ordens de venda em aberto:</span><b className="verde">0 pedidos pendentes</b></div>
          <div>
            <span>Saldo físico em estoque:</span>
            <b className={produto.saldo > 0 ? 'erro' : 'verde'}>{produto.saldo} unidades restantes</b>
          </div>
          <small>Aviso: recomenda-se realizar uma baixa ou zeramento manual de inventário antes da remoção completa do catálogo.</small>
        </div>

        <div className="pr-modal-acoes">
          <button type="button" className="btn-neutro" onClick={onCancelar}>Cancelar</button>
          <button type="button" className="btn-erro" onClick={() => onConfirmar(produto)}>Confirmar Exclusão</button>
        </div>
      </div>
    </div>
  );
}