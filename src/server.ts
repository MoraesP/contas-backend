import { criarApp } from './app.js';
import { conectarBanco } from './db/connect.js';
import { seedSeVazio } from './scripts/seed.js';
import { env } from './config/env.js';

async function main() {
  await conectarBanco();
  await seedSeVazio();

  const app = criarApp();
  app.listen(env.port, () => {
    console.log(`[server] Rodando em http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});
