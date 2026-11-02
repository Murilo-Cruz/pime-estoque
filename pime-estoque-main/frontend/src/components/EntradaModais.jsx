import { useEffect } from 'react';
import { CloudUpload, FileUp, TriangleAlert, X } from 'lucide-react';

function useEsc(ativo, fn) {
  useEffect(() => {
    if (!ativo) return;
    const aoTeclar = (e) => e.key === 'Escape' && fn();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [ativo, fn]);
}

export function ImportarXmlModal({ aberto, onClose, onProcessar }) {
  useEsc(aberto, onClose);
  if (!aberto) return null;

  return (
    <div className="en-modal-fundo" onClick={onClose}>
      <div className="en-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="en-modal-topo">
          <span className="en-modal-icone"><FileUp size={20} /></span>
          <h3>Importação de NF-e (XML)</h3>
          <button type="button" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </div>
        <p>
          Faça o upload do arquivo XML emitido pelo fornecedor. O sistema extrai automaticamente o emitente,
          a chave de 44 dígitos e vincula os itens aos SKUs existentes.
        </p>
        <button type="button" className="en-dropzone" onClick={onProcessar}>
          <CloudUpload size={40} />
          <strong>Arraste o arquivo .XML ou clique para selecionar</strong>
          <small>Formatos suportados: XML Schema ProcNFe v4.00 (até 15MB)</small>
        </button>
        <div className="en-modal-acoes en-modal-rodape">
          <span>Status SEFAZ: <b>Online</b></span>
          <div>
            <button type="button" className="btn-neutro" onClick={onClose}>Cancelar</button>
            <button type="button" className="primary-button" onClick={onProcessar}>Processar XML</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EstornoModal({ entrada, onCancelar, onConfirmar }) {
  useEsc(!!entrada, onCancelar);
  if (!entrada) return null;

  return (
    <div className="en-modal-fundo" onClick={onCancelar}>
      <div className="en-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="en-modal-erro">
          <TriangleAlert size={26} />
          <h3>Estornar Entrada de Estoque?</h3>
        </div>
        <p>
          Atenção: ao estornar a entrada <strong className="mono">#{entrada.id}</strong>, as quantidades vinculadas
          serão subtraídas imediatamente do saldo físico atual e os lotes correspondentes serão invalidados.
        </p>
        <div className="en-modal-acoes">
          <button type="button" className="btn-neutro" onClick={onCancelar}>Cancelar</button>
          <button type="button" className="en-btn-erro" onClick={() => onConfirmar(entrada)}>Confirmar Estorno</button>
        </div>
      </div>
    </div>
  );
}