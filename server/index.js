import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { openDatabase } from './database.js';

const dataDir = new URL('../data/', import.meta.url);
mkdirSync(dataDir, { recursive: true });
const database = openDatabase(fileURLToPath(new URL('lab1.sqlite', dataDir)));

const app = createApp({
  database,
  staticDir: fileURLToPath(new URL('../dist/', import.meta.url)),
  deliverReset: ({ email, token }) => console.log(`[Lab1] ${email} için sıfırlama kodu: ${token}`),
});
const port = Number(process.env.PORT ?? 3000);
app.listen(port, '127.0.0.1', () => console.log(`Lab1: http://127.0.0.1:${port}`));
