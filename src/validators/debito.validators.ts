import { z } from 'zod';

const camposComuns = {
  descricao: z.string().trim().min(1, 'descrição é obrigatória'),
  dataCompra: z.coerce.date(),
  pessoaId: z.string().optional(),
  categoriaId: z.string().optional(),
};

export const criarDebitoSchema = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('unico'), valor: z.number().int().positive(), ...camposComuns }),
  z.object({ tipo: z.literal('fixo'), valor: z.number().int().positive(), ...camposComuns }),
  z.object({
    tipo: z.literal('parcelado'),
    valorTotal: z.number().int().positive(),
    numeroParcelas: z.number().int().min(2),
    ...camposComuns,
  }),
]);

export type CriarDebitoInput = z.infer<typeof criarDebitoSchema>;

// Edição: tipo, valorTotal, numeroParcelas, parcelaAtual e compraId ficam
// travados — ver docs/specs/debitos.md.
export const atualizarDebitoSchema = z.object({
  descricao: z.string().trim().min(1).optional(),
  valor: z.number().int().positive().optional(),
  pessoaId: z.string().optional(),
  categoriaId: z.string().optional(),
  dataCompra: z.coerce.date().optional(),
});

export type AtualizarDebitoInput = z.infer<typeof atualizarDebitoSchema>;
