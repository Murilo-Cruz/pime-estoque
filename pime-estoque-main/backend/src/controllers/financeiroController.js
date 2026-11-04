import * as Financeiro from '../models/financeiroModel.js';
import { ErroHttp } from '../utils/erros.js';
import { hojeISO, somarDias } from '../utils/datas.js';
import { arred, dataISO } from '../utils/validacao.js';

// GET /financeiro?de=AAAA-MM-DD&ate=AAAA-MM-DD  (padrão: últimos 30 dias)
export async function obter(req, res) {
  const hoje = hojeISO();
  const ate = dataISO(req.query.ate, 'Até') ?? hoje;
  const de = dataISO(req.query.de, 'De') ?? somarDias(ate, -29);
  if (de > ate) throw new ErroHttp(400, 'A data inicial não pode ser maior que a final.');

  const [resumo, vendas, produtos, dias] = await Promise.all([
    Financeiro.resumo(de, ate),
    Financeiro.vendas(de, ate),
    Financeiro.porProduto(de, ate),
    Financeiro.porDia(de, ate),
  ]);

  res.json({
    periodo: { de, ate },
    resumo: {
      ...resumo,
      vlr_margem: resumo.vlr_receita > 0 ? arred(resumo.vlr_lucro / resumo.vlr_receita) : 0,
      vlr_ticket_medio: resumo.qtd_pedidos > 0 ? arred(resumo.vlr_receita / resumo.qtd_pedidos) : 0,
    },
    vendas,
    por_produto: produtos,
    por_dia: dias,
  });
}
