import 'dotenv/config';

function obrigatoria(nome: string, valor: string | undefined): string {
  if (!valor) {
    throw new Error(`Variável de ambiente ${nome} não definida. Ver .env.example.`);
  }
  return valor;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  mongodbUri: process.env.MONGODB_URI, // opcional — sem ela, usa MongoDB em memória (dev)
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:4200',
  adminEmail: obrigatoria('ADMIN_EMAIL', process.env.ADMIN_EMAIL),
  adminPasswordHash: obrigatoria('ADMIN_PASSWORD_HASH', process.env.ADMIN_PASSWORD_HASH),
  jwtSecret: obrigatoria('JWT_SECRET', process.env.JWT_SECRET),
};
