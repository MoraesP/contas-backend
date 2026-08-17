import { DebitoModel } from '../models/Debito.js';
import { FaturaModel } from '../models/Fatura.js';
import { naoEncontrado, conflito } from '../utils/AppError.js';
import { AtualizarDebitoInput, CriarDebitoInput } from '../validators/debito.validators.js';

export function listarPorFatura(faturaId: string) {
  return DebitoModel.find({ faturaId }).sort({ createdAt: 1 });
}

async function garantirFaturaAberta(faturaId: string) {
  const fatura = await FaturaModel.findById(faturaId);
  if (!fatura) throw naoEncontrado('Fatura');
  if (fatura.status === 'fechada') {
    throw conflito('Esta fatura está fechada — não é possível alterar os débitos dela.');
  }
  return fatura;
}

export async function criarDebito(faturaId: string, dados: CriarDebitoInput) {
  await garantirFaturaAberta(faturaId);

  if (dados.tipo === 'parcelado') {
    const valor = Math.round(dados.valorTotal / dados.numeroParcelas);
    const doc = new DebitoModel({
      faturaId,
      descricao: dados.descricao,
      dataCompra: dados.dataCompra,
      pessoaId: dados.pessoaId,
      categoriaId: dados.categoriaId,
      tipo: 'parcelado',
      valor,
      valorTotal: dados.valorTotal,
      numeroParcelas: dados.numeroParcelas,
      parcelaAtual: 1,
    });
    doc.compraId = doc._id;
    await doc.save();
    return doc;
  }

  return DebitoModel.create({
    faturaId,
    descricao: dados.descricao,
    dataCompra: dados.dataCompra,
    pessoaId: dados.pessoaId,
    categoriaId: dados.categoriaId,
    tipo: dados.tipo,
    valor: dados.valor,
  });
}

export async function atualizarDebito(id: string, dados: AtualizarDebitoInput) {
  const debito = await DebitoModel.findById(id);
  if (!debito) throw naoEncontrado('Débito');
  await garantirFaturaAberta(String(debito.faturaId));

  Object.assign(debito, dados);
  await debito.save();
  return debito;
}

export async function removerDebito(id: string): Promise<void> {
  const debito = await DebitoModel.findById(id);
  if (!debito) throw naoEncontrado('Débito');
  await garantirFaturaAberta(String(debito.faturaId));
  await debito.deleteOne();
}
