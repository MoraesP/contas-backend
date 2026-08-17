import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as debitoController from '../controllers/debito.controller.js';

// Montado em /api/faturas
const router = Router();

router.get('/:faturaId/debitos', asyncHandler(debitoController.listarPorFatura));
router.post('/:faturaId/debitos', asyncHandler(debitoController.criar));

export default router;
