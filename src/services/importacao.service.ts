import ExcelJS from 'exceljs';
import { CartaoModel } from '../models/Cartao.js';
import { FaturaModel } from '../models/Fatura.js';
import { PessoaModel } from '../models/Pessoa.js';
import { CategoriaModel } from '../models/Categoria.js';
import { DebitoModel } from '../models/Debito.js';
import { conflito, requisicaoInvalida } from '../utils/AppError.js';

interface ErroLinha {
  linha: number;
  motivo: string;
}

interface RelatorioImportacao {
  fatura: { id: string; cartaoId: string; mesReferencia: string; status: string };
  importados: number;
  erros: ErroLinha[];
}

interface DebitoParaCriar {
  pessoaId: string;
  categoriaId?: string;
  descricao: string;
  dataCompra: Date;
  valor: number;
  tipo: 'fixo' | 'unico' | 'parcelado';
  valorTotal?: number;
  numeroParcelas?: number;
  parcelaAtual?: number;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function celulaTexto(valor: ExcelJS.CellValue): string {
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'object' && 'text' in valor) return String((valor as { text: unknown }).text ?? '').trim();
  if (typeof valor === 'object' && 'result' in valor) return String((valor as { result: unknown }).result ?? '').trim();
  return String(valor).trim();
}

function parseMesReferencia(valor: ExcelJS.CellValue): string | null {
  if (valor instanceof Date) {
    const mm = String(valor.getMonth() + 1).padStart(2, '0');
    return `${valor.getFullYear()}-${mm}`;
  }
  const s = celulaTexto(valor);
  const m = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const mes = Number(m[1]);
  if (mes < 1 || mes > 12) return null;
  return `${m[2]}-${String(mes).padStart(2, '0')}`;
}

function parseData(valor: ExcelJS.CellValue): Date | null {
  if (valor instanceof Date) return valor;
  const s = celulaTexto(valor);
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const data = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return Number.isNaN(data.getTime()) ? null : data;
}

