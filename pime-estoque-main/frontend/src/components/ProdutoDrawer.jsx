import { useEffect, useState } from 'react';
import { Package, Save, Trash2, X } from 'lucide-react';
import { brl, inteiro } from '../utils/formatos';

const vazio = { key_produto: '', nom_produto: '', vlr_venda: '', qtd_min_estoque: '0', idc_status: 'ATIVO' };

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
  const [salvando, setSalvando] = useState(false);
  const novo = !produto;

  useEffect(() => {
    if (!aberto) return;
    setForm(
      produto
        ? {
            key_produto: produto.key_produto,
            nom_produto: produto.nom_produto,
            vlr_venda: String(produto.vlr_venda),
            qtd_min_estoque: String(produto.qtd_min_estoque),
            idc_status: produto.idc_status,
          }
        : vazio,
    );
  }, [aberto, produto]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, onClose]);

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function salvar() {
    if (!form.key_produto.trim() || !form.nom_produto.trim() || form.vlr_venda === '' || form.qtd_min_estoque === '') {
      onErro('Preencha os campos obrigatórios (*)');
      return;
    }
    setSalvando(true);
    await onSalvar({
      key_produto: form.key_produto.trim(),
      nom_produto: form.nom_produto.trim(),
      vlr_venda: Number(form.vlr_venda),
      qtd_min_estoque: Number(form.qtd_min_estoque),
      idc_status: form.idc_status,
    });
    setSalvando(false);
  }

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
              {!novo && <span className="drawer-codigo">#{produto.key_produto}</span>}
            </div>
            <small>
              {novo
                ? 'O saldo e o custo médio começam zerados e são atualizados pelas entradas de estoque'
                : `Saldo atual: ${inteiro(produto.qtd_estoque)} un • Custo médio: ${brl(produto.vlr_custo_medio)}`}
            </small>
          </div>
          <button type="button" className="drawer-fechar" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        <div className="drawer-corpo">
          <Secao titulo="01. Identificação">
            <Campo rotulo="Código SKU" obrigatorio>
              <input className="mono" type="text" maxLength={50} value={form.key_produto} onChange={mudar('key_produto')} placeholder="Ex: SKU-9040-X" />
            </Campo>
            <Campo rotulo="Status">
              <select value={form.idc_status} onChange={mudar('idc_status')}>
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </Campo>
            <Campo rotulo="Nome / descrição do produto" obrigatorio span={2}>
              <input type="text" maxLength={150} value={form.nom_produto} onChange={mudar('nom_produto')} placeholder="Ex: Controlador de Carga MPPT 60A" />
            </Campo>
          </Secao>

          <Secao titulo="02. Preço & reposição">
            <Campo rotulo="Preço de venda (R$)" obrigatorio>
              <input className="mono" type="number" min="0" step="0.01" value={form.vlr_venda} onChange={mudar('vlr_venda')} placeholder="0.00" />
            </Campo>
            <Campo rotulo="Estoque mínimo" obrigatorio>
              <input className="mono" type="number" min="0" step="1" value={form.qtd_min_estoque} onChange={mudar('qtd_min_estoque')} placeholder="0" />
            </Campo>
          </Secao>
        </div>

        <footer className="drawer-rodape">
          {novo ? <span /> : (
            <button type="button" className="btn-perigo" onClick={() => onExcluir(produto)}>
              <Trash2 size={15} /> Excluir produto
            </button>
          )}
          <div>
            <button type="button" className="btn-neutro" onClick={onClose}>Descartar</button>
            <button type="button" className="primary-button" onClick={salvar} disabled={salvando}>
              <Save size={15} /> {salvando ? 'Salvando…' : 'Salvar produto'}
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}
