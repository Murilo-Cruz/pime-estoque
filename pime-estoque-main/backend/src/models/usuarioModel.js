import { pool } from '../config/db.js';

export async function buscarPorEmail(email) {
  const [linhas] = await pool.query(
    'SELECT id_usuario, nom_usuario, des_email, des_password FROM usuario WHERE des_email = ?',
    [email]
  );
  return linhas[0] ?? null;
}

export async function criar({ nome, email, senhaHash }) {
  const [resultado] = await pool.query(
    'INSERT INTO usuario (nom_usuario, des_email, des_password) VALUES (?, ?, ?)',
    [nome, email, senhaHash]
  );
  return resultado.insertId;
}