import { useEffect, useState } from 'react';
import { BadgeCheck, Contact, Handshake, Save, Trash2, X } from 'lucide-react';

const vazio = { nom_emitente: '', des_documento: '', des_telefone: '', des_email: '', idc_tipo: 'FORNECEDOR' };

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
  const [form, setForm] = useState(vazio);
  const [salvando, setSalvando] = useState(false);
  const novo = !emitente;

  useEffect(() => {
    if (!aberto) return;
    setForm(
      emitente
        ? {
            nom_emitente: emitente.nom_emitente,
            des_documento: emitente.des_documento ?? '',
            des_telefone: emitente.des_telefone ?? '',
            des_email: emitente.des_email ?? '',
            idc_tipo: emitente.idc_tipo === 'CLIENTE' ? 'FORNECEDOR' : emitente.idc_tipo,
          }
        : vazio,
    );
    const aoTeclar = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, emitente, onClose]);

  if (!aberto) return null;

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    setSalvando(true);
    await onSalvar({
      nom_emitente: form.nom_emitente.trim(),
      des_documento: form.des_documento.trim() || null,
      des_telefone: form.des_telefone.trim() || null,
      des_email: form.des_email.trim() || null,
      idc_tipo: form.idc_tipo,
    });
    setSalvando(false);
  }

  return (
    <div className="em-fundo" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="em-modal" role="dialog" aria-modal="true" aria-label="Fornecedor">
        <header className="em-modal-topo">
          <span className="em-modal-icone"><Handshake size={20} /></span>
          <div>
            <h2>{novo ? 'Cadastrar Novo Fornecedor' : `Editar Fornecedor: ${emitente.nom_emitente}`}</h2>
            <small>Dados cadastrais e contato</small>
          </div>
          <button type="button" className="em-icon-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        <form id="form-emitente" className="em-modal-corpo" onSubmit={enviar}>
          <Secao icone={BadgeCheck} cor="verde" titulo="1. Identificação">
            <div className="em-grid em-grid-2">
              <Campo rotulo="Nome / razão social *">
                <input required type="text" maxLength={150} value={form.nom_emitente} onChange={mudar('nom_emitente')} />
              </Campo>
              <Campo rotulo="CPF ou CNPJ">
                <input className="mono" type="text" maxLength={18} value={form.des_documento} onChange={mudar('des_documento')} />
              </Campo>
              <Campo rotulo="Tipo *">
                <select value={form.idc_tipo} onChange={mudar('idc_tipo')}>
                  <option value="FORNECEDOR">Somente fornecedor</option>
                  <option value="AMBOS">Fornecedor e cliente</option>
                </select>
              </Campo>
            </div>
          </Secao>

          <Secao icone={Contact} cor="ciano" titulo="2. Contato">
            <div className="em-grid em-grid-3">
              <Campo rotulo="E-mail">
                <input type="email" maxLength={150} value={form.des_email} onChange={mudar('des_email')} />
              </Campo>
              <Campo rotulo="Telefone / WhatsApp">
                <input className="mono" type="text" maxLength={20} value={form.des_telefone} onChange={mudar('des_telefone')} />
              </Campo>
            </div>
          </Secao>
        </form>

        <footer className="em-modal-rodape">
          {!novo ? (
            <button type="button" className="em-btn perigo" onClick={() => onExcluir(emitente)}>
              <Trash2 size={15} /> Excluir fornecedor
            </button>
          ) : (
            <span />
          )}
          <div className="em-acoes-rodape">
            <button type="button" className="em-btn neutro" onClick={onClose}>Cancelar</button>
            <button type="submit" form="form-emitente" className="em-btn primario" disabled={salvando}>
              <Save size={15} /> {salvando ? 'Salvando…' : 'Salvar fornecedor'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
