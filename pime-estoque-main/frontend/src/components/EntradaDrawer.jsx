import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, CirclePlus, Info, PackagePlus, Trash2, X } from 'lucide-react';
import { brl, centros, fornecedoresEntrada } from '../data/entradas';
import { produtosIniciais } from '../data/produtos';

const FRETE = 1250;
const CREDITOS = 10476;

let seq = 0;
const novoItem = (sku, extra = {}) => ({
  id: ++seq, sku, endereco: 'RUA-B // PRAT-04 // NIV-02', qtd: '25', custo: '480.00', lote: 'LT-2024-N03', validade: '2028-12-31', ...extra,
});

const formInicial = () => ({
  fornecedor: fornecedoresEntrada[0].nome,
  cd: 'CD Barueri',
  doca: 'Doca 02 - Inbound Geral',
  nf: '',
  serie: '1',
  data: '2024-10-14',
  chave: '',
  itens: [
    novoItem('SKU-7729-X', { qtd: '50', custo: '1250.00', lote: 'LT-2024-X49', validade: '2027-12-31' }),
    novoItem('SKU-4102-B', { endereco: 'RUA-A // PRAT-01 // NIV-01', qtd: '80', custo: '310.00', lote: 'LT-2024-S02', validade: '2029-06-30' }),
  ],
});

export default function EntradaDrawer({ aberto, proximoId, preset, onClose, onConfirmar, onAviso }) {
  const [form, setForm] = useState(formInicial);

  useEffect(() => {
    if (aberto) setForm({ ...formInicial(), ...(preset ?? {}) });
  }, [aberto, preset]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, onClose]);

  const subtotal = useMemo(
    () => form.itens.reduce((s, i) => s + (parseFloat(i.qtd) || 0) * (parseFloat(i.custo) || 0), 0),
    [form.itens],
  );
  const total = subtotal + FRETE;

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const mudarItem = (id, campo) => (e) =>
    setForm((f) => ({ ...f, itens: f.itens.map((i) => (i.id === id ? { ...i, [campo]: e.target.value } : i)) }));
  const removerItem = (id) => setForm((f) => ({ ...f, itens: f.itens.filter((i) => i.id !== id) }));
  const adicionarItem = () =>
    setForm((f) => ({ ...f, itens: [...f.itens, novoItem('SKU-9931-K')] }));

  const confirmar = () => {
    
    if (form.itens.length === 0) return onAviso('Atenção', 'Adicione ao menos um SKU recebido.');
    onConfirmar({
      ...form,
      qtd: form.itens.reduce((s, i) => s + (parseFloat(i.qtd) || 0), 0),
      skus: form.itens.length,
      valor: total,
    });
  };

  return (
    <>
      <div className={`drawer-fundo ${aberto ? 'aberto' : ''}`} onClick={onClose} aria-hidden="true" />

      <aside className={`drawer en-drawer ${aberto ? 'aberto' : ''}`} aria-hidden={!aberto} inert={!aberto} aria-label="Nova entrada">
        <header className="drawer-topo">
          <div className="drawer-avatar"><PackagePlus size={20} /></div>
          <div className="drawer-titulo">
            <div>
              <strong>Nova Entrada Operacional</strong>
              <span className="drawer-codigo">#{proximoId}</span>
            </div>
            <small>Incrementar saldo físico de SKUs previamente cadastrados</small>
          </div>
          <button type="button" className="drawer-fechar" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </header>

        <div className="drawer-corpo">
          <section className="en-bloco">
            <div className="en-bloco-topo"><h3>1. Dados remetente da operação</h3></div>
            <div className="drawer-grid en-grid-3">
              <label className="campo"><span>Fornecedor / remetente cadastrado *</span>
                <select value={form.fornecedor} onChange={mudar('fornecedor')}>
                  {fornecedoresEntrada.map((f) => <option key={f.nome} value={f.nome}>{f.nome} (CNPJ {f.cnpj.slice(0, 10)})</option>)}
                </select>
              </label>
              
   
              

              
              
            </div>
            
          </section>

          <section className="en-bloco">
            <div className="en-bloco-topo">
              <h3>2. SKUs recebidos &amp; endereçamento </h3>
              <button type="button" className="en-link" onClick={adicionarItem}><CirclePlus size={15} /> Adicionar outro SKU</button>
            </div>

            <div className="en-itens">
              {form.itens.map((item, idx) => (
                <div className="en-item" key={item.id}>
                  <div className="en-item-topo">
                    <span className="mono">ITEM #{String(idx + 1).padStart(2, '0')}</span>
                    <button type="button" onClick={() => removerItem(item.id)} title="Remover item"><Trash2 size={16} /></button>
                  </div>
                  <div className="drawer-grid en-grid-3">
                    <label className="campo en-span2"><span>Selecione o SKU cadastrado *</span>
                      <select value={item.sku} onChange={mudarItem(item.id, 'sku')}>
                        {produtosIniciais.map((p) => (
                          <option key={p.sku} value={p.sku}>{p.sku} - {p.nome} (Saldo atual: {p.saldo} un)</option>
                        ))}
                      </select>
                    </label>
                    <label className="campo"><span>Endereço armazenagem</span>
                      <input className="mono" type="text" value={item.endereco} onChange={mudarItem(item.id, 'endereco')} />
                    </label>
                  </div>
                  <div className="drawer-grid en-grid-4">
                    <label className="campo"><span>Qtd recebida *</span>
                      <input className="mono en-dir" type="number" min="1" value={item.qtd} onChange={mudarItem(item.id, 'qtd')} />
                    </label>
                    <label className="campo"><span>Custo unitário (R$) *</span>
                      <input className="mono en-dir" type="number" step="0.01" value={item.custo} onChange={mudarItem(item.id, 'custo')} />
                    </label>
                    <label className="campo"><span>Lote fabricação</span>
                      <input className="mono" type="text" value={item.lote} onChange={mudarItem(item.id, 'lote')} />
                    </label>
                    <label className="campo"><span>Validade</span>
                      <input className="mono" type="date" value={item.validade} onChange={mudarItem(item.id, 'validade')} />
                    </label>
                  </div>
                </div>
              ))}
              {form.itens.length === 0 && <p className="en-vazio">Nenhum SKU adicionado a esta entrada.</p>}
            </div>
          </section>

         
        </div>

        <footer className="drawer-rodape">
          <button type="button" className="btn-neutro" onClick={onClose}>Cancelar / Fechar</button>
          <div>
            <button type="button" className="btn-neutro" onClick={() => onAviso('Rascunho salvo', 'Os saldos não foram alterados.')}>Salvar como rascunho</button>
            <button type="button" className="primary-button" onClick={confirmar}>
              <BadgeCheck size={15} /> Confirmar entrada &amp; atualizar saldo
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}