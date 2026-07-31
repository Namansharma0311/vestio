import Database from "better-sqlite3";
import { v4 as uuid } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.STORAGE_DIR || path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "wardrobe.db");
const sqlite = new Database(dbPath);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    username TEXT DEFAULT '',
    avatarUrl TEXT DEFAULT '',
    createdAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS clothes (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT DEFAULT '',
    category TEXT DEFAULT '',
    color TEXT DEFAULT '',
    brand TEXT DEFAULT '',
    season TEXT DEFAULT '',
    occasion TEXT DEFAULT '',
    favorite INTEGER DEFAULT 0,
    imageUrl TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS outfits (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT DEFAULT 'Untitled outfit',
    itemIds TEXT DEFAULT '[]',
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_clothes_user ON clothes(userId);
  CREATE INDEX IF NOT EXISTS idx_outfits_user ON outfits(userId);
`);

export function initDb() {
  const cols = sqlite.prepare("PRAGMA table_info(users)").all().map(c => c.name);
  if (!cols.includes("username")) sqlite.exec("ALTER TABLE users ADD COLUMN username TEXT DEFAULT ''");
  if (!cols.includes("avatarUrl")) sqlite.exec("ALTER TABLE users ADD COLUMN avatarUrl TEXT DEFAULT ''");
}

const PAGE_SIZE = 20;

// ---------- Users ----------
export async function createUser({ email, passwordHash }) {
  const id = uuid();
  const createdAt = new Date().toISOString();
  sqlite.prepare("INSERT INTO users (id, email, passwordHash, createdAt) VALUES (?, ?, ?, ?)").run(id, email, passwordHash, createdAt);
  return { id, email, passwordHash, createdAt };
}

export async function findUserByEmail(email) {
  return sqlite.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)").get(email) || null;
}

export async function findUserById(id) {
  return sqlite.prepare("SELECT * FROM users WHERE id = ?").get(id) || null;
}

export async function updateUser(id, fields) {
  const existing = sqlite.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!existing) return null;
  const username = fields.username !== undefined ? fields.username : existing.username;
  const avatarUrl = fields.avatarUrl !== undefined ? fields.avatarUrl : existing.avatarUrl;
  const passwordHash = fields.passwordHash || existing.passwordHash;
  sqlite.prepare("UPDATE users SET username=?, avatarUrl=?, passwordHash=? WHERE id=?").run(username, avatarUrl, passwordHash, id);
  return { ...existing, username, avatarUrl, passwordHash };
}

// ---------- Clothes ----------
export async function createClothing(userId, fields) {
  const id = uuid();
  const createdAt = new Date().toISOString();
  sqlite.prepare(
    "INSERT INTO clothes (id, userId, name, category, color, brand, season, occasion, favorite, imageUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    id, userId,
    fields.name || "",
    fields.category || "",
    fields.color || "",
    fields.brand || "",
    fields.season || "",
    fields.occasion || "",
    fields.favorite ? 1 : 0,
    fields.imageUrl || null,
    createdAt
  );
  return { id, userId, ...fields, favorite: !!fields.favorite, imageUrl: fields.imageUrl || null, createdAt };
}

export async function listClothing(userId, { page = 1, search, category, season, occasion, favorite } = {}) {
  let where = "WHERE userId = ?";
  const params = [userId];

  if (search) {
    where += " AND (LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(color) LIKE ?)";
    const q = `%${search.toLowerCase()}%`;
    params.push(q, q, q);
  }
  if (category) { where += " AND category = ?"; params.push(category); }
  if (season) { where += " AND season = ?"; params.push(season); }
  if (occasion) { where += " AND occasion = ?"; params.push(occasion); }
  if (favorite === "true") { where += " AND favorite = 1"; }

  const countRow = sqlite.prepare(`SELECT COUNT(*) as total FROM clothes ${where}`).get(...params);
  const total = countRow.total;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const offset = (Math.max(1, page) - 1) * PAGE_SIZE;

  const rows = sqlite.prepare(`SELECT * FROM clothes ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`).all(...params, PAGE_SIZE, offset);

  return {
    items: rows.map(r => ({ ...r, favorite: !!r.favorite })),
    page: Math.max(1, page),
    totalPages,
    total,
  };
}

export async function listAllClothing(userId) {
  return sqlite.prepare("SELECT * FROM clothes WHERE userId = ? ORDER BY createdAt DESC").all(userId).map(r => ({ ...r, favorite: !!r.favorite }));
}

export async function getClothingById(userId, id) {
  const row = sqlite.prepare("SELECT * FROM clothes WHERE userId = ? AND id = ?").get(userId, id);
  return row ? { ...row, favorite: !!row.favorite } : null;
}

export async function updateClothing(userId, id, updates) {
  const existing = sqlite.prepare("SELECT * FROM clothes WHERE userId = ? AND id = ?").get(userId, id);
  if (!existing) return null;

  const fields = { ...existing, ...updates, favorite: updates.favorite !== undefined ? (updates.favorite ? 1 : 0) : existing.favorite };
  sqlite.prepare(
    "UPDATE clothes SET name=?, category=?, color=?, brand=?, season=?, occasion=?, favorite=?, imageUrl=? WHERE userId=? AND id=?"
  ).run(fields.name, fields.category, fields.color, fields.brand, fields.season, fields.occasion, fields.favorite, fields.imageUrl, userId, id);

  return { ...fields, favorite: !!fields.favorite };
}

export async function deleteClothing(userId, id) {
  const row = sqlite.prepare("SELECT imageUrl FROM clothes WHERE userId = ? AND id = ?").get(userId, id);
  const result = sqlite.prepare("DELETE FROM clothes WHERE userId = ? AND id = ?").run(userId, id);
  return { deleted: result.changes > 0, imageUrl: row?.imageUrl || null };
}

export async function deleteUserData(userId) {
  sqlite.prepare("DELETE FROM clothes WHERE userId = ?").run(userId);
  sqlite.prepare("DELETE FROM outfits WHERE userId = ?").run(userId);
}

// ---------- Outfits ----------
export async function createOutfit(userId, { name, itemIds }) {
  const id = uuid();
  const createdAt = new Date().toISOString();
  sqlite.prepare("INSERT INTO outfits (id, userId, name, itemIds, createdAt) VALUES (?, ?, ?, ?, ?)").run(
    id, userId, name || "Untitled outfit", JSON.stringify(itemIds || []), createdAt
  );
  return { id, userId, name: name || "Untitled outfit", itemIds: itemIds || [], createdAt };
}

export async function listOutfits(userId) {
  const rows = sqlite.prepare("SELECT * FROM outfits WHERE userId = ? ORDER BY createdAt DESC").all(userId);
  return rows.map(r => ({ ...r, itemIds: JSON.parse(r.itemIds) }));
}

export async function deleteOutfit(userId, id) {
  const result = sqlite.prepare("DELETE FROM outfits WHERE userId = ? AND id = ?").run(userId, id);
  return result.changes > 0;
}

export default sqlite;
