const CACHE_NAME    = "our-dictionary-v1";
const OFFLINE_QUEUE = "our-dictionary-queue";

// App shell files to precache
const SHELL = [
  "/",
  "/manifest.json",
];

// ── Install: precache shell ────────────────────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ─────────────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first for API, cache-first for shell ───────────────────────
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // API calls — network only, queue mutations if offline
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(networkWithQueue(e.request));
    return;
  }

  // Navigation — serve shell from cache, fallback to network
  if (e.request.mode === "navigate") {
    e.respondWith(
      caches.match("/").then((cached) => cached || fetch(e.request))
    );
    return;
  }

  // Static assets — cache first
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      });
    })
  );
});

// ── Network with offline queue for mutations ──────────────────────────────────
async function networkWithQueue(request) {
  try {
    const res = await fetch(request.clone());
    if (res.ok) replayQueue();
    return res;
  } catch (e) {
    const method = request.method;
    if (method === "PATCH" || method === "DELETE") {
      await enqueue(request);
      return new Response(
        JSON.stringify({ ok: true, data: null, queued: true }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ ok: false, error: "offline" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ── Queue helpers ─────────────────────────────────────────────────────────────
async function enqueue(request) {
  const cache = await caches.open(OFFLINE_QUEUE);
  const body  = request.method !== "GET" ? await request.text() : null;
  const entry = {
    url:     request.url,
    method:  request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body,
  };
  await cache.put(
    new Request(`queue:${Date.now()}`),
    new Response(JSON.stringify(entry))
  );
}

async function replayQueue() {
  const cache = await caches.open(OFFLINE_QUEUE);
  const keys  = await cache.keys();
  for (const key of keys) {
    const res = await cache.match(key);
    if (!res) continue;
    const entry = await res.json();
    try {
      await fetch(entry.url, {
        method:  entry.method,
        headers: entry.headers,
        body:    entry.body,
      });
      await cache.delete(key);
    } catch (e) {
      break;
    }
  }
}
