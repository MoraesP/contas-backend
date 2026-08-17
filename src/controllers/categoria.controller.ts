import { Request, Response } from 'express';
import * as categoriaService from '../services/categoria.service.js';
import { categoriaSchema } from '../validators/categoria.validators.js';

export async function listar(_req: Request, res: Response): Promise<void> {
  res.json(await categoriaService.listarCategorias());
}

export async function criar(req: Request, res: Response): Promise<void> {
  const dados = categoriaSchema.parse(req.body);
  res.status(201).json(await categoriaService.criarCategoria(dados));
}

export async function remover(req: Request, res: Response): Promise<void> {
  await categoriaService.removerCategoria(req.params.id);
  res.status(204).send();
}
