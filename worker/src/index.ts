/**
 * Our Dictionary — Cloudflare Worker API
 */

export interface Env {
  DB: D1Database;
  VOICES: R2Bucket;
  ALLOWED_ORIGIN: string;
}

function uid(): string {
  return crypto.randomUUID();
}

function shareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const arr = new Uint8Array(6);
  crypto.getRandomValues(arr);
  arr.forEach((b) => (code += chars[b % chars.length]));
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

function cors(env: Env): HeadersInit {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function ok<T>(data: T, env: Env, status = 200): Response {
  return new Response(JSON.stringify({ ok: true, data }), {
    status,
    headers: { "Content-Type": "application/json", ...cors(env) },
  });
}

function err(message: string, env: Env, status = 400): Response {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { "Content-Type": "application/json", ...cors(env) },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBook(row: any) {
  return {
    id: row.id,
    name: row.name,
    shareCode: row.share_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEntry(row: any) {
  return {
    id: row.id,
    bookId: row.book_id,
    english: row.english,
    englishExample: row.english_example,
    englishVoice: row.english_voice,
    hindi: row.hindi,
    hindiPronunciation: row.hindi_pronunciation,
    hindiExample: row.hindi_example,
    hindiVoice: row.hindi_voice,
    filipino: row.filipino,
    filipinoExample: row.filipino_example,
    filipinoVoice: row.filipino_voice,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // ── Preflight ────────────────────────────────────────────────────────────
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(env) });
    }

    try {

      // ── POST /api/books — create book ────────────────────────────────────
      if (path === "/api/books" && method === "POST") {
        const body = await request.json<{ name?: string }>();
        const id   = uid();
        const code = shareCode();
        const name = body.name?.trim() || "Our Dictionary";

        await env.DB.prepare(
          `INSERT INTO books (id, name, share_code) VALUES (?, ?, ?)`
        ).bind(id, name, code).run();

        const row = await env.DB.prepare(
          `SELECT * FROM books WHERE id = ?`
        ).bind(id).first();

        return ok(mapBook(row), env, 201);
      }

      // ── GET /api/books/:code — get book by share code or id ──────────────
      const bookMatch = path.match(/^\/api\/books\/([^/]+)$/);
      if (bookMatch && method === "GET") {
        const param = decodeURIComponent(bookMatch[1]);

        let row = await env.DB.prepare(
          `SELECT * FROM books WHERE share_code = ?`
        ).bind(param).first();

        if (!row) {
          row = await env.DB.prepare(
            `SELECT * FROM books WHERE id = ?`
          ).bind(param).first();
        }

        if (!row) return err("Book not found", env, 404);
        return ok(mapBook(row), env);
      }

      // ── PATCH /api/books/:bookId — update book name ───────────────────────
      if (bookMatch && method === "PATCH") {
        const bookId = bookMatch[1];
        const body   = await request.json<{ name?: string }>();
        const name   = body.name?.trim();
        if (!name) return err("Name required", env);

        await env.DB.prepare(
          `UPDATE books SET name = ?, updated_at = ? WHERE id = ?`
        ).bind(name, new Date().toISOString(), bookId).run();

        const row = await env.DB.prepare(
          `SELECT * FROM books WHERE id = ?`
        ).bind(bookId).first();

        if (!row) return err("Book not found", env, 404);
        return ok(mapBook(row), env);
      }

      // ── /api/books/:bookId/entries — list or create ───────────────────────
      const entriesMatch = path.match(/^\/api\/books\/([^/]+)\/entries$/);
      if (entriesMatch) {
        const bookId = entriesMatch[1];

        // GET — list all entries
        if (method === "GET") {
          const { results } = await env.DB.prepare(
            `SELECT * FROM entries WHERE book_id = ? ORDER BY created_at DESC`
          ).bind(bookId).all();

          return ok(results.map(mapEntry), env);
        }

        // POST — create entry
        if (method === "POST") {
          const body = await request.json<Record<string, string | null>>();
          const id  = uid();
          const now = new Date().toISOString();

          await env.DB.prepare(`
            INSERT INTO entries (
              id, book_id,
              english, english_example, english_voice,
              hindi, hindi_pronunciation, hindi_example, hindi_voice,
              filipino, filipino_example, filipino_voice,
              notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            id, bookId,
            body.english          ?? null,
            body.englishExample   ?? null,
            null,
            body.hindi            ?? null,
            body.hindiPronunciation ?? null,
            body.hindiExample     ?? null,
            null,
            body.filipino         ?? null,
            body.filipinoExample  ?? null,
            null,
            body.notes            ?? null,
            now, now
          ).run();

          const row = await env.DB.prepare(
            `SELECT * FROM entries WHERE id = ?`
          ).bind(id).first();

          return ok(mapEntry(row), env, 201);
        }
      }

      // ── /api/entries/:entryId — get, update, delete ───────────────────────
      const entryMatch = path.match(/^\/api\/entries\/([^/]+)$/);
      if (entryMatch) {
        const entryId = entryMatch[1];

        if (method === "GET") {
          const row = await env.DB.prepare(
            `SELECT * FROM entries WHERE id = ?`
          ).bind(entryId).first();

          if (!row) return err("Entry not found", env, 404);
          return ok(mapEntry(row), env);
        }

        if (method === "PATCH") {
          const body = await request.json<Record<string, string | null>>();
          const fieldMap: Record<string, string> = {
            english:             "english",
            englishExample:      "english_example",
            hindi:               "hindi",
            hindiPronunciation:  "hindi_pronunciation",
            hindiExample:        "hindi_example",
            filipino:            "filipino",
            filipinoExample:     "filipino_example",
            notes:               "notes",
          };

          const sets: string[] = ["updated_at = ?"];
          const values: (string | null)[] = [new Date().toISOString()];

          for (const [jsKey, sqlCol] of Object.entries(fieldMap)) {
            if (jsKey in body) {
              sets.push(`${sqlCol} = ?`);
              values.push(body[jsKey]);
            }
          }
          values.push(entryId);

          await env.DB.prepare(
            `UPDATE entries SET ${sets.join(", ")} WHERE id = ?`
          ).bind(...values).run();

          const row = await env.DB.prepare(
            `SELECT * FROM entries WHERE id = ?`
          ).bind(entryId).first();

          return ok(mapEntry(row), env);
        }

        if (method === "DELETE") {
          for (const lang of ["english", "hindi", "filipino"]) {
            await env.VOICES.delete(`${entryId}/${lang}`);
          }
          await env.DB.prepare(
            `DELETE FROM entries WHERE id = ?`
          ).bind(entryId).run();

          return ok({ deleted: true }, env);
        }
      }

      // ── /api/entries/:entryId/voice/:lang — upload, stream, delete ────────
      const voiceMatch = path.match(
        /^\/api\/entries\/([^/]+)\/voice\/(english|hindi|filipino)$/
      );
      if (voiceMatch) {
        const [, entryId, lang] = voiceMatch;
        const r2Key = `${entryId}/${lang}`;
        const dbCol = `${lang}_voice`;

        if (method === "POST") {
          if (!request.body) return err("No body", env);
          const contentType = request.headers.get("Content-Type") ?? "audio/webm";

          await env.VOICES.put(r2Key, request.body, {
            httpMetadata: { contentType },
          });

          await env.DB.prepare(
            `UPDATE entries SET ${dbCol} = ?, updated_at = ? WHERE id = ?`
          ).bind(r2Key, new Date().toISOString(), entryId).run();

          return ok({ key: r2Key }, env, 201);
        }

        if (method === "GET") {
          const obj = await env.VOICES.get(r2Key);
          if (!obj) return err("Recording not found", env, 404);

          return new Response(obj.body, {
            headers: {
              "Content-Type": obj.httpMetadata?.contentType ?? "audio/webm",
              "Cache-Control": "private, max-age=3600",
              ...cors(env),
            },
          });
        }

        if (method === "DELETE") {
          await env.VOICES.delete(r2Key);
          await env.DB.prepare(
            `UPDATE entries SET ${dbCol} = NULL, updated_at = ? WHERE id = ?`
          ).bind(new Date().toISOString(), entryId).run();

          return ok({ deleted: true }, env);
        }
      }

      return err("Not found", env, 404);

    } catch (e) {
      console.error(e);
      return err("Internal server error", env, 500);
    }
  },
};
