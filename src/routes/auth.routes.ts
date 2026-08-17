import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { naoAutorizado } from '../utils/AppError.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, senha } = loginSchema.parse(req.body);

    const emailConfere = email.toLowerCase() === env.adminEmail.toLowerCase();
    const senhaConfere = emailConfere && (await bcrypt.compare(senha, env.adminPasswordHash));

    if (!senhaConfere) {
      throw naoAutorizado('E-mail ou senha inválidos.');
    }

    const token = jwt.sign({ sub: env.adminEmail }, env.jwtSecret, { expiresIn: '7d' });
    res.json({ token });
  }),
);

export default router;
