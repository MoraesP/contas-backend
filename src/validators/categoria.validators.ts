import { z } from 'zod';

export const categoriaSchema = z.object({
  nome: z.string().trim().min(1, 'nome é obrigatório'),
});

export type CategoriaInput = z.infer<typeof categoriaSchema>;
