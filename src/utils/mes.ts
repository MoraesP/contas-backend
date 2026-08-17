const REGEX_MES = /^\d{4}-(0[1-9]|1[0-2])$/;

export function ehMesReferenciaValido(valor: string): boolean {
  return REGEX_MES.test(valor);
}

/** "2026-08" -> "2026-09" */
export function proximoMes(mesReferencia: string): string {
  const [ano, mes] = mesReferencia.split('-').map(Number);
  const data = new Date(ano, mes, 1);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
}

export function mesAtualIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
