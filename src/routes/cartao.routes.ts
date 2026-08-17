import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as cartaoController from '../controllers/cartao.controller.js';

const router = Router();

router.get('/', asyncHandler(cartaoController.listar));
router.post('/', asyncHandler(cartaoController.criar));
router.get('/:id', asyncHandler(cartaoController.detalhar));
router.put('/:id', asyncHandler(cartaoController.atualizar));
router.delete('/:id', asyncHandler(cartaoController.remover));

export default router;
