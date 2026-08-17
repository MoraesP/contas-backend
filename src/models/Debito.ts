import { Schema, model, InferSchemaType, Types } from 'mongoose';

const debitoSchema = new Schema(
  {
    faturaId: { type: Schema.Types.ObjectId, ref: 'Fatura', required: true },
    pessoaId: { type: Schema.Types.ObjectId, ref: 'Pessoa' },
    categoriaId: { type: Schema.Types.ObjectId, ref: 'Categoria' },
    descricao: { type: String, required: true, trim: true },
    valor: { type: Number, required: true }, // centavos
    dataCompra: { type: Date, required: true },
    tipo: { type: String, enum: ['fixo', 'parcelado', 'unico'], required: true },

    // apenas quando tipo === 'parcelado'
    valorTotal: { type: Number },
    numeroParcelas: { type: Number },
    parcelaAtual: { type: Number },
    compraId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true },
);

debitoSchema.index({ faturaId: 1 });

export type Debito = InferSchemaType<typeof debitoSchema> & { _id: Types.ObjectId };
export const DebitoModel = model('Debito', debitoSchema);
