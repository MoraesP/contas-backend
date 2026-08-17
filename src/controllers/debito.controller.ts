import { Request, Response } from 'express';
import * as debitoService from '../services/debito.service.js';
import { atualizarDebitoSchema, criarDebitoSchema } from '../validators/debito.validators.js';

export async function listarPorFatura(req: Request, res: Response): Promise<void> {
  res.json(await debitoService.listarPorFatura(req.params.faturaId));
}

export async function criar(req: Request, res: Response): Promise<void> {
  const dados = criarDebitoSchema.parse(req.body);
  res.status(201).json(await debitoService.criarDebito(req.params.faturaId, dados));
}

export async function atualizar(req: Request, res: Response): Promise<void> {
  const dados = atualizarDebitoSchema.parse(req.body);
  res.json(await debitoService.atualizarDebito(req.params.id, dados));
}

export async function remover(req: Request, res: Response): Promise<void> {
  await debitoService.removerDebito(req.params.id);
  res.status(204).send();
}
