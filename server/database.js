import { DatabaseSync } from 'node:sqlite';

export function openDatabase(path) {
  const database = new DatabaseSync(path);
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      reset_hash TEXT UNIQUE,
      reset_expires_at INTEGER
    ) STRICT
  `);
  return database;
}
