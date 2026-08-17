import { CategoriaModel } from '../models/Categoria.js';
import { DebitoModel } from '../models/Debito.js';
import { naoEncontrado, conflito } from '../utils/AppError.js';
import { CategoriaInput } from '../validators/categoria.validators.js';

export function listarCategorias() {
  return CategoriaModel.find().sort({ nome: 1 });
}

export async function criarCategoria(dados: CategoriaInput) {
  const existente = await CategoriaModel.findOne({ nome: new RegExp(`^${dados.nome}$`, 'i') });
  if (existente) return existente;
  return CategoriaModel.create(dados);
}

export async function removerCategoria(id: string): Promise<void> {
  const usada = await DebitoModel.exists({ categoriaId: id });
  if (usada) throw conflito('Não é possível excluir: esta categoria está em uso por débitos existentes.');

  const categoria = await CategoriaModel.findByIdAndDelete(id);
  if (!categoria) throw naoEncontrado('Categoria');
}
