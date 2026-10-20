import express from 'express';
import cors from 'cors';
import { pool } from './config/db.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors({ origin: process.env.FRONT_URL ?? 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'conectado' });
  } catch (err) {
    res.status(500).json({ status: 'erro', db: err.message });
  }
});

app.use('/auth', authRoutes);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno no servidor.' });
});

export default app;