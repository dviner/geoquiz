import { createClient, Client } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";
import { SCHEMA_SQL } from "./schema";

// In production, point TURSO_DATABASE_URL at a real libsql://... database (with TURSO_AUTH_TOKEN
// set alongside it). Locally, both can be left unset — this falls back to a plain SQLite file, so
// `npm run dev` works with zero external accounts.
const DATABASE_URL = process.env.TURSO_DATABASE_URL || `file:${process.env.DATABASE_PATH || "./data/geoquiz.db"}`;
const AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

declare global {
  var __geoquizDb: Client | undefined;
  var __geoquizSchemaReady: Promise<void> | undefined;
}

function createConnection(): Client {
  if (DATABASE_URL.startsWith("file:")) {
    const filePath = DATABASE_URL.slice("file:".length);
    const dir = path.dirname(filePath);
    if (dir && dir !== ".") {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  return createClient({ url: DATABASE_URL, authToken: AUTH_TOKEN });
}

// Stashed on globalThis so Next.js dev-mode hot reload doesn't open duplicate connections.
export const db: Client = global.__geoquizDb ?? createConnection();
if (process.env.NODE_ENV !== "production") {
  global.__geoquizDb = db;
}

// Schema setup is async (a network round-trip against Turso), so every caller awaits this once;
// the promise is cached on globalThis so it only actually runs a single time per process.
export function ensureSchema(): Promise<void> {
  if (!global.__geoquizSchemaReady) {
    global.__geoquizSchemaReady = db.executeMultiple(SCHEMA_SQL);
  }
  return global.__geoquizSchemaReady;
}
