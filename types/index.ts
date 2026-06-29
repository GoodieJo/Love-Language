// ─── Book ────────────────────────────────────────────────────────────────────

export interface Book {
  id: string;
  name: string;
  shareCode: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Entry ───────────────────────────────────────────────────────────────────

export interface Entry {
  id: string;
  bookId: string;

  // English
  english: string;
  englishExample: string | null;
  englishVoice: string | null;       // R2 object key

  // Hindi
  hindi: string | null;
  hindiPronunciation: string | null;
  hindiExample: string | null;
  hindiVoice: string | null;

  // Filipino
  filipino: string | null;
  filipinoExample: string | null;
  filipinoVoice: string | null;

  // Shared
  notes: string | null;

  createdAt: string;
  updatedAt: string;
}

// ─── API payloads ─────────────────────────────────────────────────────────────

export type CreateBookPayload = {
  name: string;
};

export type CreateEntryPayload = Omit<Entry, "id" | "bookId" | "createdAt" | "updatedAt">;

export type UpdateEntryPayload = Partial<CreateEntryPayload>;

// ─── Completion ───────────────────────────────────────────────────────────────

export function entryIsComplete(entry: Entry): boolean {
  return (
    !!entry.english &&
    !!entry.hindi &&
    !!entry.filipino
  );
}

// ─── API response envelope ────────────────────────────────────────────────────

export interface ApiOk<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
}

export type ApiResponse<T> = ApiOk<T> | ApiError;
