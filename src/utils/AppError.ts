export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const naoEncontrado = (entidade: string) => new AppError(404, 'NAO_ENCONTRADO', `${entidade} não encontrado(a).`);
export const conflito = (mensagem: string) => new AppError(409, 'CONFLITO', mensagem);
export const naoAutorizado = (mensagem = 'Não autorizado.') => new AppError(401, 'NAO_AUTORIZADO', mensagem);
export const requisicaoInvalida = (mensagem: string) => new AppError(400, 'REQUISICAO_INVALIDA', mensagem);
