import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as faturaController from '../controllers/fatura.controller.js';

// Montado em /api/cartoes
const router = Router();

router.get('/:cartaoId/faturas', asyncHandler(faturaController.listarDoCartao));
router.get('/:cartaoId/faturas/aberta', asyncHandler(faturaController.aberta));
router.get('/:cartaoId/faturas/candidatos-rollover', asyncHandler(faturaController.candidatos));
router.post('/:cartaoId/faturas', asyncHandler(faturaController.abrirNovoMes));

export default router;
