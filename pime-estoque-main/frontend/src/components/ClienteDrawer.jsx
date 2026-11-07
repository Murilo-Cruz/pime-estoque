import { useEffect, useState } from 'react';
import { Contact, Receipt, Save, Trash2, X } from 'lucide-react';
import { brl, codigo, dataBR } from '../utils/formatos';

const abas = [
  { id: 'dados', rotulo: 'Dados Cadastrais', icone: Contact },
  { id: 'historico', rotulo: 'Pedidos', icone: Receipt },
];

const rotuloStatus = { EM_PREPARACAO: 'Em preparação', FINALIZADO: 'Finalizado', CANCELADO: 'Cancelado' };

const vazio = { nom_emitente: '', des_documento: '', des_telefone: '', des_email: '', idc_tipo: 'CLIENTE' };

function Campo({ rotulo, span = 1, children }) {
  return (
    <label className="campo" style={{ gridColumn: `span ${span}` }}>
      <span>{rotulo}</span>
      {children}
    </label>
  );
}

export default function ClienteDrawer({ aberto, cliente, pedidos = [], onClose, onSalvar, onExcluir, onErro }) {
  const [aba, setAba] = useState('dados');
  const [form, setForm] = useState(vazio);
  const [salvando, setSalvando] = useState(false);
  const novo = !cliente;

  useEffect(() => {
    if (!aberto) return;
    setAba('dados');
    setForm(
      cliente
        ? {
            nom_emitente: cliente.nom_emitente,
            des_documento: cliente.des_documento ?? '',
            des_telefone: cliente.des_telefone ?? '',
            des_email: cliente.des_email ?? '',
            idc_tipo: cliente.idc_tipo === 'FORNECEDOR' ? 'CLIENTE' : cliente.idc_tipo,
          }
        : vazio,
    );
  }, [aberto, cliente]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, onClose]);

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const iniciais = novo
    ? '+'
    : cliente.nom_emitente.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();

  async function salvar() {
    if (!form.nom_emitente.trim()) return onErro('Informe o nome do cliente.');
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
    <>
      <div className={`drawer-fundo ${aberto ? 'aberto' : ''}`} onClick={onClose} aria-hidden="true" />

      <aside
        className={`drawer ${aberto ? 'aberto' : ''}`}
        aria-hidden={!aberto}
        inert={!aberto}
        aria-label={novo ? 'Novo cliente' : 'Editar cliente'}
      >
        <header className="drawer-topo">
          <div className="drawer-avatar">{iniciais}</div>
          <div className="drawer-titulo">
            <div>
              <strong>{novo ? 'Novo Cliente' : 'Editar Cliente'}</strong>
              {!novo && <span className="drawer-codigo">#{codigo('CLI', cliente.id_emitente)}</span>}
            </div>
          </div>
          <button type="button" className="drawer-fechar" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        {!novo && (
          <nav className="drawer-abas">
            {abas.map(({ id, rotulo, icone: Icone }) => (
              <button key={id} type="button" className={aba === id ? 'ativa' : ''} onClick={() => setAba(id)}>
                <Icone size={14} /> {rotulo}
              </button>
            ))}
          </nav>
        )}

        <div className="drawer-corpo">
          {aba === 'dados' && (
            <div className="drawer-secao">
              <h3>Identificação & contato</h3>
              <div className="drawer-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <Campo rotulo="Nome / razão social *" span={2}>
                  <input type="text" maxLength={150} value={form.nom_emitente} onChange={mudar('nom_emitente')} />
                </Campo>
                <Campo rotulo="CPF ou CNPJ">
                  <input className="mono" type="text" maxLength={18} value={form.des_documento} onChange={mudar('des_documento')} />
                </Campo>
                <Campo rotulo="Tipo">
                  <select value={form.idc_tipo} onChange={mudar('idc_tipo')}>
                    <option value="CLIENTE">Somente cliente</option>
                    <option value="AMBOS">Cliente e fornecedor</option>
                  </select>
                </Campo>
                <Campo rotulo="E-mail">
                  <input type="email" maxLength={150} value={form.des_email} onChange={mudar('des_email')} />
                </Campo>
                <Campo rotulo="Telefone">
                  <input className="mono" type="text" maxLength={20} value={form.des_telefone} onChange={mudar('des_telefone')} />
                </Campo>
              </div>
            </div>
          )}

          {aba === 'historico' && (
            pedidos.length === 0
              ? <p className="drawer-vazio">Este cliente ainda não tem pedidos de venda.</p>
              : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Pedido</th><th>Data</th><th>Status</th><th className="col-num">Valor</th></tr></thead>
                    <tbody>
                      {pedidos.map((p) => (
                        <tr key={p.id_pedido_venda}>
                          <td className="codigo">#{p.id_pedido_venda}</td>
                          <td>{dataBR(p.dat_pedido)}</td>
                          <td>{rotuloStatus[p.idc_status]}</td>
                          <td className="col-num">{brl(p.vlr_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
          )}
        </div>

        <footer className="drawer-rodape">
          {novo ? <span /> : (
            <button type="button" className="btn-perigo" onClick={() => onExcluir(cliente)}>
              <Trash2 size={15} /> Excluir
            </button>
          )}
          <div>
            <button type="button" className="btn-neutro" onClick={onClose}>Cancelar</button>
            <button type="button" className="primary-button" onClick={salvar} disabled={salvando}>
              <Save size={15} /> {salvando ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}
