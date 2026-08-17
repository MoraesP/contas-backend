import { FaturaModel } from '../models/Fatura.js';
import { DebitoModel } from '../models/Debito.js';
import { CartaoModel } from '../models/Cartao.js';
import { PessoaModel } from '../models/Pessoa.js';
import { CategoriaModel } from '../models/Categoria.js';

interface TotalAgrupado {
  id: string;
  nome: string;
  total: number;
}

interface DebitoView {
  id: string;
  descricao: string;
  valor: number;
  tipo: string;
  parcelaAtual?: number;
  numeroParcelas?: number;
  cartaoId: string;
  cartaoNome: string;
  cartaoCor: string;
  pessoaNome: string;
  categoriaNome: string;
}

/**
 * "Mês atual" não é um mês-calendário fixo: cada cartão abre/fecha seu mês
 * de forma independente, então soma-se os débitos de todas as faturas com
 * status `aberta`. "Mês anterior" é a soma da última fatura fechada de cada
 * cartão. Ver docs/specs/dashboard.md e a nota em docs/specs/faturas.md.
 */
export async function obterDashboard(cartaoIdFiltro?: string) {
  const cartoes = await CartaoModel.find(cartaoIdFiltro ? { _id: cartaoIdFiltro } : {});

  const filtroFaturaAberta: Record<string, unknown> = { status: 'aberta' };
  if (cartaoIdFiltro) filtroFaturaAberta.cartaoId = cartaoIdFiltro;
  const faturasAbertas = await FaturaModel.find(filtroFaturaAberta);
  const debitosAbertos = await DebitoModel.find({ faturaId: { $in: faturasAbertas.map((f) => f._id) } });

  const pessoas = await PessoaModel.find();
  const categorias = await CategoriaModel.find();

  const cartaoPorFatura = new Map(faturasAbertas.map((f) => [String(f._id), String(f.cartaoId)]));
  const cartoesPorId = new Map(cartoes.map((c) => [String(c._id), c]));
  const pessoasPorId = new Map(pessoas.map((p) => [String(p._id), p]));
  const categoriasPorId = new Map(categorias.map((c) => [String(c._id), c]));

  const totalMes = debitosAbertos.reduce((s, d) => s + d.valor, 0);

  const porCartaoMap = new Map<string, TotalAgrupado>();
  const porCategoriaMap = new Map<string, TotalAgrupado>();
  const porPessoaMap = new Map<string, TotalAgrupado>();
  const debitosView: DebitoView[] = [];

  for (const d of debitosAbertos) {
    const cartaoId = cartaoPorFatura.get(String(d.faturaId));
    const cartao = cartaoId ? cartoesPorId.get(cartaoId) : undefined;

    if (cartaoId) {
      const atual = porCartaoMap.get(cartaoId) ?? { id: cartaoId, nome: cartao?.nome ?? 'Cartão desconhecido', total: 0 };
      atual.total += d.valor;
      porCartaoMap.set(cartaoId, atual);
    }

    const catId = d.categoriaId ? String(d.categoriaId) : 'sem';
    const catNome = d.categoriaId ? (categoriasPorId.get(catId)?.nome ?? 'Categoria removida') : 'Sem categoria';
    const catAtual = porCategoriaMap.get(catId) ?? { id: catId, nome: catNome, total: 0 };
    catAtual.total += d.valor;
    porCategoriaMap.set(catId, catAtual);

    const pesId = d.pessoaId ? String(d.pessoaId) : 'sem';
    const pesNome = d.pessoaId ? (pessoasPorId.get(pesId)?.nome ?? 'Pessoa removida') : 'Sem pessoa';
    const pesAtual = porPessoaMap.get(pesId) ?? { id: pesId, nome: pesNome, total: 0 };
    pesAtual.total += d.valor;
    porPessoaMap.set(pesId, pesAtual);

    debitosView.push({
      id: String(d._id),
      descricao: d.descricao,
      valor: d.valor,
      tipo: d.tipo,
      parcelaAtual: d.parcelaAtual ?? undefined,
      numeroParcelas: d.numeroParcelas ?? undefined,
      cartaoId: cartaoId ?? '',
      cartaoNome: cartao?.nome ?? 'Cartão desconhecido',
      cartaoCor: cartao?.corCaracteristica ?? '#8E8B85',
      pessoaNome: pesNome,
      categoriaNome: catNome,
    });
  }

  let totalMesAnterior = 0;
  for (const cartaoId of cartoesPorId.keys()) {
    const ultimaFechada = await FaturaModel.findOne({ cartaoId, status: 'fechada' }).sort({ mesReferencia: -1 });
    if (ultimaFechada) {
      const debitos = await DebitoModel.find({ faturaId: ultimaFechada._id });
      totalMesAnterior += debitos.reduce((s, d) => s + d.valor, 0);
    }
  }

  const variacaoPercentual = totalMesAnterior === 0 ? 0 : ((totalMes - totalMesAnterior) / totalMesAnterior) * 100;

  return {
    totalMes,
    totalMesAnterior,
    variacaoPercentual,
    porCartao: [...porCartaoMap.values()].sort((a, b) => b.total - a.total),
    porCategoria: [...porCategoriaMap.values()].sort((a, b) => b.total - a.total),
    porPessoa: [...porPessoaMap.values()].sort((a, b) => b.total - a.total),
    debitos: debitosView,
  };
}
