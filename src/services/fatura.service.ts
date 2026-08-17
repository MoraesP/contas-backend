import { FaturaModel } from '../models/Fatura.js';
import { DebitoModel } from '../models/Debito.js';
import { CartaoModel } from '../models/Cartao.js';
import { naoEncontrado, conflito } from '../utils/AppError.js';

export function listarFaturasDoCartao(cartaoId: string) {
  return FaturaModel.find({ cartaoId }).sort({ mesReferencia: 1 });
}

export function buscarFaturaAberta(cartaoId: string) {
  return FaturaModel.findOne({ cartaoId, status: 'aberta' });
}

export function buscarUltimaFechada(cartaoId: string) {
  return FaturaModel.findOne({ cartaoId, status: 'fechada' }).sort({ mesReferencia: -1 });
}

export function listarFaturasFechadas(filtro: { cartaoId?: string }) {
  const query: Record<string, unknown> = { status: 'fechada' };
  if (filtro.cartaoId) query.cartaoId = filtro.cartaoId;
  return FaturaModel.find(query).sort({ mesReferencia: -1 });
}

export async function buscarFatura(id: string) {
  const fatura = await FaturaModel.findById(id);
  if (!fatura) throw naoEncontrado('Fatura');
  return fatura;
}

/** Débitos da última fatura fechada do cartão elegíveis a continuar (parcelas em aberto e fixos). */
export async function candidatosRollover(cartaoId: string) {
  const anterior = await buscarUltimaFechada(cartaoId);
  if (!anterior) return [];
  const debitos = await DebitoModel.find({ faturaId: anterior._id });
  return debitos.filter(
    (d) => (d.tipo === 'parcelado' && (d.parcelaAtual ?? 0) < (d.numeroParcelas ?? 0)) || d.tipo === 'fixo',
  );
}

/**
 * Abre a fatura do mês escolhido pelo usuário. Só rola pra ela os débitos
 * cujos ids estão em `idsParaRolar` — a seleção é do usuário (via
 * candidatosRollover), não automática.
 */
export async function abrirNovoMes(cartaoId: string, mesReferencia: string, idsParaRolar: string[]) {
  const cartao = await CartaoModel.findById(cartaoId);
  if (!cartao) throw naoEncontrado('Cartão');

  const jaAberta = await buscarFaturaAberta(cartaoId);
  if (jaAberta) throw conflito('Já existe uma fatura aberta para este cartão. Feche-a antes de abrir um novo mês.');

  const jaExisteMes = await FaturaModel.exists({ cartaoId, mesReferencia });
  if (jaExisteMes) throw conflito('Já existe uma fatura para esse mês neste cartão.');

  const candidatos = await candidatosRollover(cartaoId);
  const selecionados = candidatos.filter((d) => idsParaRolar.includes(String(d._id)));

  const nova = await FaturaModel.create({ cartaoId, mesReferencia, status: 'aberta' });

  for (const d of selecionados) {
    await DebitoModel.create({
      faturaId: nova._id,
      pessoaId: d.pessoaId,
      categoriaId: d.categoriaId,
      descricao: d.descricao,
      valor: d.valor,
      dataCompra: d.dataCompra,
      tipo: d.tipo,
      valorTotal: d.valorTotal,
      numeroParcelas: d.numeroParcelas,
      parcelaAtual: d.tipo === 'parcelado' ? (d.parcelaAtual ?? 0) + 1 : undefined,
      compraId: d.compraId,
    });
  }

  return nova;
}

export async function fecharFatura(id: string) {
  const fatura = await buscarFatura(id);
  if (fatura.status === 'fechada') throw conflito('Esta fatura já está fechada.');
  fatura.status = 'fechada';
  fatura.dataFechamentoReal = new Date();
  await fatura.save();
  return fatura;
}
