import { Request, Response } from 'express';
import * as faturaService from '../services/fatura.service.js';
import { abrirNovoMesSchema } from '../validators/fatura.validators.js';
import { DebitoModel } from '../models/Debito.js';

export async function listarDoCartao(req: Request, res: Response): Promise<void> {
  res.json(await faturaService.listarFaturasDoCartao(req.params.cartaoId));
}

export async function aberta(req: Request, res: Response): Promise<void> {
  const fatura = await faturaService.buscarFaturaAberta(req.params.cartaoId);
  if (!fatura) {
    res.status(404).json({ error: { message: 'Nenhuma fatura aberta para este cartão.', code: 'NAO_ENCONTRADO' } });
    return;
  }
  res.json(fatura);
}

export async function candidatos(req: Request, res: Response): Promise<void> {
  res.json(await faturaService.candidatosRollover(req.params.cartaoId));
}

export async function abrirNovoMes(req: Request, res: Response): Promise<void> {
  const { mesReferencia, idsParaRolar } = abrirNovoMesSchema.parse(req.body);
  const fatura = await faturaService.abrirNovoMes(req.params.cartaoId, mesReferencia, idsParaRolar);
  res.status(201).json(fatura);
}

export async function listarFechadas(req: Request, res: Response): Promise<void> {
  const cartaoId = typeof req.query.cartaoId === 'string' ? req.query.cartaoId : undefined;
  res.json(await faturaService.listarFaturasFechadas({ cartaoId }));
}

export async function detalhar(req: Request, res: Response): Promise<void> {
  const fatura = await faturaService.buscarFatura(req.params.id);
  const debitos = await DebitoModel.find({ faturaId: fatura._id });
  res.json({ ...fatura.toObject(), debitos });
}

export async function fechar(req: Request, res: Response): Promise<void> {
  res.json(await faturaService.fecharFatura(req.params.id));
}
