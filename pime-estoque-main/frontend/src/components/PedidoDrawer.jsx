import { useEffect, useMemo, useState } from 'react';
import {
  CircleCheck, CirclePlus, ClipboardList, Lock, Package, Trash2, Truck, UserSearch, Wallet, X, TriangleAlert,
} from 'lucide-react';
import { brl, centrosVenda, clientes, canais } from '../data/pedidos';
import { produtosIniciais } from '../data/produtos';

let seq = 0;
const linha = (sku, qtd, desconto = 0, preco) => {
  const p = produtosIniciais.find((x) => x.sku === sku);
  return { id: ++seq, sku, nome: p?.nome ?? sku, qtd, preco: preco ?? p?.venda ?? 0, desconto };
};

const formInicial = () => ({
  cliente: clientes[0].chave,
  canal: 'B2B',
  cd: 'CD01',
  frete: '480.00',
  tipoFrete: 'CIF',
  itens: [linha('SKU-5510-A', 200, 5), linha('SKU-1204-C', 4, 0)],
});

const totalLinha = (i) => i.qtd * i.preco * (1 - i.desconto / 100);

export default function PedidoDrawer({ aberto, pedido, proximoId, onClose, onConfirmar, onRascunho, onExcluir, onAviso }) {
  const [form, setForm] = useState(formInicial);
  const [novo, setNovo] = useState({ sku: produtosIniciais[0].sku, qtd: '10', preco: String(produtosIniciais[0].venda), desconto: '0' });
  const editando = !!pedido;

  useEffect(() => {
    if (!aberto) return;
    const base = formInicial();
    if (pedido) {
      const c = clientes.find((x) => x.nome === pedido.cliente);
      if (c) base.cliente = c.chave;
      base.canal = pedido.canal;
    }
    setForm(base);
  }, [aberto, pedido]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, onClose]);

  const { subtotal, descontos } = useMemo(() => {
    let s = 0; let d = 0;
    form.itens.forEach((i) => { s += totalLinha(i); d += i.qtd * i.preco - totalLinha(i); });
    return { subtotal: s, descontos: d };
  }, [form.itens]);
  const frete = parseFloat(form.frete) || 0;
  const total = subtotal + frete;
  const cliente = clientes.find((c) => c.chave === form.cliente);

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const mudarNovo = (campo) => (e) => setNovo((n) => ({ ...n, [campo]: e.target.value }));

  const trocarSku = (e) => {
    const p = produtosIniciais.find((x) => x.sku === e.target.value);
    setNovo((n) => ({ ...n, sku: e.target.value, preco: String(p?.venda ?? 0) }));
  };

  const incluir = () => {
    const qtd = parseInt(novo.qtd, 10) || 1;
    const item = linha(novo.sku, qtd, parseFloat(novo.desconto) || 0, parseFloat(novo.preco) || 0);
    setForm((f) => ({ ...f, itens: [...f.itens, item] }));
    onAviso('Item adicionado', `${novo.sku} inserido na alocação física.`);
  };

  const remover = (id) => setForm((f) => ({ ...f, itens: f.itens.filter((i) => i.id !== id) }));

  const payload = () => ({
    cliente: cliente.nome, cnpj: cliente.cnpj, credito: cliente.credito, canal: form.canal,
    skus: form.itens.length, qtd: form.itens.reduce((s, i) => s + i.qtd, 0), valor: total,
  });

  const confirmar = () => {
    if (form.itens.length === 0) return onAviso('Atenção', 'Inclua ao menos um SKU no pedido.');
    onConfirmar(payload());
  };

  return (
    <>
      <div className={`drawer-fundo ${aberto ? 'aberto' : ''}`} onClick={onClose} aria-hidden="true" />

      <aside className={`drawer pd-drawer ${aberto ? 'aberto' : ''}`} aria-hidden={!aberto} inert={!aberto} aria-label="Pedido de venda">
        <header className="drawer-topo">
          <div className="drawer-avatar"><ClipboardList size={20} /></div>
          <div className="drawer-titulo">
            <div>
              <strong>{editando ? 'Editar Pedido de Venda' : 'Novo Pedido de Venda'}</strong>
              <span className="drawer-codigo">#{editando ? pedido.id : `${proximoId} (Rascunho)`}</span>
            </div>
            <small>Validação fiscal, consulta de saldo em tempo real e reserva de estoque imediata.</small>
          </div>
          <button type="button" className="drawer-fechar" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </header>

        <div className="drawer-corpo">
          <section className="pd-bloco">
            <div className="pd-bloco-topo">
              <h3><UserSearch size={16} /> 1. Dados do cliente &amp; expedição</h3>
              <span className="mono verde">Limite disponível: R$ 420.000,00</span>
            </div>
            <div className="drawer-grid pd-grid-12">
              <label className="campo pd-c6"><span>Cliente cadastrado (razão social / CNPJ) *</span>
                <select value={form.cliente} onChange={mudar('cliente')}>
                  {clientes.map((c) => <option key={c.chave} value={c.chave}>{c.nome} ({c.cnpj})</option>)}
                </select>
              </label>
              <label className="campo pd-c3"><span>Canal de venda *</span>
                <select value={form.canal} onChange={mudar('canal')}>
                  {Object.entries(canais).map(([v, c]) => <option key={v} value={v}>{c.rotulo}</option>)}
                </select>
              </label>
              <label className="campo pd-c3"><span>Centro de distribuição (CD) *</span>
                <select value={form.cd} onChange={mudar('cd')}>
                  {centrosVenda.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
                </select>
              </label>
            </div>
          </section>

          <section className="pd-bloco">
            <div className="pd-bloco-topo">
              <h3><Package size={16} /> 2. Itens do pedido &amp; baixa imediata de estoque</h3>
              <span>Reserva automática no salvamento</span>
            </div>

            <div className="pd-novo">
              <label className="campo pd-flex"><span>Pesquisar SKU em estoque *</span>
                <select value={novo.sku} onChange={trocarSku}>
                  {produtosIniciais.map((p) => (
                    <option key={p.sku} value={p.sku}>{p.sku} | {p.nome} (Disp: {p.saldo} un - {brl(p.venda)})</option>
                  ))}
                </select>
              </label>
              <label className="campo pd-w80"><span>Qtd.</span>
                <input className="mono pd-centro" type="number" min="1" value={novo.qtd} onChange={mudarNovo('qtd')} />
              </label>
              <label className="campo pd-w120"><span>Preço unit. (R$)</span>
                <input className="mono pd-dir" type="number" step="0.01" value={novo.preco} onChange={mudarNovo('preco')} />
              </label>
              <label className="campo pd-w80"><span>Desc. (%)</span>
                <input className="mono pd-centro" type="number" min="0" max="100" value={novo.desconto} onChange={mudarNovo('desconto')} />
              </label>
              <button type="button" className="primary-button" onClick={incluir}><CirclePlus size={15} /> Incluir SKU</button>
            </div>

            <div className="table-wrap">
              <table className="pd-itens">
                <thead>
                  <tr>
                    <th>Item / código SKU</th><th>Disponibilidade CD</th><th className="pd-centro">Quantidade</th>
                    <th className="pd-dir">Preço unit.</th><th className="pd-dir">Desconto</th><th className="pd-dir">Subtotal</th><th className="pd-centro">Remover</th>
                  </tr>
                </thead>
                <tbody>
                  {form.itens.map((i) => {
                    const saldo = produtosIniciais.find((p) => p.sku === i.sku)?.saldo ?? 0;
                    const ok = i.qtd <= saldo;
                    return (
                      <tr key={i.id}>
                        <td><div className="celula-dupla"><span className="mono verde"><b>{i.sku}</b></span><small>{i.nome}</small></div></td>
                        <td>
                          <span className={`pd-chip ${ok ? 'verde' : 'erro'}`}>
                            {ok ? <CircleCheck size={13} /> : <TriangleAlert size={13} />}
                            {ok ? 'Saldo suficiente' : `Faltam ${i.qtd - saldo} un`}
                          </span>
                        </td>
                        <td className="mono pd-centro"><b>{i.qtd} un</b></td>
                        <td className="mono pd-dir">{brl(i.preco)}</td>
                        <td className="mono pd-dir mudo">{i.desconto.toFixed(1)}%</td>
                        <td className="mono pd-dir verde"><b>{brl(totalLinha(i))}</b></td>
                        <td className="pd-centro"><button type="button" className="pd-lixo" onClick={() => remover(i.id)} aria-label="Remover item"><Trash2 size={16} /></button></td>
                      </tr>
                    );
                  })}
                  {form.itens.length === 0 && <tr><td colSpan={7} className="vazio">Nenhum item no pedido.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <div className="pd-duplo">
            <section className="pd-bloco">
              <div className="pd-bloco-topo"><h3><Truck size={16} /> Logística &amp; despacho</h3></div>
              <div className="drawer-grid">
                <label className="campo"><span>Modalidade frete</span>
                  <select value={form.tipoFrete} onChange={mudar('tipoFrete')}>
                    <option value="CIF">CIF (por conta do emitente)</option>
                    <option value="FOB">FOB (por conta do destinatário)</option>
                  </select>
                </label>
                <label className="campo"><span>Valor do frete (R$)</span>
                  <input className="mono pd-dir" type="number" value={form.frete} onChange={mudar('frete')} />
                </label>
              </div>
              <label className="campo"><span>Transportadora homologada</span>
                <select>
                  <option>Braspress Transportes Urgentes (SLA 48h)</option>
                  <option>Jadlog Express Logística</option>
                  <option>Frota Própria NexusStock Dedicada</option>
                </select>
              </label>
            </section>

            <section className="pd-bloco">
              <div className="pd-bloco-topo"><h3><Wallet size={16} /> Condição comercial</h3></div>
              <div className="drawer-grid">
                <label className="campo"><span>Condição de pagamento</span>
                  <select>
                    <option>Boleto Faturado 30/60 Dias</option>
                    <option>Boleto À Vista (3% desc)</option>
                    <option>PIX Instantâneo QR Code</option>
                    <option>Cartão Crédito Corporativo</option>
                  </select>
                </label>
                <label className="campo"><span>Natureza da operação</span>
                  <select>
                    <option>5.102 - Venda Mercadoria</option>
                    <option>5.910 - Remessa Bonificação</option>
                    <option>6.102 - Venda Interestadual</option>
                  </select>
                </label>
              </div>
             
                
            </section>
          </div>

          <section className="pd-fechamento">
            <div className="pd-bloco-topo"><h3>Fechamento do pedido</h3><span className="mono verde">Regra tributária: ICMS/ST calculado automaticamente</span></div>
            <div className="pd-totais">
              <div><small>Subtotal produtos:</small><strong className="mono">{brl(subtotal)}</strong></div>
              <div><small>Frete (+):</small><strong className="mono">{brl(frete)}</strong></div>
              <div><small>Descontos (-):</small><strong className="mono ciano">{brl(descontos)}</strong></div>
              <div><small>Valor total do pedido:</small><strong className="mono verde grande">{brl(total)}</strong></div>
            </div>
          </section>
        </div>

        <footer className="drawer-rodape">
          {editando ? (
            <button type="button" className="btn-perigo" onClick={() => onExcluir(pedido)}><Trash2 size={15} /> Excluir pedido</button>
          ) : <span />}
          <div>
            <button type="button" className="btn-neutro" onClick={onClose}>Fechar sem salvar</button>
            <button type="button" className="btn-neutro" onClick={() => onRascunho(payload())}>Salvar orçamento</button>
            <button type="button" className="primary-button" onClick={confirmar}><Lock size={15} /> Confirmar pedido &amp; baixar estoque</button>
          </div>
        </footer>
      </aside>
    </>
  );
}