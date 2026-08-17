import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as debitoController from '../controllers/debito.controller.js';

// Montado em /api/debitos
const router = Router();

router.put('/:id', asyncHandler(debitoController.atualizar));
router.delete('/:id', asyncHandler(debitoController.remover));

export default router;
