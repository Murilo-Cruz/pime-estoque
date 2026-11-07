import { useCallback, useEffect, useState } from 'react';
import {
  Activity, ArrowDownToLine, ArrowUpFromLine, Boxes, Package, ShoppingCart,
  TrendingUp, TriangleAlert, Wallet, CircleDollarSign,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { brl, dataBR, inteiro } from '../utils/formatos';

const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

function Cards({ lista, rotulo }) {
  return (
    <section className="stats-grid" aria-label={rotulo}>
      {lista.map(({ titulo, valor, detalhe, icone: Icone, cor }) => (
        <article className="stat-card" key={titulo}>
          <div className="stat-card-top">
            <span>{titulo}</span>
            <span className={`stat-icon ${cor}`}><Icone size={19} /></span>
          </div>
          <strong>{valor}</strong>
          <p><TrendingUp size={14} /> {detalhe}</p>
        </article>
      ))}
    </section>
  );
}

export default function Dashboard() {
  const chamar = useApi();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setErro('');
    try {
      setDados(await chamar('/dashboard'));
    } catch (e) {
      setErro(e.message);
    }
  }, [chamar]);

  useEffect(() => { carregar(); }, [carregar]);

  const ind = dados?.indicadores;
  const resumo = ind && [
    { titulo: 'Produtos ativos', valor: inteiro(ind.produtos_ativos), detalhe: `${inteiro(ind.estoque_baixo)} com estoque baixo`, icone: Boxes, cor: 'green' },
    { titulo: 'Entradas do mês', valor: inteiro(ind.entradas_mes), detalhe: 'Desde o dia 1º do mês', icone: ArrowDownToLine, cor: 'cyan' },
    { titulo: 'Saídas do mês', valor: inteiro(ind.qtd_saidas_mes), detalhe: `${inteiro(ind.vendas_mes)} venda(s) finalizada(s)`, icone: ArrowUpFromLine, cor: 'green' },
    { titulo: 'Pedidos pendentes', valor: inteiro(ind.pedidos_pendentes), detalhe: 'Em preparação', icone: ShoppingCart, cor: 'cyan' },
  ];
  const financeiro = ind && [
    { titulo: 'Valor em estoque (custo)', valor: brl(ind.vlr_estoque), detalhe: 'Saldo × custo médio dos ativos', icone: Wallet, cor: 'cyan' },
    { titulo: 'Receita do mês', valor: brl(ind.vlr_receita_mes), detalhe: 'Pedidos finalizados', icone: CircleDollarSign, cor: 'green' },
    { titulo: 'Lucro bruto do mês', valor: brl(ind.vlr_lucro_mes), detalhe: 'Receita − custo médio', icone: TrendingUp, cor: 'green' },
    { titulo: 'Estoque baixo', valor: inteiro(ind.estoque_baixo), detalhe: 'Saldo ≤ estoque mínimo', icone: TriangleAlert, cor: 'cyan' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow"><Activity size={14} /> VISÃO GERAL</span>
          <h1>Dashboard</h1>
          <p>Acompanhe os indicadores e a movimentação do seu estoque.</p>
        </div>
        <div className="dashboard-date">{hoje}</div>
      </div>

      {erro && (
        <div className="aviso-erro">
          <span>Não foi possível carregar o dashboard: {erro}</span>
          <button type="button" onClick={carregar}>Tentar novamente</button>
        </div>
      )}

      {!dados && !erro && <p className="carregando">Carregando indicadores…</p>}

      {dados && (
        <>
          <Cards lista={resumo} rotulo="Resumo do estoque" />
          <Cards lista={financeiro} rotulo="Resumo financeiro do mês" />

          <section className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h2>Movimentações recentes</h2>
                <p>Últimas entradas de estoque e vendas finalizadas</p>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Parceiro</th>
                    <th>Tipo</th>
                    <th>Data</th>
                    <th>Quantidade</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.movimentacoes_recentes.map((m) => {
                    const entrada = m.idc_tipo === 'ENTRADA';
                    return (
                      <tr key={`${m.idc_tipo}-${m.id}`}>
                        <td>
                          <div className="product-cell">
                            <span className="product-icon"><Package size={17} /></span>
                            <span>
                              <strong>{m.nom_parceiro}</strong>
                              <small>{entrada ? 'Entrada' : 'Pedido'} #{m.id}</small>
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`movement-type ${entrada ? 'entrada' : 'saida'}`}>
                            {entrada ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td>{dataBR(m.dat_movimento)}</td>
                        <td className={entrada ? 'quantity-positive' : 'quantity-negative'}>
                          {entrada ? '+' : '-'}{inteiro(m.qtd_unidades)} un.
                        </td>
                        <td>{brl(m.vlr_total)}</td>
                      </tr>
                    );
                  })}
                  {dados.movimentacoes_recentes.length === 0 && (
                    <tr><td colSpan={5} className="vazio">Nenhuma movimentação registrada ainda.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="dashboard-panel" style={{ marginTop: 24 }}>
            <div className="panel-heading">
              <div>
                <h2>Produtos com estoque baixo</h2>
                <p>Ativos com saldo igual ou abaixo do mínimo (5 mais críticos)</p>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Produto</th><th>SKU</th><th>Saldo</th><th>Mínimo</th></tr>
                </thead>
                <tbody>
                  {dados.produtos_estoque_baixo.map((p) => (
                    <tr key={p.id_produto}>
                      <td><strong>{p.nom_produto}</strong></td>
                      <td>{p.key_produto}</td>
                      <td className="quantity-negative">{inteiro(p.qtd_estoque)} un.</td>
                      <td>{inteiro(p.qtd_min_estoque)} un.</td>
                    </tr>
                  ))}
                  {dados.produtos_estoque_baixo.length === 0 && (
                    <tr><td colSpan={4} className="vazio">Nenhum produto abaixo do estoque mínimo.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
