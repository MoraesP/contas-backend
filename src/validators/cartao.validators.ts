import { z } from 'zod';

export const cartaoSchema = z.object({
  nome: z.string().trim().min(1, 'nome é obrigatório'),
  corCaracteristica: z.string().trim().optional(),
  dataFechamento: z.number().int().min(1).max(31),
  dataVencimento: z.number().int().min(1).max(31),
});

export type CartaoInput = z.infer<typeof cartaoSchema>;
