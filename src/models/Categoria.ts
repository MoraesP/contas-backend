import { Schema, model, InferSchemaType } from 'mongoose';

const categoriaSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true },
);

export type Categoria = InferSchemaType<typeof categoriaSchema> & { _id: import('mongoose').Types.ObjectId };
export const CategoriaModel = model('Categoria', categoriaSchema);
