import { z } from 'zod';

export const abrirNovoMesSchema = z.object({
  mesReferencia: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'mesReferencia deve estar no formato YYYY-MM'),
  idsParaRolar: z.array(z.string()).default([]),
});

export type AbrirNovoMesInput = z.infer<typeof abrirNovoMesSchema>;
