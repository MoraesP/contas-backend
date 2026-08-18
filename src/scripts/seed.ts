import mongoose from 'mongoose';
import { CartaoModel } from '../models/Cartao.js';
import { PessoaModel } from '../models/Pessoa.js';
import { CategoriaModel } from '../models/Categoria.js';
import { FaturaModel } from '../models/Fatura.js';
import { DebitoModel } from '../models/Debito.js';

/**
 * Espelha frontend/src/app/core/mock/mock-data.ts — mesmos cartões, pessoas
 * e débitos, pra dar continuidade com o que já foi testado no frontend
 * mockado. Fatura de julho do Nubank vem fechada de propósito, pra já
 * existir histórico e um "mês anterior" no dashboard assim que o app sobe.
 */
async function popular(): Promise<void> {
  const nu = await CartaoModel.create({
    nome: 'Nubank Roxo',
    codigo: 'NUB',
    corCaracteristica: '#820AD1',
    dataFechamento: 14,
    dataVencimento: 21,
  });
  const inter = await CartaoModel.create({
    nome: 'Inter Laranja',
    codigo: 'INT',
    corCaracteristica: '#FF7A00',
    dataFechamento: 5,
    dataVencimento: 12,
  });
  const c6 = await CartaoModel.create({
    nome: 'C6 Carbon',
    codigo: 'CAR',
    corCaracteristica: '#3AA98F',
    dataFechamento: 20,
    dataVencimento: 27,
  });

  const voce = await PessoaModel.create({ nome: 'Você' });
  const marina = await PessoaModel.create({ nome: 'Marina' });

  const [mercado, assinaturas, eletronicos, transporte, saude, casa] = await Promise.all([
    CategoriaModel.create({ nome: 'Mercado' }),
    CategoriaModel.create({ nome: 'Assinaturas' }),
    CategoriaModel.create({ nome: 'Eletrônicos' }),
    CategoriaModel.create({ nome: 'Transporte' }),
    CategoriaModel.create({ nome: 'Saúde' }),
    CategoriaModel.create({ nome: 'Casa' }),
  ]);

  const nuJulho = await FaturaModel.create({
    cartaoId: nu._id,
    mesReferencia: '2026-07',
    status: 'fechada',
    dataFechamentoReal: new Date('2026-07-14'),
  });
  const nuAgosto = await FaturaModel.create({ cartaoId: nu._id, mesReferencia: '2026-08', status: 'aberta' });
  const interAgosto = await FaturaModel.create({ cartaoId: inter._id, mesReferencia: '2026-08', status: 'aberta' });
  const c6Agosto = await FaturaModel.create({ cartaoId: c6._id, mesReferencia: '2026-08', status: 'aberta' });

  const compraIphone = new mongoose.Types.ObjectId();
  const compraSofa = new mongoose.Types.ObjectId();

  await DebitoModel.create([
    // Nubank — julho (fechada)
    {
      faturaId: nuJulho._id,
      pessoaId: voce._id,
      categoriaId: mercado._id,
      descricao: 'Mercado Extra',
      valor: 26200,
      dataCompra: new Date('2026-07-04'),
      tipo: 'unico',
    },
    {
      faturaId: nuJulho._id,
      pessoaId: voce._id,
      categoriaId: assinaturas._id,
      descricao: 'Netflix',
      valor: 5590,
      dataCompra: new Date('2026-07-01'),
      tipo: 'fixo',
    },
    {
      faturaId: nuJulho._id,
      pessoaId: marina._id,
      categoriaId: eletronicos._id,
      descricao: 'iPhone 15',
      valor: 45800,
      dataCompra: new Date('2026-05-12'),
      tipo: 'parcelado',
      valorTotal: 458000,
      numeroParcelas: 10,
      parcelaAtual: 3,
      compraId: compraIphone,
    },
    // Nubank — agosto (aberta)
    {
      faturaId: nuAgosto._id,
      pessoaId: voce._id,
      categoriaId: mercado._id,
      descricao: 'Mercado Extra',
      valor: 28490,
      dataCompra: new Date('2026-08-03'),
      tipo: 'unico',
    },
    {
      faturaId: nuAgosto._id,
      pessoaId: voce._id,
      categoriaId: assinaturas._id,
      descricao: 'Netflix',
      valor: 5590,
      dataCompra: new Date('2026-08-01'),
      tipo: 'fixo',
    },
    {
      faturaId: nuAgosto._id,
      pessoaId: marina._id,
      categoriaId: eletronicos._id,
      descricao: 'iPhone 15',
      valor: 45800,
      dataCompra: new Date('2026-05-12'),
      tipo: 'parcelado',
      valorTotal: 458000,
      numeroParcelas: 10,
      parcelaAtual: 4,
      compraId: compraIphone,
    },
    // Inter — agosto (aberta)
    {
      faturaId: interAgosto._id,
      pessoaId: voce._id,
      categoriaId: transporte._id,
      descricao: 'Posto Ipiranga',
      valor: 19000,
      dataCompra: new Date('2026-08-07'),
      tipo: 'unico',
    },
    {
      faturaId: interAgosto._id,
      pessoaId: marina._id,
      categoriaId: saude._id,
      descricao: 'Academia',
      valor: 12990,
      dataCompra: new Date('2026-08-05'),
      tipo: 'fixo',
    },
    {
      faturaId: interAgosto._id,
      pessoaId: voce._id,
      categoriaId: saude._id,
      descricao: 'Farmácia São João',
      valor: 6230,
      dataCompra: new Date('2026-08-11'),
      tipo: 'unico',
    },
    // C6 — agosto (aberta)
    {
      faturaId: c6Agosto._id,
      pessoaId: voce._id,
      categoriaId: casa._id,
      descricao: 'Sofá 3 lugares',
      valor: 21650,
      dataCompra: new Date('2026-07-18'),
      tipo: 'parcelado',
      valorTotal: 129900,
      numeroParcelas: 6,
      parcelaAtual: 2,
      compraId: compraSofa,
    },
    {
      faturaId: c6Agosto._id,
      pessoaId: marina._id,
      categoriaId: assinaturas._id,
      descricao: 'Spotify Família',
      valor: 3490,
      dataCompra: new Date('2026-08-02'),
      tipo: 'fixo',
    },
  ]);
}

export async function seed(): Promise<void> {
  await Promise.all([
    CartaoModel.deleteMany({}),
    PessoaModel.deleteMany({}),
    CategoriaModel.deleteMany({}),
    FaturaModel.deleteMany({}),
    DebitoModel.deleteMany({}),
  ]);
  await popular();
}

export async function seedSeVazio(): Promise<void> {
  const existeAlgo = await CartaoModel.exists({});
  if (existeAlgo) return;
  console.log('[seed] Banco vazio — populando com dados de exemplo...');
  await popular();
}

// Executado diretamente via `npm run seed` (reseta e repopula, mesmo se já tiver dados).
if (import.meta.url === `file://${process.argv[1]}`) {
  const { conectarBanco, desconectarBanco } = await import('../db/connect.js');
  await conectarBanco();
  await seed();
  console.log('[seed] Concluído.');
  await desconectarBanco();
  process.exit(0);
}
