import { Schema, model, InferSchemaType, Types } from 'mongoose';

const faturaSchema = new Schema(
  {
    cartaoId: { type: Schema.Types.ObjectId, ref: 'Cartao', required: true },
    mesReferencia: { type: String, required: true }, // "YYYY-MM"
    status: { type: String, enum: ['aberta', 'fechada'], default: 'aberta', required: true },
    dataFechamentoReal: { type: Date },
  },
  { timestamps: true },
);

// Não deixa duplicar mês pro mesmo cartão.
faturaSchema.index({ cartaoId: 1, mesReferencia: 1 }, { unique: true });
// Garante, a nível de banco, só uma fatura aberta por cartão por vez.
faturaSchema.index(
  { cartaoId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'aberta' } },
);

export type Fatura = InferSchemaType<typeof faturaSchema> & { _id: Types.ObjectId };
export const FaturaModel = model('Fatura', faturaSchema);