function parseValor(valor: ExcelJS.CellValue): number | null {
  if (typeof valor === 'number') return valor;
  const s = celulaTexto(valor).replace(/[^\d,.-]/g, '');
  if (!s) return null;
  const normalizado = s.includes(',') && s.includes('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(',', '.');
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : null;
}

function parseInteiro(valor: ExcelJS.CellValue): number | null {
  if (typeof valor === 'number') return Math.trunc(valor);
  const s = celulaTexto(valor);
  if (!/^-?\d+$/.test(s)) return null;
  return Number(s);
}

function inferirTipo(
  parcelaAtual: number,
  numeroParcelas: number,
): { tipo: 'fixo' } | { tipo: 'unico' } | { tipo: 'parcelado'; parcelaAtual: number; numeroParcelas: number } {
  if (parcelaAtual === 0 && numeroParcelas === 0) return { tipo: 'fixo' };
  if (parcelaAtual === 1 && numeroParcelas === 1) return { tipo: 'unico' };
  if (parcelaAtual >= 1 && numeroParcelas >= 1 && parcelaAtual <= numeroParcelas) {
    return { tipo: 'parcelado', parcelaAtual, numeroParcelas };
  }
  throw new Error(`combinação de parcela atual/total inválida (${parcelaAtual}/${numeroParcelas})`);
}

export async function importarPlanilha(buffer: Buffer): Promise<RelatorioImportacao> {
  const workbook = new ExcelJS.Workbook();
  try {
    // exceljs redeclara `Buffer` globalmente (extends ArrayBuffer) de forma
    // incompatível com @types/node atual — polui o tipo Buffer do programa
    // inteiro. `any` aqui é o único jeito de contornar o bug do pacote.
    await workbook.xlsx.load(buffer as any);
  } catch {
    throw requisicaoInvalida('Não foi possível ler o arquivo — envie um .xlsx válido.');
  }

  const planilha = workbook.worksheets[0];
  if (!planilha || planilha.rowCount < 1) {
    throw requisicaoInvalida('Planilha vazia.');
  }

  const linha1 = planilha.getRow(1);
  const codigo = celulaTexto(linha1.getCell(1).value).toUpperCase();
  if (!/^[A-Z]{3}$/.test(codigo)) {
    throw requisicaoInvalida('Código do cartão (linha 1, coluna A) deve ter 3 letras.');
  }

  const cartao = await CartaoModel.findOne({ codigo });
  if (!cartao) {
    throw requisicaoInvalida(`Nenhum cartão encontrado com o código "${codigo}".`);
  }

  const mesReferencia = parseMesReferencia(linha1.getCell(2).value);
  if (!mesReferencia) {
    throw requisicaoInvalida('Mês da fatura (linha 1, coluna B) inválido — use MM/YYYY.');
  }

  let fatura = await FaturaModel.findOne({ cartaoId: cartao._id, mesReferencia });
  if (fatura) {
    if (fatura.status === 'fechada') {
      throw conflito(`A fatura de ${mesReferencia} deste cartão já está fechada — não é possível importar débitos nela.`);
    }
  } else {
    const abertaOutroMes = await FaturaModel.findOne({ cartaoId: cartao._id, status: 'aberta' });
    if (abertaOutroMes) {
      throw conflito(
        `Este cartão já tem uma fatura aberta em ${abertaOutroMes.mesReferencia}. Feche-a antes de importar dados de ${mesReferencia}.`,
      );
    }
  }

  const erros: ErroLinha[] = [];
  const paraCriar: DebitoParaCriar[] = [];

  for (let numeroLinha = 2; numeroLinha <= planilha.rowCount; numeroLinha++) {
    const row = planilha.getRow(numeroLinha);
    if (row.actualCellCount === 0) continue; // linha em branco, ignora silenciosamente

    try {
      const descricao = celulaTexto(row.getCell(2).value);
      if (!descricao) throw new Error('descrição vazia');

      const dataCompra = parseData(row.getCell(1).value);
      if (!dataCompra) throw new Error('data da compra inválida (use dd/mm/yyyy)');

      const valorBruto = parseValor(row.getCell(3).value);
      if (valorBruto === null || valorBruto <= 0) throw new Error('valor inválido');

      const parcelaAtualBruta = parseInteiro(row.getCell(4).value);
      const numeroParcelasBruto = parseInteiro(row.getCell(5).value);
      if (parcelaAtualBruta === null || numeroParcelasBruto === null) {
        throw new Error('parcela atual/total inválidas');
      }
      const tipoInfo = inferirTipo(parcelaAtualBruta, numeroParcelasBruto);

      const nomePessoa = celulaTexto(row.getCell(6).value);
      if (!nomePessoa) throw new Error('pessoa não informada');
      const pessoa = await PessoaModel.findOne({ nome: new RegExp(`^${escapeRegex(nomePessoa)}$`, 'i') });
      if (!pessoa) throw new Error(`pessoa "${nomePessoa}" não encontrada`);

      let categoriaId: string | undefined;
      const nomeCategoria = celulaTexto(row.getCell(7).value);
      if (nomeCategoria) {
        let categoria = await CategoriaModel.findOne({ nome: new RegExp(`^${escapeRegex(nomeCategoria)}$`, 'i') });
        if (!categoria) categoria = await CategoriaModel.create({ nome: nomeCategoria });
        categoriaId = String(categoria._id);
      }

      const valorCentavos = Math.round(valorBruto * 100);

      const doc: DebitoParaCriar = {
        pessoaId: String(pessoa._id),
        categoriaId,
        descricao,
        dataCompra,
        valor: valorCentavos,
        tipo: tipoInfo.tipo,
      };

      if (tipoInfo.tipo === 'parcelado') {
        doc.numeroParcelas = tipoInfo.numeroParcelas;
        doc.parcelaAtual = tipoInfo.parcelaAtual;
        doc.valorTotal = valorCentavos * tipoInfo.numeroParcelas;
      }

      paraCriar.push(doc);
    } catch (e) {
      erros.push({ linha: numeroLinha, motivo: e instanceof Error ? e.message : 'erro desconhecido' });
    }
  }

  if (!fatura) {
    fatura = await FaturaModel.create({ cartaoId: cartao._id, mesReferencia, status: 'aberta' });
  }

  for (const dados of paraCriar) {
    if (dados.tipo === 'parcelado') {
      const doc = new DebitoModel({ ...dados, faturaId: fatura._id });
      doc.compraId = doc._id;
      await doc.save();
    } else {
      await DebitoModel.create({ ...dados, faturaId: fatura._id });
    }
  }

  return {
    fatura: {
      id: String(fatura._id),
      cartaoId: String(fatura.cartaoId),
      mesReferencia: fatura.mesReferencia,
      status: fatura.status,
    },
    importados: paraCriar.length,
    erros,
  };
}
