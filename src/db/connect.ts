import mongoose from 'mongoose';
import { env } from '../config/env.js';

// Só importado quando necessário (ver conectarBanco) — mantém o pacote
// fora do bundle de produção, onde MONGODB_URI sempre estará definido.
let memoryServerStop: (() => Promise<void>) | undefined;

export async function conectarBanco(): Promise<void> {
  if (env.mongodbUri) {
    await mongoose.connect(env.mongodbUri);
    console.log('[db] Conectado ao MongoDB configurado em MONGODB_URI.');
    return;
  }

  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const memoryServer = await MongoMemoryServer.create();
  memoryServerStop = async () => {
    await memoryServer.stop();
  };
  await mongoose.connect(memoryServer.getUri());
  console.log('[db] MONGODB_URI não definido — usando MongoDB em memória (dev). Dados não persistem entre reinícios.');
}

export async function desconectarBanco(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServerStop) await memoryServerStop();
}
