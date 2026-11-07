import { useEffect } from 'react';
import { TriangleAlert } from 'lucide-react';
import { inteiro } from '../utils/formatos';

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
          <h3>Excluir produto</h3>
        </div>

        <p>
          Você está prestes a excluir <strong className="mono">{produto.key_produto} - {produto.nom_produto}</strong>.
          Esta ação não pode ser desfeita.
        </p>

        <div className="pr-modal-caixa">
          <div>
            <span>Saldo físico em estoque:</span>
            <b className={produto.qtd_estoque > 0 ? 'erro' : 'verde'}>{inteiro(produto.qtd_estoque)} unidades</b>
          </div>
          <small>
            Produtos que já aparecem em entradas ou pedidos não podem ser excluídos — nesse caso o sistema
            avisa e você pode apenas inativá-los.
          </small>
        </div>

        <div className="pr-modal-acoes">
          <button type="button" className="btn-neutro" onClick={onCancelar}>Cancelar</button>
          <button type="button" className="btn-erro" onClick={() => onConfirmar(produto)}>Confirmar exclusão</button>
        </div>
      </div>
    </div>
  );
}
