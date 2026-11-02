import { useEffect, useState } from 'react';
import { BadgeDollarSign, Save, TriangleAlert, X } from 'lucide-react';
import { MARGEM_MINIMA, brl, canais, statusLanc } from '../data/financeiro';

const vazio = { id: '', cliente: '', mix: '', canal: 'b2b', venda: '', custo: '', categoria: '', status: 'aberto' };

export default function LancamentoModal({ aberto, lancamento, onClose, onSalvar, onErro }) {
  const [f, setF] = useState(vazio);
  const editando = !!lancamento;

  useEffect(() => {
    if (!aberto) return;
    setF(lancamento
      ? { ...vazio, ...lancamento, venda: String(lancamento.venda), custo: String(lancamento.custo) }
      : { ...vazio, id: `PV-${9100 + Math.floor(Math.random() * 900)}` });
  }, [aberto, lancamento]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, onClose]);

  if (!aberto) return null;

  const mudar = (campo) => (e) => setF((x) => ({ ...x, [campo]: e.target.value }));
  const venda = parseFloat(f.venda) || 0;
  const custo = parseFloat(f.custo) || 0;
  const lucroV = venda - custo;
  const margem = venda > 0 ? (lucroV / venda) * 100 : 0;
  const abaixo = venda > 0 && margem < MARGEM_MINIMA;

  const enviar = (e) => {
    e.preventDefault();
    if (!f.cliente.trim() || venda <= 0 || custo <= 0) return onErro('Preencha cliente, valor de venda e custo dos itens.');
    onSalvar({ ...f, venda, custo });
  };

  return (
    <div className="fi-fundo" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="fi-modal" onSubmit={enviar} role="dialog" aria-modal="true" aria-label="Lançamento">
        <header>
          <BadgeDollarSign size={22} />
          <h2>{editando ? `Composição de Margem #${lancamento.id}` : 'Apurar Lançamento de Margem'}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </header>

        <div className="fi-corpo">
          <div className="fi-grid">
            <label className="campo"><span>Pedido / referência</span>
              <input className="mono" type="text" value={f.id} onChange={mudar('id')} disabled={editando} />
            </label>
            <label className="campo"><span>Canal</span>
              <select value={f.canal} onChange={mudar('canal')}>
                {Object.entries(canais).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
              </select>
            </label>
            <label className="campo fi-span2"><span>Cliente *</span>
              <input type="text" value={f.cliente} onChange={mudar('cliente')} placeholder="Razão social do cliente" />
            </label>
            <label className="campo fi-span2"><span>Mix de itens</span>
              <input type="text" value={f.mix} onChange={mudar('mix')} placeholder="Ex: 50 Disjuntores Modulares" />
            </label>
            <label className="campo"><span>Faturamento bruto - PV (R$) *</span>
              <input className="mono" type="number" step="0.01" min="0" value={f.venda} onChange={mudar('venda')} />
            </label>
            <label className="campo"><span>Custo dos itens - CMV (R$) *</span>
              <input className="mono" type="number" step="0.01" min="0" value={f.custo} onChange={mudar('custo')} />
            </label>
            <label className="campo"><span>Categoria contábil</span>
              <input type="text" value={f.categoria} onChange={mudar('categoria')} placeholder="Ex: Venda B2B / Matéria-prima" />
            </label>
            <label className="campo"><span>Status</span>
              <select value={f.status} onChange={mudar('status')}>
                {Object.entries(statusLanc).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
              </select>
            </label>
          </div>

          <div className="fi-previa">
            <div><small>Lucro bruto apurado</small><strong className={`mono ${lucroV >= 0 ? 'verde' : 'erro'}`}>{lucroV >= 0 ? '+' : ''}{brl(lucroV)}</strong></div>
            <div><small>Margem bruta</small><strong className={`mono ${abaixo ? 'erro' : 'verde'}`}>{margem.toFixed(1).replace('.', ',')}%</strong></div>
            <div><small>Markup</small><strong className="mono ciano">{custo > 0 ? (((venda - custo) / custo) * 100).toFixed(1).replace('.', ',') : '0,0'}%</strong></div>
          </div>

          {abaixo && (
            <p className="fi-alerta"><TriangleAlert size={16} /> Margem abaixo do mínimo parametrizado ({MARGEM_MINIMA}%). Revise o preço de venda ou o custo antes de apurar.</p>
          )}
        </div>

        <footer>
          <button type="button" className="btn-neutro" onClick={onClose}>Cancelar</button>
          <button type="submit" className="primary-button"><Save size={15} /> {editando ? 'Salvar alterações' : 'Apurar lançamento'}</button>
        </footer>
      </form>
    </div>
  );
}