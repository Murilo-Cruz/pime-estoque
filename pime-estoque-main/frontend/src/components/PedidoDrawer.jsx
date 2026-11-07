import { useEffect, useMemo, useState } from 'react';
import { CircleCheck, CirclePlus, ClipboardList, Lock, Package, Trash2, UserSearch, X, TriangleAlert } from 'lucide-react';
import { brl, hojeISO, inteiro } from '../utils/formatos';

let seq = 0;
const arred = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const totalLinha = (i) => arred(i.qtd * i.preco);

const formInicial = () => ({ id_cliente: '', data: hojeISO(), itens: [] });
const novoVazio = { id_produto: '', qtd: '1', preco: '' };

export default function PedidoDrawer({
  aberto, pedido, clientes, produtos, onClose, onSalvar, onFinalizar, onCancelar, onAviso,
}) {
  const [form, setForm] = useState(formInicial);
  const [novo, setNovo] = useState(novoVazio);
  const [salvando, setSalvando] = useState(false);

  const editando = Boolean(pedido);
  // só pedidos em preparação (ou um pedido novo) podem ser alterados
  const editavel = !pedido || pedido.idc_status === 'EM_PREPARACAO';

  const porId = useMemo(() => new Map(produtos.map((p) => [String(p.id_produto), p])), [produtos]);

  useEffect(() => {
    if (!aberto) return;
    setNovo(novoVazio);
    if (!pedido) return setForm(formInicial());
    setForm({
      id_cliente: String(pedido.id_cliente),
      data: pedido.dat_pedido.slice(0, 10),
      itens: pedido.itens.map((i) => ({
        id: ++seq,
        id_produto: String(i.id_produto),
        nome: i.nom_produto,
        sku: i.key_produto,
        qtd: i.qtd_item,
        preco: i.vlr_preco_uni,
      })),
    });
  }, [aberto, pedido]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, onClose]);

  const total = useMemo(() => arred(form.itens.reduce((s, i) => s + totalLinha(i), 0)), [form.itens]);

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const mudarNovo = (campo) => (e) => setNovo((n) => ({ ...n, [campo]: e.target.value }));

  const trocarProduto = (e) => {
    const p = porId.get(e.target.value);
    setNovo((n) => ({ ...n, id_produto: e.target.value, preco: p ? String(p.vlr_venda) : '' }));
  };

  const incluir = () => {
    const p = porId.get(novo.id_produto);
    const qtd = parseInt(novo.qtd, 10);
    const preco = parseFloat(novo.preco);
    if (!p) return onAviso('Atenção', 'Selecione um produto.');
    if (!(qtd > 0)) return onAviso('Atenção', 'Informe uma quantidade maior que zero.');
    if (!(preco >= 0)) return onAviso('Atenção', 'Informe o preço unitário.');
    setForm((f) => ({
      ...f,
      itens: [...f.itens, { id: ++seq, id_produto: String(p.id_produto), nome: p.nom_produto, sku: p.key_produto, qtd, preco }],
    }));
    setNovo(novoVazio);
  };

  const remover = (id) => setForm((f) => ({ ...f, itens: f.itens.filter((i) => i.id !== id) }));

  async function salvar() {
    if (!form.id_cliente) return onAviso('Atenção', 'Selecione o cliente.');
    if (form.itens.length === 0) return onAviso('Atenção', 'Inclua ao menos um produto no pedido.');
    setSalvando(true);
    await onSalvar({
      id_cliente: Number(form.id_cliente),
      dat_pedido: form.data || undefined,
      itens: form.itens.map((i) => ({ id_produto: Number(i.id_produto), qtd_item: i.qtd, vlr_preco_uni: i.preco })),
    });
    setSalvando(false);
  }

  return (
    <>
      <div className={`drawer-fundo ${aberto ? 'aberto' : ''}`} onClick={onClose} aria-hidden="true" />

      <aside className={`drawer pd-drawer ${aberto ? 'aberto' : ''}`} aria-hidden={!aberto} inert={!aberto} aria-label="Pedido de venda">
        <header className="drawer-topo">
          <div className="drawer-avatar"><ClipboardList size={20} /></div>
          <div className="drawer-titulo">
            <div>
              <strong>{!editando ? 'Novo Pedido de Venda' : editavel ? 'Editar Pedido de Venda' : 'Pedido de Venda'}</strong>
              {editando && <span className="drawer-codigo">#{pedido.id_pedido_venda}</span>}
            </div>
            <small>
              {editavel
                ? 'O estoque só é conferido e baixado quando o pedido é finalizado.'
                : `Pedido ${pedido.idc_status === 'FINALIZADO' ? 'finalizado' : 'cancelado'} — somente leitura.`}
            </small>
          </div>
          <button type="button" className="drawer-fechar" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </header>

        <div className="drawer-corpo">
          <section className="pd-bloco">
            <div className="pd-bloco-topo"><h3><UserSearch size={16} /> 1. Cliente &amp; data</h3></div>
            <div className="drawer-grid pd-grid-12">
              <label className="campo pd-c6"><span>Cliente cadastrado *</span>
                <select value={form.id_cliente} onChange={mudar('id_cliente')} disabled={!editavel}>
                  <option value="">Selecione o cliente…</option>
                  {clientes.map((c) => (
                    <option key={c.id_emitente} value={c.id_emitente}>
                      {c.nom_emitente}{c.des_documento ? ` (${c.des_documento})` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className="campo pd-c3"><span>Data do pedido</span>
                <input className="mono" type="date" value={form.data} onChange={mudar('data')} disabled={!editavel} />
              </label>
            </div>
            {clientes.length === 0 && <p className="en-vazio">Nenhum cliente cadastrado. Cadastre um na tela de Clientes.</p>}
          </section>

          <section className="pd-bloco">
            <div className="pd-bloco-topo">
              <h3><Package size={16} /> 2. Itens do pedido</h3>
              {editavel && <span>O preço vem do cadastro, mas pode ser ajustado</span>}
            </div>

            {editavel && (
              <div className="pd-novo">
                <label className="campo pd-flex"><span>Produto *</span>
                  <select value={novo.id_produto} onChange={trocarProduto}>
                    <option value="">Selecione o produto…</option>
                    {produtos.map((p) => (
                      <option key={p.id_produto} value={p.id_produto}>
                        {p.key_produto} | {p.nom_produto} (disp: {inteiro(p.qtd_estoque)} un - {brl(p.vlr_venda)})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="campo pd-w80"><span>Qtd.</span>
                  <input className="mono pd-centro" type="number" min="1" step="1" value={novo.qtd} onChange={mudarNovo('qtd')} />
                </label>
                <label className="campo pd-w120"><span>Preço unit. (R$)</span>
                  <input className="mono pd-dir" type="number" min="0" step="0.01" value={novo.preco} onChange={mudarNovo('preco')} />
                </label>
                <button type="button" className="primary-button" onClick={incluir}><CirclePlus size={15} /> Incluir</button>
              </div>
            )}

            <div className="table-wrap">
              <table className="pd-itens">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Disponibilidade</th>
                    <th className="pd-centro">Quantidade</th>
                    <th className="pd-dir">Preço unit.</th>
                    <th className="pd-dir">Subtotal</th>
                    {editavel && <th className="pd-centro">Remover</th>}
                  </tr>
                </thead>
                <tbody>
                  {form.itens.map((i) => {
                    const saldo = porId.get(i.id_produto)?.qtd_estoque ?? 0;
                    const ok = i.qtd <= saldo;
                    return (
                      <tr key={i.id}>
                        <td><div className="celula-dupla"><span className="mono verde"><b>{i.sku}</b></span><small>{i.nome}</small></div></td>
                        <td>
                          {pedido && pedido.idc_status !== 'EM_PREPARACAO' ? <span className="mudo">—</span> : (
                            <span className={`pd-chip ${ok ? 'verde' : 'erro'}`}>
                              {ok ? <CircleCheck size={13} /> : <TriangleAlert size={13} />}
                              {ok ? 'Saldo suficiente' : `Faltam ${inteiro(i.qtd - saldo)} un`}
                            </span>
                          )}
                        </td>
                        <td className="mono pd-centro"><b>{inteiro(i.qtd)} un</b></td>
                        <td className="mono pd-dir">{brl(i.preco)}</td>
                        <td className="mono pd-dir verde"><b>{brl(totalLinha(i))}</b></td>
                        {editavel && (
                          <td className="pd-centro">
                            <button type="button" className="pd-lixo" onClick={() => remover(i.id)} aria-label="Remover item"><Trash2 size={16} /></button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {form.itens.length === 0 && <tr><td colSpan={6} className="vazio">Nenhum item no pedido.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="pd-fechamento">
            <div className="pd-bloco-topo"><h3>Fechamento do pedido</h3></div>
            <div className="pd-totais">
              <div><small>Itens:</small><strong className="mono">{form.itens.length}</strong></div>
              <div><small>Unidades:</small><strong className="mono">{inteiro(form.itens.reduce((s, i) => s + i.qtd, 0))}</strong></div>
              <div><small>Valor total do pedido:</small><strong className="mono verde grande">{brl(total)}</strong></div>
            </div>
          </section>
        </div>

        <footer className="drawer-rodape">
          {editando && editavel ? (
            <button type="button" className="btn-perigo" onClick={() => onCancelar(pedido)}><Trash2 size={15} /> Cancelar pedido</button>
          ) : <span />}
          <div>
            <button type="button" className="btn-neutro" onClick={onClose}>Fechar</button>
            {editavel && (
              <button type="button" className="primary-button" onClick={salvar} disabled={salvando}>
                {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Salvar pedido'}
              </button>
            )}
            {editando && editavel && (
              <button type="button" className="primary-button" onClick={() => onFinalizar(pedido)}>
                <Lock size={15} /> Finalizar &amp; baixar estoque
              </button>
            )}
          </div>
        </footer>
      </aside>
    </>
  );
}
