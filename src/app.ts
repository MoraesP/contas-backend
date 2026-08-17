import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler, rotaNaoEncontrada } from './middlewares/errorHandler.js';
import { requireAuth } from './middlewares/requireAuth.js';

import authRoutes from './routes/auth.routes.js';
import cartaoRoutes from './routes/cartao.routes.js';
import faturaPorCartaoRoutes from './routes/fatura-por-cartao.routes.js';
import faturaRoutes from './routes/fatura.routes.js';
import debitoPorFaturaRoutes from './routes/debito-por-fatura.routes.js';
import debitoRoutes from './routes/debito.routes.js';
import pessoaRoutes from './routes/pessoa.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

export function criarApp() {
  const app = express();

  app.use(cors({ origin: env.frontendOrigin }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));

  // Login não exige autenticação; todo o resto de /api exige.
  app.use('/api/auth', authRoutes);
  app.use('/api', requireAuth);

  app.use('/api/cartoes', cartaoRoutes);
  app.use('/api/cartoes', faturaPorCartaoRoutes);
  app.use('/api/faturas', faturaRoutes);
  app.use('/api/faturas', debitoPorFaturaRoutes);
  app.use('/api/debitos', debitoRoutes);
  app.use('/api/pessoas', pessoaRoutes);
  app.use('/api/categorias', categoriaRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use(rotaNaoEncontrada);
  app.use(errorHandler);

  return app;
}
