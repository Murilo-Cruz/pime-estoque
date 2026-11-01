import { useEffect, useState } from 'react';
import {
  BadgeCheck,
  CircleCheck,
  CloudUpload,
  Contact,
  Handshake,
  MapPin,
  Save,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { condicoesPagamento, statusFornecedor, tiposFornecedor } from '../data/emitentes';

function Secao({ icone: Icone, cor, titulo, children }) {
  return (
    <section className="em-secao">
      <h3 className={`em-secao-titulo ${cor}`}>
        <Icone size={16} /> {titulo}
      </h3>
      {children}
    </section>
  );
}

function Campo({ rotulo, span = 1, children }) {
  return (
    <label className="em-campo" style={{ gridColumn: `span ${span}` }}>
      <span>{rotulo}</span>
      {children}
    </label>
  );
}

export default function EmitenteModal({ aberto, emitente, onClose, onSalvar, onExcluir }) {
  const [arquivo, setArquivo] = useState('');
  const novo = !emitente;

  useEffect(() => {
    if (!aberto) return;
    setArquivo('');
    const aoTeclar = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, onClose]);

  if (!aberto) return null;

  const contratoValido = emitente?.contratoVence;

  function enviar(e) {
    e.preventDefault();
    onSalvar(novo);
  }

  return (
    <div className="em-fundo" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="em-modal" role="dialog" aria-modal="true" aria-label="Fornecedor">
        <header className="em-modal-topo">
          <span className="em-modal-icone"><Handshake size={20} /></span>
          <div>
            <h2>{novo ? 'Cadastrar Novo Fornecedor' : `Editar Fornecedor: ${emitente.nome}`}</h2>
            <small>Dados cadastrais, condições comerciais, contato e contrato de fornecimento</small>
          </div>
          <button type="button" className="em-icon-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        {/* key recarrega os defaultValue quando troca de fornecedor */}
        <form id="form-emitente" className="em-modal-corpo" key={emitente?.id ?? 'novo'} onSubmit={enviar}>
          <Secao icone={BadgeCheck} cor="verde" titulo="1. Identificação jurídica & cadastral">
            <div className="em-grid em-grid-2">
              <Campo rotulo="Razão social completa *">
                <input required type="text" defaultValue={emitente?.razaoSocial ?? ''} />
              </Campo>
              <Campo rotulo="Nome fantasia / identificador interno *">
                <input required type="text" defaultValue={emitente?.nome ?? ''} />
              </Campo>
              <Campo rotulo="CNPJ *">
                <input required className="mono" type="text" defaultValue={emitente?.cnpj ?? ''} />
              </Campo>
              <Campo rotulo="Inscrição estadual (IE)">
                <input className="mono" type="text" defaultValue={emitente?.ie ?? ''} />
              </Campo>
              <Campo rotulo="Tipo de fornecedor *">
                <select defaultValue={emitente?.tipo ?? 'fabricante'}>
                  {tiposFornecedor.map(([valor, rotulo]) => (
                    <option key={valor} value={valor}>{rotulo}</option>
                  ))}
                </select>
              </Campo>
              <Campo rotulo="Categorias fornecidas *">
                <input type="text" placeholder="Ex: Controladores, Sensores" defaultValue={emitente?.categoria ?? ''} />
              </Campo>
            </div>
          </Secao>

          <Secao icone={MapPin} cor="ciano" titulo="2. Endereço & localização">
            <div className="em-grid em-grid-4">
              <Campo rotulo="CEP *">
                <input className="mono" type="text" defaultValue={emitente?.cep ?? ''} />
              </Campo>
              <Campo rotulo="Logradouro / avenida / rua *" span={2}>
                <input type="text" defaultValue={emitente?.logradouro ?? ''} />
              </Campo>
              <Campo rotulo="Número *">
                <input type="text" defaultValue={emitente?.numero ?? ''} />
              </Campo>
              <Campo rotulo="Complemento ">
                <input type="text" defaultValue={emitente?.complemento ?? ''} />
              </Campo>
              <Campo rotulo="Bairro *">
                <input type="text" defaultValue={emitente?.bairro ?? ''} />
              </Campo>
              <Campo rotulo="Município *">
                <input type="text" defaultValue={emitente?.cidade ?? ''} />
              </Campo>
              <Campo rotulo="UF * / cód. IBGE cidade">
                <div className="em-par">
                  <input className="maiusculo" maxLength={2} type="text" defaultValue={emitente?.uf ?? 'SP'} />
                  <input className="mono" type="text" defaultValue={emitente?.ibge ?? ''} />
                </div>
              </Campo>
            </div>
          </Secao>

          <Secao icone={Truck} cor="verde" titulo="3. Condições comerciais & logística de compra">
            <div className="em-grid em-grid-3">
              <Campo rotulo="Condição de pagamento *">
                <select defaultValue={emitente?.pagamento ?? condicoesPagamento[0]}>
                  {condicoesPagamento.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Campo>
              <Campo rotulo="Prazo de entrega (dias) *">
                <input className="mono" type="number" min="0" defaultValue={parseInt(emitente?.prazoEntrega ?? '7', 10)} />
              </Campo>
              <Campo rotulo="Pedido mínimo (R$)">
                <input className="mono" type="text" defaultValue={emitente?.pedidoMinimo ?? ''} />
              </Campo>


            </div>
          </Secao>

          <Secao icone={Contact} cor="ciano" titulo="4. Contato comercial">
            <div className="em-grid em-grid-3">
              <Campo rotulo="Nome do contato *">
                <input type="text" defaultValue={emitente?.contato ?? ''} />
              </Campo>
              <Campo rotulo="E-mail para pedidos *">
                <input type="email" defaultValue={emitente?.email ?? ''} />
              </Campo>
              <Campo rotulo="Telefone / WhatsApp">
                <input className="mono" type="text" defaultValue={emitente?.telefone ?? ''} />
              </Campo>
            </div>
          </Secao>

          <Secao icone={Handshake} cor="verde" titulo="5. Contrato de fornecimento (PDF)">
            <div className="em-cert">
              <label className="em-upload">
                <CloudUpload size={34} />
                <strong>{arquivo || 'Arraste ou selecione o contrato em PDF'}</strong>
                <small>Contrato assinado, aditivos ou tabela de preços (tamanho máx: 10MB)</small>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  onChange={(e) => setArquivo(e.target.files?.[0]?.name ?? '')}
                />
              </label>

              <div className="em-cert-lado">
                <Campo rotulo="Vigência do contrato até">
                  <input className="mono" type="text" placeholder="dd/mm/aaaa" defaultValue={emitente?.contratoVence ?? ''} />
                </Campo>

                {contratoValido && (
                  <div className="em-validacao">
                    <small>Situação atual:</small>
                    <span><CircleCheck size={14} /> Contrato vigente</span>
                    <code>Vencimento: {emitente.contratoVence}</code>
                  </div>
                )}
              </div>
            </div>
          </Secao>
        </form>

        <footer className="em-modal-rodape">
          {!novo ? (
            <button type="button" className="em-btn perigo" onClick={() => onExcluir(emitente)}>
              <Trash2 size={15} /> Inativar fornecedor
            </button>
          ) : (
            <span />
          )}
          <div className="em-acoes-rodape">
            <button type="button" className="em-btn neutro" onClick={onClose}>Cancelar</button>
            <button type="submit" form="form-emitente" className="em-btn primario">
              <Save size={15} /> Salvar fornecedor
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}