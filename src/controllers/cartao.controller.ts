import { Request, Response } from 'express';
import * as cartaoService from '../services/cartao.service.js';
import { cartaoSchema } from '../validators/cartao.validators.js';

export async function listar(_req: Request, res: Response): Promise<void> {
  res.json(await cartaoService.listarCartoes());
}

export async function detalhar(req: Request, res: Response): Promise<void> {
  res.json(await cartaoService.buscarCartao(req.params.id));
}

export async function criar(req: Request, res: Response): Promise<void> {
  const dados = cartaoSchema.parse(req.body);
  res.status(201).json(await cartaoService.criarCartao(dados));
}

export async function atualizar(req: Request, res: Response): Promise<void> {
  const dados = cartaoSchema.parse(req.body);
  res.json(await cartaoService.atualizarCartao(req.params.id, dados));
}

export async function remover(req: Request, res: Response): Promise<void> {
  await cartaoService.removerCartao(req.params.id);
  res.status(204).send();
}
