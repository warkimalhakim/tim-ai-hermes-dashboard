#!/usr/bin/env node
/**
 * Seeder / user manager untuk dashboard auth (SQLite: data/users.db).
 *
 * Usage:
 *   node scripts/seed-user.mjs create <username> <password> [--name "Nama"] [--role admin]
 *   node scripts/seed-user.mjs list
 *   node scripts/seed-user.mjs passwd <username> <password-baru>
 *   node scripts/seed-user.mjs delete <username>
 *
 * Contoh:
 *   node scripts/seed-user.mjs create admin 'rahasia123' --name "Papah"
 *
 * Catatan: password di-hash scrypt (salt unik per user), tidak pernah disimpan plaintext.
 */
import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = process.env.DASHBOARD_DATA_DIR || path.join(process.cwd(), "data");
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "users.db");

function openDb() {
  const db = new DatabaseSync(DB_PATH);
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

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

function die(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

function validate(username, password) {
  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
    die("Username harus 3-32 karakter, hanya huruf/angka/titik/underscore/dash.");
  }
  if (!password || password.length < 8) die("Password minimal 8 karakter.");
}

const [cmd, ...rest] = process.argv.slice(2);
const positional = rest.filter((a) => !a.startsWith("--"));
function flag(name, fallback = null) {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 && rest[i + 1] ? rest[i + 1] : fallback;
}

if (!cmd) {
  console.log(`Usage:
  node scripts/seed-user.mjs create <username> <password> [--name "Nama"] [--role admin]
  node scripts/seed-user.mjs list
  node scripts/seed-user.mjs passwd <username> <password-baru>
  node scripts/seed-user.mjs delete <username>`);
  process.exit(0);
}

const db = openDb();

if (cmd === "create") {
  const [username, password] = positional;
  if (!username || !password) die("Butuh <username> dan <password>.");
  validate(username, password);

  const exists = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (exists) die(`User '${username}' sudah ada. Gunakan 'passwd' untuk ganti password.`);

  db.prepare(
    "INSERT INTO users (username, name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(
    username,
    flag("name", username),
    flag("role", "admin"),
    hashPassword(password),
    Math.floor(Date.now() / 1000)
  );
  console.log(`✔ User '${username}' dibuat (role: ${flag("role", "admin")}).`);
} else if (cmd === "list") {
  const rows = db
    .prepare("SELECT id, username, name, role, created_at, last_login_at FROM users ORDER BY id")
    .all();
  if (!rows.length) {
    console.log("(belum ada user)");
  } else {
    console.log("ID | username | name | role | created | last_login");
    for (const r of rows) {
      const created = new Date(Number(r.created_at) * 1000).toISOString().slice(0, 16).replace("T", " ");
      const last = r.last_login_at
        ? new Date(Number(r.last_login_at) * 1000).toISOString().slice(0, 16).replace("T", " ")
        : "-";
      console.log(`${r.id} | ${r.username} | ${r.name} | ${r.role} | ${created} | ${last}`);
    }
  }
} else if (cmd === "passwd") {
  const [username, password] = positional;
  if (!username || !password) die("Butuh <username> dan <password-baru>.");
  if (password.length < 8) die("Password minimal 8 karakter.");
  const user = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (!user) die(`User '${username}' tidak ditemukan.`);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(password), user.id);
  // invalidate sesi lama
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(user.id);
  console.log(`✔ Password '${username}' diperbarui. Semua sesi lama dicabut.`);
} else if (cmd === "delete") {
  const [username] = positional;
  if (!username) die("Butuh <username>.");
  const user = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (!user) die(`User '${username}' tidak ditemukan.`);
  db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(user.id);
  console.log(`✔ User '${username}' dihapus.`);
} else {
  die(`Perintah tidak dikenal: ${cmd}`);
}

db.close();
