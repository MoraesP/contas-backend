import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as categoriaController from '../controllers/categoria.controller.js';

const router = Router();

router.get('/', asyncHandler(categoriaController.listar));
router.post('/', asyncHandler(categoriaController.criar));
router.delete('/:id', asyncHandler(categoriaController.remover));

export default router;
