import { useEffect, useState } from 'react';
import { BadgeCheck, Contact, CreditCard, Receipt, Save, Trash2, Truck, X } from 'lucide-react';
import { segmentos } from '../data/clientes';

const abas = [
  { id: 'dados', rotulo: 'Dados Cadastrais', icone: Contact },
  { id: 'endereco', rotulo: 'Endereço & Logística', icone: Truck },

  { id: 'historico', rotulo: 'Histórico', icone: Receipt },
];

function Campo({ rotulo, span = 1, children }) {
  return (
    <label className="campo" style={{ gridColumn: `span ${span}` }}>
      <span>{rotulo}</span>
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

export default function ClienteDrawer({ aberto, cliente, onClose }) {
  const [aba, setAba] = useState('dados');
  const [habilitado, setHabilitado] = useState(true);
  const novo = !cliente;

  useEffect(() => {
    if (aberto) setAba('dados');
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, onClose]);

  const iniciais = novo
    ? '+'
    : cliente.razao.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();

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
              {!novo && <span className="drawer-codigo">#{cliente.codigo}</span>}
            </div>
            {!novo && <small>Última sincronização SEFAZ há 2 horas</small>}
          </div>
          <button type="button" className="drawer-fechar" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        <nav className="drawer-abas">
          {abas.map(({ id, rotulo, icone: Icone }) => (
            <button
              key={id}
              type="button"
              className={aba === id ? 'ativa' : ''}
              onClick={() => setAba(id)}
            >
              <Icone size={14} /> {rotulo}
            </button>
          ))}
        </nav>

        {/* key recarrega os defaultValue quando troca de cliente */}
        <div className="drawer-corpo" key={cliente?.codigo ?? 'novo'}>
          
            
            
            
              
          

          {aba === 'dados' && (
            <Secao titulo="Identificação fiscal & jurídica">
              <Campo rotulo="Razão social completa" span={2}>
                <input type="text" defaultValue={cliente?.razaoCompleta ?? cliente?.razao ?? ''} />
              </Campo>
              <Campo rotulo="Nome fantasia">
                <input type="text" defaultValue={cliente?.fantasia ?? ''} />
              </Campo>
              <Campo rotulo="Segmento de mercado">
                <select defaultValue={cliente?.segmento ?? segmentos[0]}>
                  {segmentos.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Campo>
              <Campo rotulo="CNPJ">
                <input className="mono" type="text" defaultValue={cliente?.cnpj ?? ''} />
              </Campo>
              <Campo rotulo="Inscrição estadual (IE)">
                <input className="mono" type="text" defaultValue={cliente?.ie ?? ''} />
              </Campo>
              <Campo rotulo="E-mail financeiro ">
                <input type="email" defaultValue={cliente?.emailFinanceiro ?? cliente?.email ?? ''} />
              </Campo>
              <Campo rotulo="Telefone / WhatsApp comercial">
                <input className="mono" type="text" defaultValue={cliente?.telefone ?? ''} />
              </Campo>
            </Secao>
          )}

          {aba === 'endereco' && (
            <Secao titulo="Endereço de entrega & logística" colunas={3}>
              <Campo rotulo="CEP">
                <input className="mono" type="text" defaultValue={cliente?.cep ?? ''} />
              </Campo>
              <Campo rotulo="Logradouro / avenida" span={2}>
                <input type="text" defaultValue={cliente?.logradouro ?? ''} />
              </Campo>
              <Campo rotulo="Número">
                <input type="text" defaultValue={cliente?.numero ?? ''} />
              </Campo>
              <Campo rotulo="Bairro">
                <input type="text" defaultValue={cliente?.bairro ?? ''} />
              </Campo>
              <Campo rotulo="Cidade / UF">
                <input type="text" defaultValue={cliente?.cidade ?? ''} />
              </Campo>
            </Secao>
          )}

          
             
           
        

          {aba === 'historico' && (
            <p className="drawer-vazio">O histórico de pedidos e notas deste cliente aparecerá aqui.</p>
          )}
        </div>

        <footer className="drawer-rodape">
          <button type="button" className="btn-perigo">
            <Trash2 size={15} /> Excluir
          </button>
          <div>
            <button type="button" className="btn-neutro" onClick={onClose}>Cancelar</button>
            <button type="button" className="primary-button" onClick={onClose}>
              <Save size={15} /> Salvar alterações
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}