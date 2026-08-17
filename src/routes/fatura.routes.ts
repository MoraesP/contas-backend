import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as faturaController from '../controllers/fatura.controller.js';

// Montado em /api/faturas
const router = Router();

router.get('/', asyncHandler(faturaController.listarFechadas));
router.get('/:id', asyncHandler(faturaController.detalhar));
router.post('/:id/fechar', asyncHandler(faturaController.fechar));

export default router;
