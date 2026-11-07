import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, CirclePlus, PackagePlus, Trash2, X } from 'lucide-react';
import { brl, hojeISO, inteiro } from '../utils/formatos';

let seq = 0;
const novoItem = (produto) => ({
  id: ++seq,
  id_produto: produto ? String(produto.id_produto) : '',
  qtd: '1',
  custo: produto ? String(produto.vlr_custo_medio) : '0',
});

const formInicial = (produtos, preset) => ({
  id_fornecedor: preset?.id_fornecedor ? String(preset.id_fornecedor) : '',
  data: hojeISO(),
  itens: [novoItem(produtos[0])],
});

export default function EntradaDrawer({ aberto, preset, fornecedores, produtos, onClose, onConfirmar, onAviso }) {
  const [form, setForm] = useState(() => formInicial(produtos, preset));
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (aberto) setForm(formInicial(produtos, preset));
  }, [aberto, preset, produtos]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, onClose]);

  const total = useMemo(
    () => form.itens.reduce((s, i) => s + (parseInt(i.qtd, 10) || 0) * (parseFloat(i.custo) || 0), 0),
    [form.itens],
  );

  const porId = useMemo(() => new Map(produtos.map((p) => [String(p.id_produto), p])), [produtos]);

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const mudarItem = (id, campo) => (e) =>
    setForm((f) => ({ ...f, itens: f.itens.map((i) => (i.id === id ? { ...i, [campo]: e.target.value } : i)) }));
  const trocarProduto = (id) => (e) => {
    const p = porId.get(e.target.value);
    setForm((f) => ({
      ...f,
      itens: f.itens.map((i) => (i.id === id ? { ...i, id_produto: e.target.value, custo: String(p?.vlr_custo_medio ?? 0) } : i)),
    }));
  };
  const removerItem = (id) => setForm((f) => ({ ...f, itens: f.itens.filter((i) => i.id !== id) }));
  const adicionarItem = () => setForm((f) => ({ ...f, itens: [...f.itens, novoItem(produtos[0])] }));

  async function confirmar() {
    if (!form.id_fornecedor) return onAviso('Atenção', 'Selecione o fornecedor.');
    if (form.itens.length === 0) return onAviso('Atenção', 'Adicione ao menos um produto recebido.');
    for (const [idx, i] of form.itens.entries()) {
      if (!i.id_produto) return onAviso('Atenção', `Item ${idx + 1}: selecione o produto.`);
      if (!(parseInt(i.qtd, 10) > 0)) return onAviso('Atenção', `Item ${idx + 1}: informe uma quantidade maior que zero.`);
      if (i.custo === '' || parseFloat(i.custo) < 0) return onAviso('Atenção', `Item ${idx + 1}: informe o custo unitário.`);
    }
    setSalvando(true);
    await onConfirmar({
      id_fornecedor: Number(form.id_fornecedor),
      dat_entrada: form.data || undefined,
      itens: form.itens.map((i) => ({
        id_produto: Number(i.id_produto),
        qtd_item: parseInt(i.qtd, 10),
        vlr_uni: parseFloat(i.custo),
      })),
    });
    setSalvando(false);
  }

  return (
    <>
      <div className={`drawer-fundo ${aberto ? 'aberto' : ''}`} onClick={onClose} aria-hidden="true" />

      <aside className={`drawer en-drawer ${aberto ? 'aberto' : ''}`} aria-hidden={!aberto} inert={!aberto} aria-label="Nova entrada">
        <header className="drawer-topo">
          <div className="drawer-avatar"><PackagePlus size={20} /></div>
          <div className="drawer-titulo">
            <div><strong>Nova Entrada de Estoque</strong></div>
            <small>Soma ao saldo dos produtos e recalcula o custo médio ponderado</small>
          </div>
          <button type="button" className="drawer-fechar" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </header>

        <div className="drawer-corpo">
          <section className="en-bloco">
            <div className="en-bloco-topo"><h3>1. Dados da entrada</h3></div>
            <div className="drawer-grid en-grid-3">
              <label className="campo en-span2"><span>Fornecedor *</span>
                <select value={form.id_fornecedor} onChange={mudar('id_fornecedor')}>
                  <option value="">Selecione o fornecedor…</option>
                  {fornecedores.map((f) => (
                    <option key={f.id_emitente} value={f.id_emitente}>
                      {f.nom_emitente}{f.des_documento ? ` (${f.des_documento})` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className="campo"><span>Data da entrada</span>
                <input className="mono" type="date" value={form.data} onChange={mudar('data')} />
              </label>
            </div>
            {fornecedores.length === 0 && (
              <p className="en-vazio">Nenhum fornecedor cadastrado. Cadastre um na tela de Emitentes antes de registrar entradas.</p>
            )}
          </section>

          <section className="en-bloco">
            <div className="en-bloco-topo">
              <h3>2. Produtos recebidos</h3>
              <button type="button" className="en-link" onClick={adicionarItem} disabled={produtos.length === 0}>
                <CirclePlus size={15} /> Adicionar outro produto
              </button>
            </div>

            <div className="en-itens">
              {form.itens.map((item, idx) => {
                const p = porId.get(item.id_produto);
                return (
                  <div className="en-item" key={item.id}>
                    <div className="en-item-topo">
                      <span className="mono">ITEM #{String(idx + 1).padStart(2, '0')}</span>
                      <button type="button" onClick={() => removerItem(item.id)} title="Remover item"><Trash2 size={16} /></button>
                    </div>
                    <div className="drawer-grid en-grid-3">
                      <label className="campo en-span2"><span>Produto *</span>
                        <select value={item.id_produto} onChange={trocarProduto(item.id)}>
                          <option value="">Selecione o produto…</option>
                          {produtos.map((pr) => (
                            <option key={pr.id_produto} value={pr.id_produto}>
                              {pr.key_produto} - {pr.nom_produto} (saldo: {inteiro(pr.qtd_estoque)} un)
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="drawer-grid en-grid-3">
                      <label className="campo"><span>Qtd recebida *</span>
                        <input className="mono en-dir" type="number" min="1" step="1" value={item.qtd} onChange={mudarItem(item.id, 'qtd')} />
                      </label>
                      <label className="campo"><span>Custo unitário (R$) *</span>
                        <input className="mono en-dir" type="number" min="0" step="0.01" value={item.custo} onChange={mudarItem(item.id, 'custo')} />
                      </label>
                      <label className="campo"><span>Subtotal</span>
                        <input className="mono en-dir" type="text" readOnly value={brl((parseInt(item.qtd, 10) || 0) * (parseFloat(item.custo) || 0))} />
                      </label>
                    </div>
                    {p && <small className="mono">Custo médio atual: {brl(p.vlr_custo_medio)}</small>}
                  </div>
                );
              })}
              {form.itens.length === 0 && <p className="en-vazio">Nenhum produto adicionado a esta entrada.</p>}
              {produtos.length === 0 && <p className="en-vazio">Nenhum produto ativo cadastrado. Cadastre produtos antes de registrar entradas.</p>}
            </div>
          </section>

          <section className="en-bloco">
            <div className="en-bloco-topo">
              <h3>Valor total da entrada</h3>
              <strong className="mono verde">{brl(total)}</strong>
            </div>
          </section>
        </div>

        <footer className="drawer-rodape">
          <button type="button" className="btn-neutro" onClick={onClose}>Cancelar / Fechar</button>
          <div>
            <button type="button" className="primary-button" onClick={confirmar} disabled={salvando}>
              <BadgeCheck size={15} /> {salvando ? 'Registrando…' : 'Confirmar entrada & atualizar saldo'}
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}
