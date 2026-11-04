import { pool } from '../config/db.js';

// Executa o trabalho dentro de uma transação: confirma se tudo der certo e desfaz se algo falhar.
export async function comTransacao(trabalho) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const resultado = await trabalho(conexao);
    await conexao.commit();
    return resultado;
  } catch (err) {
    await conexao.rollback();
    throw err;
  } finally {
    conexao.release();
  }
}
