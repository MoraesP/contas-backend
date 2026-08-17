import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as dashboardController from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/', asyncHandler(dashboardController.obter));

export default router;
