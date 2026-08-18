import { Schema, model, InferSchemaType } from 'mongoose';

const cartaoSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    codigo: { type: String, required: true, trim: true, uppercase: true, minlength: 3, maxlength: 3, unique: true },
    corCaracteristica: { type: String, trim: true },
    dataFechamento: { type: Number, required: true, min: 1, max: 31 },
    dataVencimento: { type: Number, required: true, min: 1, max: 31 },
  },
  { timestamps: true },
);

export type Cartao = InferSchemaType<typeof cartaoSchema> & { _id: import('mongoose').Types.ObjectId };
export const CartaoModel = model('Cartao', cartaoSchema);
