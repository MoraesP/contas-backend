import { Request, Response } from 'express';
import * as pessoaService from '../services/pessoa.service.js';
import { pessoaSchema } from '../validators/pessoa.validators.js';

export async function listar(_req: Request, res: Response): Promise<void> {
  res.json(await pessoaService.listarPessoas());
}

export async function detalhar(req: Request, res: Response): Promise<void> {
  res.json(await pessoaService.buscarPessoa(req.params.id));
}

export async function criar(req: Request, res: Response): Promise<void> {
  const dados = pessoaSchema.parse(req.body);
  res.status(201).json(await pessoaService.criarPessoa(dados));
}

export async function atualizar(req: Request, res: Response): Promise<void> {
  const dados = pessoaSchema.parse(req.body);
  res.json(await pessoaService.atualizarPessoa(req.params.id, dados));
}

export async function remover(req: Request, res: Response): Promise<void> {
  await pessoaService.removerPessoa(req.params.id);
  res.status(204).send();
}
