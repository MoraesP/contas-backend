import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { naoAutorizado } from '../utils/AppError.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

  if (!token) {
    next(naoAutorizado('Faça login para continuar.'));
    return;
  }

  try {
    jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    next(naoAutorizado('Sessão expirada ou inválida. Faça login novamente.'));
  }
}
