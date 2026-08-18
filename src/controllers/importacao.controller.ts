import { Request, Response } from 'express';
import * as importacaoService from '../services/importacao.service.js';
import { requisicaoInvalida } from '../utils/AppError.js';

export async function importar(req: Request, res: Response): Promise<void> {
  const arquivo = req.file;
  if (!arquivo) throw requisicaoInvalida('Nenhum arquivo enviado (campo "arquivo").');
  const relatorio = await importacaoService.importarPlanilha(arquivo.buffer);
  res.status(201).json(relatorio);
}
