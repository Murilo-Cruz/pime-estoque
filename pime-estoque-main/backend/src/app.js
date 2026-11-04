import express from 'express';
import cors from 'cors';
import { pool } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import emitenteRoutes from './routes/emitenteRoutes.js';
import produtoRoutes from './routes/produtoRoutes.js';
import entradaRoutes from './routes/entradaRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import financeiroRoutes from './routes/financeiroRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { rotaNaoEncontrada, tratadorDeErros } from './utils/erros.js';

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
app.use('/emitentes', emitenteRoutes);
app.use('/produtos', produtoRoutes);
app.use('/entradas', entradaRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/financeiro', financeiroRoutes);
app.use('/dashboard', dashboardRoutes);

app.use(rotaNaoEncontrada);
app.use(tratadorDeErros);

export default app;
