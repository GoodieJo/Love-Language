-- ─────────────────────────────────────────────────────────────
-- Our Dictionary — D1 Schema
-- Run:  wrangler d1 execute our-dictionary-db --file=schema.sql --remote
-- ─────────────────────────────────────────────────────────────

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL DEFAULT 'Our Dictionary',
  share_code  TEXT NOT NULL UNIQUE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Entries table
CREATE TABLE IF NOT EXISTS entries (
  id                   TEXT PRIMARY KEY,
  book_id              TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,

  -- English
  english              TEXT NOT NULL,
  english_example      TEXT,
  english_voice        TEXT,

  -- Hindi
  hindi                TEXT,
  hindi_pronunciation  TEXT,
  hindi_example        TEXT,
  hindi_voice          TEXT,

  -- Filipino
  filipino             TEXT,
  filipino_example     TEXT,
  filipino_voice       TEXT,

  -- Shared
  notes                TEXT,

  created_at           TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for fast lookups by book
CREATE INDEX IF NOT EXISTS idx_entries_book_id ON entries(book_id);

-- Index for fast share code lookups
CREATE INDEX IF NOT EXISTS idx_books_share_code ON books(share_code);
