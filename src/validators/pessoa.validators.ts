import { z } from 'zod';

export const pessoaSchema = z.object({
  nome: z.string().trim().min(1, 'nome é obrigatório'),
  cor: z.string().trim().optional(),
});

export type PessoaInput = z.infer<typeof pessoaSchema>;
