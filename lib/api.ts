/**
 * API client for Our Dictionary Worker.
 * Set NEXT_PUBLIC_API_URL in .env.local to point at your Worker.
 */

import type { Book, Entry } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

async function req<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const json = await res.json();

  if (!json.ok) {
    throw new Error(json.error ?? "Unknown error");
  }

  return json.data as T;
}

// ─── Books ────────────────────────────────────────────────────────────────────

export async function createBook(name: string): Promise<Book> {
  return req<Book>("/api/books", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

/** Accepts either a share code (e.g. "ABC-DEF") or a book UUID */
export async function getBook(shareCodeOrId: string): Promise<Book> {
  return req<Book>(`/api/books/${encodeURIComponent(shareCodeOrId)}`);
}

export async function updateBook(bookId: string, name: string): Promise<Book> {
  return req<Book>(`/api/books/${bookId}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

// ─── Entries ──────────────────────────────────────────────────────────────────

export async function listEntries(bookId: string): Promise<Entry[]> {
  return req<Entry[]>(`/api/books/${bookId}/entries`);
}

export async function createEntry(
  bookId: string,
  payload: Partial<Entry>
): Promise<Entry> {
  return req<Entry>(`/api/books/${bookId}/entries`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getEntry(entryId: string): Promise<Entry> {
  return req<Entry>(`/api/entries/${entryId}`);
}

export async function updateEntry(
  entryId: string,
  payload: Partial<Entry>
): Promise<Entry> {
  return req<Entry>(`/api/entries/${entryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteEntry(entryId: string): Promise<void> {
  await req(`/api/entries/${entryId}`, { method: "DELETE" });
}

// ─── Voice recordings ─────────────────────────────────────────────────────────

type VoiceLang = "english" | "hindi" | "filipino";

export async function uploadVoice(
  entryId: string,
  lang: VoiceLang,
  blob: Blob
): Promise<{ key: string }> {
  const res = await fetch(`${BASE}/api/entries/${entryId}/voice/${lang}`, {
    method: "POST",
    headers: { "Content-Type": blob.type || "audio/webm" },
    body: blob,
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error);
  return json.data;
}

export function voiceUrl(entryId: string, lang: VoiceLang): string {
  return `${BASE}/api/entries/${entryId}/voice/${lang}`;
}

export async function deleteVoice(
  entryId: string,
  lang: VoiceLang
): Promise<void> {
  await req(`/api/entries/${entryId}/voice/${lang}`, { method: "DELETE" });
}
