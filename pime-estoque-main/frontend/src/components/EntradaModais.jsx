import { useEffect } from 'react';
import { X } from 'lucide-react';
import { brl, dataBR, horaBR, inteiro } from '../utils/formatos';

export function DetalheEntradaModal({ entrada, onClose }) {
  useEffect(() => {
    if (!entrada) return;
    const aoTeclar = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [entrada, onClose]);

  if (!entrada) return null;

  return (
    <div className="en-modal-fundo" onClick={onClose}>
      <div className="en-modal" role="dialog" aria-modal="true" style={{ maxWidth: 720, width: '100%' }} onClick={(e) => e.stopPropagation()}>
        <div className="en-modal-topo">
          <h3>Entrada #{entrada.id_estoque_entrada}</h3>
          <button type="button" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </div>

        <p>
          <strong>{entrada.nom_fornecedor}</strong> • {dataBR(entrada.dat_entrada)} às {horaBR(entrada.dat_entrada)}
          {' '}• registrada por {entrada.nom_usuario}
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Produto</th><th className="col-num">Qtd</th><th className="col-num">Custo unit.</th><th className="col-num">Subtotal</th></tr>
            </thead>
            <tbody>
              {entrada.itens.map((i) => (
                <tr key={i.id_item_estoque_entrada}>
                  <td><div className="celula-dupla"><span>{i.nom_produto}</span><small className="mono">{i.key_produto}</small></div></td>
                  <td className="col-num mono">{inteiro(i.qtd_item)}</td>
                  <td className="col-num mono">{brl(i.vlr_uni)}</td>
                  <td className="col-num mono"><b>{brl(i.vlr_subtotal)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="en-modal-acoes en-modal-rodape">
          <span>Total da entrada: <b>{brl(entrada.vlr_total)}</b></span>
          <button type="button" className="btn-neutro" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
