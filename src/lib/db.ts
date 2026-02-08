import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'azuret.db')

let db: Database.Database | null = null

function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs')
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')

    db.exec(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        bio TEXT DEFAULT '',
        website TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      );
    `)
  }
  return db
}

/* ── Comments ─────────────────────────────────────────────── */

export function getComments() {
  return getDb()
    .prepare('SELECT * FROM comments ORDER BY created_at DESC LIMIT 100')
    .all()
}

export function createComment(author: string, content: string) {
  const stmt = getDb().prepare(
    'INSERT INTO comments (author, content) VALUES (?, ?)'
  )
  const result = stmt.run(author, content)
  return getDb()
    .prepare('SELECT * FROM comments WHERE id = ?')
    .get(result.lastInsertRowid)
}

export function likeComment(id: number) {
  getDb()
    .prepare('UPDATE comments SET likes = likes + 1 WHERE id = ?')
    .run(id)
  return getDb().prepare('SELECT * FROM comments WHERE id = ?').get(id)
}

/* ── Profiles ─────────────────────────────────────────────── */

export function getProfiles() {
  return getDb()
    .prepare('SELECT * FROM profiles ORDER BY created_at DESC LIMIT 200')
    .all()
}

export function createProfile(
  username: string,
  display_name: string,
  bio: string,
  website: string
) {
  const stmt = getDb().prepare(
    'INSERT INTO profiles (username, display_name, bio, website) VALUES (?, ?, ?, ?)'
  )
  const result = stmt.run(username, display_name, bio, website)
  return getDb()
    .prepare('SELECT * FROM profiles WHERE id = ?')
    .get(result.lastInsertRowid)
}
