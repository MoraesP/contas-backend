import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service.js';

export async function obter(req: Request, res: Response): Promise<void> {
  const cartaoId = typeof req.query.cartaoId === 'string' ? req.query.cartaoId : undefined;
  res.json(await dashboardService.obterDashboard(cartaoId));
}
