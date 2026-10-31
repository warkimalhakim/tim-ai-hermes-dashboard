import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const SESSION_COOKIE = "mc_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 hari

function dbPath(): string {
  const dir = process.env.DASHBOARD_DATA_DIR || path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "users.db");
}

let db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (db) return db;
  db = new DatabaseSync(dbPath());
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name          TEXT NOT NULL DEFAULT '',
      role          TEXT NOT NULL DEFAULT 'admin',
      password_hash TEXT NOT NULL,
      created_at    INTEGER NOT NULL,
      last_login_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  `);
  return db;
}

// ------------------------- password hashing (scrypt) -------------------------

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, salt, hash] = stored.split("$");
    if (scheme !== "scrypt" || !salt || !hash) return false;
    const derived = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

// ------------------------- users -------------------------

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  role: string;
}

export function createUser(input: {
  username: string;
  password: string;
  name?: string;
  role?: string;
}): AuthUser {
  const username = input.username.trim();
  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
    throw new Error("Username 3-32 karakter, hanya huruf/angka/._-");
  }
  if (!input.password || input.password.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }
  const d = getDb();
  const exists = d.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (exists) throw new Error(`User '${username}' sudah terdaftar`);

  const now = Math.floor(Date.now() / 1000);
  const result = d
    .prepare(
      "INSERT INTO users (username, name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?)"
    )
    .run(
      username,
      input.name?.trim() || username,
      input.role?.trim() || "admin",
      hashPassword(input.password),
      now
    );

  return {
    id: Number(result.lastInsertRowid),
    username,
    name: input.name?.trim() || username,
    role: input.role?.trim() || "admin",
  };
}

export function authenticate(username: string, password: string): AuthUser | null {
  const d = getDb();
  const row = d
    .prepare("SELECT id, username, name, role, password_hash FROM users WHERE username = ?")
    .get(username.trim()) as any;
  if (!row) return null;
  if (!verifyPassword(password, String(row.password_hash))) return null;

  d.prepare("UPDATE users SET last_login_at = ? WHERE id = ?").run(
    Math.floor(Date.now() / 1000),
    row.id
  );
  return { id: Number(row.id), username: String(row.username), name: String(row.name), role: String(row.role) };
}

export function listUsers(): (AuthUser & { created_at: number; last_login_at: number | null })[] {
  const d = getDb();
  const rows = d.prepare("SELECT id, username, name, role, created_at, last_login_at FROM users ORDER BY id").all() as any[];
  return rows.map((r) => ({
    id: Number(r.id),
    username: String(r.username),
    name: String(r.name),
    role: String(r.role),
    created_at: Number(r.created_at),
    last_login_at: r.last_login_at == null ? null : Number(r.last_login_at),
  }));
}

// ------------------------- sessions -------------------------

export function createSession(userId: number): { token: string; maxAge: number } {
  const token = crypto.randomBytes(32).toString("hex");
  const now = Math.floor(Date.now() / 1000);
  getDb()
    .prepare("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .run(token, userId, now, now + SESSION_TTL_SECONDS);
  return { token, maxAge: SESSION_TTL_SECONDS };
}

export function getUserBySession(token: string | undefined | null): AuthUser | null {
  if (!token) return null;
  const d = getDb();
  const row = d
    .prepare(
      `SELECT u.id, u.username, u.name, u.role, s.expires_at
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token = ?`
    )
    .get(token) as any;
  if (!row) return null;

  if (Number(row.expires_at) < Math.floor(Date.now() / 1000)) {
    d.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }
  return { id: Number(row.id), username: String(row.username), name: String(row.name), role: String(row.role) };
}

export function destroySession(token: string | undefined | null): void {
  if (!token) return;
  getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function purgeExpiredSessions(): void {
  getDb()
    .prepare("DELETE FROM sessions WHERE expires_at < ?")
    .run(Math.floor(Date.now() / 1000));
}
