import { PessoaModel } from '../models/Pessoa.js';
import { DebitoModel } from '../models/Debito.js';
import { naoEncontrado, conflito } from '../utils/AppError.js';
import { PessoaInput } from '../validators/pessoa.validators.js';

export function listarPessoas() {
  return PessoaModel.find().sort({ nome: 1 });
}

export async function buscarPessoa(id: string) {
  const pessoa = await PessoaModel.findById(id);
  if (!pessoa) throw naoEncontrado('Pessoa');
  return pessoa;
}

export function criarPessoa(dados: PessoaInput) {
  return PessoaModel.create(dados);
}

export async function atualizarPessoa(id: string, dados: PessoaInput) {
  const pessoa = await PessoaModel.findByIdAndUpdate(id, dados, { new: true });
  if (!pessoa) throw naoEncontrado('Pessoa');
  return pessoa;
}

export async function removerPessoa(id: string): Promise<void> {
  const usada = await DebitoModel.exists({ pessoaId: id });
  if (usada) throw conflito('Não é possível excluir: esta pessoa está associada a débitos existentes.');

  const pessoa = await PessoaModel.findByIdAndDelete(id);
  if (!pessoa) throw naoEncontrado('Pessoa');
}
