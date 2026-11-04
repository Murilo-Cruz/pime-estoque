import * as Dashboard from '../models/dashboardModel.js';

export async function obter(req, res) {
  const [indicadores, movimentacoes, estoqueBaixo] = await Promise.all([
    Dashboard.indicadores(),
    Dashboard.movimentacoes(10),
    Dashboard.produtosEstoqueBaixo(5),
  ]);
  res.json({ indicadores, movimentacoes_recentes: movimentacoes, produtos_estoque_baixo: estoqueBaixo });
}
