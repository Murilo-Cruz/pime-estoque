import { useEffect, useState } from 'react';
import { Package, Save, Trash2, X } from 'lucide-react';
import { armazens, categorias, unidades } from '../data/produtos';

const vazio = {
  sku: '', ean: '', nome: '', marca: '', unidade: 'UN', categoria: 'controladores',
  custo: '', margemAlvo: '', venda: '', ncm: '', icms: '18', tributos: '9.25%',
  minimo: '20', reposicao: '', maximo: '', cd: 'cd01', local: '', peso: '',
};

function Campo({ rotulo, obrigatorio, span = 1, children }) {
  return (
    <label className="campo" style={{ gridColumn: `span ${span}` }}>
      <span>{rotulo} {obrigatorio && <b className="obrigatorio">*</b>}</span>
      {children}
    </label>
  );
}

function Secao({ titulo, colunas = 2, children }) {
  return (
    <div className="drawer-secao">
      <h3>{titulo}</h3>
      <div className="drawer-grid" style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }}>
        {children}
      </div>
    </div>
  );
}

export default function ProdutoDrawer({ aberto, produto, onClose, onSalvar, onExcluir, onErro }) {
  const [form, setForm] = useState(vazio);
  const novo = !produto;

 
  useEffect(() => {
    if (!aberto) return;
    setForm(
      produto
        ? { ...vazio, ...produto, custo: String(produto.custo), venda: String(produto.venda), minimo: String(produto.minimo), maximo: String(produto.maximo ?? '') }
        : { ...vazio, sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}-N` },
    );
  }, [aberto, produto]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, onClose]);

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const salvar = () => {
    if (!form.sku.trim() || !form.nome.trim() || form.custo === '' || form.venda === '' || !form.ncm.trim() || form.minimo === '') {
      onErro('Preencha os campos obrigatórios (*)');
      return;
    }
    onSalvar({
      ...form,
      custo: Number(form.custo),
      venda: Number(form.venda),
      minimo: Number(form.minimo),
      maximo: form.maximo === '' ? null : Number(form.maximo),
    });
  };

  return (
    <>
      <div className={`drawer-fundo ${aberto ? 'aberto' : ''}`} onClick={onClose} aria-hidden="true" />

      <aside
        className={`drawer drawer-produto ${aberto ? 'aberto' : ''}`}
        aria-hidden={!aberto}
        inert={!aberto}
        aria-label={novo ? 'Novo produto' : 'Editar produto'}
      >
        <header className="drawer-topo">
          <div className="drawer-avatar"><Package size={20} /></div>
          <div className="drawer-titulo">
            <div>
              <strong>{novo ? 'Cadastro de Novo Produto' : 'Editar Produto'}</strong>
              {!novo && <span className="drawer-codigo">#{produto.sku}</span>}
            </div>
            <small>
              {novo
                ? 'Informe os dados tributários, precificação e localização para criar o SKU'
                : `Saldo físico atual: ${produto.saldo} unidades registradas em armazém`}
            </small>
          </div>
          <button type="button" className="drawer-fechar" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        <div className="drawer-corpo">
          <Secao titulo="01. Identificação geral">
            <Campo rotulo="Código SKU" obrigatorio>
              <input className="mono" type="text" value={form.sku} onChange={mudar('sku')} placeholder="Ex: SKU-9040-X" disabled={!novo} />
            </Campo>
            <Campo rotulo="Código de barras (EAN-13 / GTIN)">
              <input className="mono" type="text" value={form.ean} onChange={mudar('ean')} placeholder="789895012..." />
            </Campo>
            <Campo rotulo="Nome / descrição comercial do item" obrigatorio span={2}>
              <input type="text" value={form.nome} onChange={mudar('nome')} placeholder="Ex: Inversor Solar Trifásico 15kW 380V Industrial" />
            </Campo>
            <Campo rotulo="Marca / fabricante">
              <input type="text" value={form.marca} onChange={mudar('marca')} placeholder="Ex: Nexus Solares Inc." />
            </Campo>
            <Campo rotulo="Unidade de medida">
              <select value={form.unidade} onChange={mudar('unidade')}>
                {unidades.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
              </select>
            </Campo>
            <Campo rotulo="Categoria" span={2}>
              <select value={form.categoria} onChange={mudar('categoria')}>
                {categorias.map((c) => <option key={c.valor} value={c.valor}>{c.rotulo}</option>)}
              </select>
            </Campo>
          </Secao>

          <Secao titulo="02. Custos, precificação & tributos" colunas={3}>
            <Campo rotulo="Preço de custo (R$)" obrigatorio>
              <input className="mono" type="number" step="0.01" value={form.custo} onChange={mudar('custo')} placeholder="0.00" />
            </Campo>
            <Campo rotulo="Margem alvo (%)">
              <input className="mono" type="number" step="0.1" value={form.margemAlvo} onChange={mudar('margemAlvo')} placeholder="40.0" />
            </Campo>
            <Campo rotulo="Preço venda final (R$)" obrigatorio>
              <input className="mono" type="number" step="0.01" value={form.venda} onChange={mudar('venda')} placeholder="0.00" />
            </Campo>



          </Secao>

          <Secao titulo="03. Parâmetros logísticos & armazenamento" colunas={3}>
            <Campo rotulo="Estoque mínimo" obrigatorio>
              <input className="mono" type="number" value={form.minimo} onChange={mudar('minimo')} placeholder="50" />
            </Campo>

            <Campo rotulo="Estoque máximo">
              <input className="mono" type="number" value={form.maximo} onChange={mudar('maximo')} placeholder="300" />
            </Campo>

            <Campo rotulo="Peso líquido (kg)">
              <input className="mono" type="number" step="0.01" value={form.peso} onChange={mudar('peso')} placeholder="4.20" />
            </Campo>
          </Secao>
        </div>

        <footer className="drawer-rodape">
          {novo ? <span /> : (
            <button type="button" className="btn-perigo" onClick={() => onExcluir(produto)}>
              <Trash2 size={15} /> Inativar SKU
            </button>
          )}
          <div>
            <button type="button" className="btn-neutro" onClick={onClose}>Descartar</button>
            <button type="button" className="primary-button" onClick={salvar}>
              <Save size={15} /> Salvar SKU
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}