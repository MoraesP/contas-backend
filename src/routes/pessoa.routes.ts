import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as pessoaController from '../controllers/pessoa.controller.js';

const router = Router();

router.get('/', asyncHandler(pessoaController.listar));
router.post('/', asyncHandler(pessoaController.criar));
router.get('/:id', asyncHandler(pessoaController.detalhar));
router.put('/:id', asyncHandler(pessoaController.atualizar));
router.delete('/:id', asyncHandler(pessoaController.remover));

export default router;
