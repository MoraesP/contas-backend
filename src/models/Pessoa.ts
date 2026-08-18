import { Schema, model, InferSchemaType } from 'mongoose';

const pessoaSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export type Pessoa = InferSchemaType<typeof pessoaSchema> & { _id: import('mongoose').Types.ObjectId };
export const PessoaModel = model('Pessoa', pessoaSchema);
