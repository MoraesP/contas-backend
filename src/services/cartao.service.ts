import { CartaoModel } from '../models/Cartao.js';
import { FaturaModel } from '../models/Fatura.js';
import { naoEncontrado, conflito } from '../utils/AppError.js';
import { CartaoInput } from '../validators/cartao.validators.js';

export function listarCartoes() {
  return CartaoModel.find().sort({ createdAt: 1 });
}

export async function buscarCartao(id: string) {
  const cartao = await CartaoModel.findById(id);
  if (!cartao) throw naoEncontrado('Cartão');
  return cartao;
}

export function criarCartao(dados: CartaoInput) {
  return CartaoModel.create(dados);
}

export async function atualizarCartao(id: string, dados: CartaoInput) {
  const cartao = await CartaoModel.findByIdAndUpdate(id, dados, { new: true });
  if (!cartao) throw naoEncontrado('Cartão');
  return cartao;
}

export async function removerCartao(id: string): Promise<void> {
  const existeFatura = await FaturaModel.exists({ cartaoId: id });
  if (existeFatura) throw conflito('Não é possível excluir: existem faturas vinculadas a este cartão.');

  const cartao = await CartaoModel.findByIdAndDelete(id);
  if (!cartao) throw naoEncontrado('Cartão');
}
