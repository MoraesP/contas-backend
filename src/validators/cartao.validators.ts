import { z } from 'zod';

export const cartaoSchema = z.object({
  nome: z.string().trim().min(1, 'nome é obrigatório'),
  codigo: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, 'código deve ter exatamente 3 letras')
    .transform((v) => v.toUpperCase()),
  corCaracteristica: z.string().trim().optional(),
  dataFechamento: z.number().int().min(1).max(31),
  dataVencimento: z.number().int().min(1).max(31),
});

export type CartaoInput = z.infer<typeof cartaoSchema>;
