import { z } from 'zod';

const camposComuns = {
  descricao: z.string().trim().min(1, 'descrição é obrigatória'),
  dataCompra: z.coerce.date(),
  pessoaId: z.string().min(1, 'pessoa é obrigatória'),
  categoriaId: z.string().optional(),
};

export const criarDebitoSchema = z
  .discriminatedUnion('tipo', [
    z.object({ tipo: z.literal('unico'), valor: z.number().int().positive(), ...camposComuns }),
    z.object({ tipo: z.literal('fixo'), valor: z.number().int().positive(), ...camposComuns }),
    z.object({
      tipo: z.literal('parcelado'),
      valorTotal: z.number().int().positive(),
      numeroParcelas: z.number().int().min(2),
      // Em qual parcela a compra já está ao ser cadastrada (ex: compra feita
      // fora do app, já na 3ª parcela). Opcional — default 1. Não editável
      // depois de criado, só avança via o fluxo de abrir novo mês.
      parcelaAtual: z.number().int().min(1).optional(),
      ...camposComuns,
    }),
  ])
  .refine((d) => d.tipo !== 'parcelado' || d.parcelaAtual === undefined || d.parcelaAtual <= d.numeroParcelas, {
    message: 'parcelaAtual não pode ser maior que numeroParcelas',
    path: ['parcelaAtual'],
  });

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
