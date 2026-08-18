import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';
import { AppError } from '../utils/AppError.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { message: err.message, code: err.code } });
    return;
  }

  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: { message: `Arquivo inválido: ${err.message}`, code: 'REQUISICAO_INVALIDA' } });
    return;
  }

  if (err instanceof ZodError) {
    const primeira = err.issues[0];
    const mensagem = primeira ? `${primeira.path.join('.')}: ${primeira.message}` : 'Dados inválidos.';
    res.status(400).json({ error: { message: mensagem, code: 'REQUISICAO_INVALIDA' } });
    return;
  }

  // Índice único do Mongo violado (ex: fatura duplicada, categoria duplicada)
  if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === 11000) {
    res.status(409).json({ error: { message: 'Já existe um registro com esses dados.', code: 'CONFLITO' } });
    return;
  }

  console.error(err);
  res.status(500).json({ error: { message: 'Erro interno do servidor.', code: 'ERRO_INTERNO' } });
}

export function rotaNaoEncontrada(_req: Request, res: Response): void {
  res.status(404).json({ error: { message: 'Rota não encontrada.', code: 'ROTA_NAO_ENCONTRADA' } });
}
