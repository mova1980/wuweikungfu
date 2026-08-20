import { promises as fs } from "fs";
import path from "path";

// build-time seeds — guaranteed to be bundled in serverless deployments (Vercel)
import seedContent from "../../data/content.json";
import seedPosts from "../../data/posts.json";
import seedTechniques from "../../data/techniques.json";
import seedVideos from "../../data/videos.json";
import seedEvents from "../../data/events.json";
import seedProducts from "../../data/products.json";
import seedTestimonials from "../../data/testimonials.json";
import seedCoaches from "../../data/coaches.json";
import seedGallery from "../../data/gallery.json";

const DATA_DIR = path.join(process.cwd(), "data");

export type Collection =
  | "content"
  | "posts"
  | "techniques"
  | "videos"
  | "events"
  | "products"
  | "testimonials"
  | "messages"
  | "registrations"
  | "orders"
  | "coaches"
  | "assessments"
  | "gallery"
  | "settings";

const FILES: Record<Collection, string> = {
  content: "content.json",
  posts: "posts.json",
  techniques: "techniques.json",
  videos: "videos.json",
  events: "events.json",
  products: "products.json",
  testimonials: "testimonials.json",
  messages: "messages.json",
  registrations: "registrations.json",
  orders: "orders.json",
  coaches: "coaches.json",
  assessments: "assessments.json",
  gallery: "gallery.json",
  settings: "settings.json",
};

const SEEDS: Record<Collection, any> = {
  content: seedContent,
  posts: seedPosts,
  techniques: seedTechniques,
  videos: seedVideos,
  events: seedEvents,
  products: seedProducts,
  testimonials: seedTestimonials,
  messages: [],
  registrations: [],
  orders: [],
  coaches: seedCoaches,
  gallery: seedGallery as any,
  assessments: [],
  settings: {},
};

/* ---------------------------------------------------------------------------
 * Storage backends (in order of precedence)
 *  1) Supabase Postgres (JSONB key-value via PostgREST) — recommended for Vercel.
 *     Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *     Table: collections(key text pk, data jsonb, updated_at timestamptz)
 *     On first read, existing Redis/file/seed data is auto-imported (lazy migration),
 *     so switching backends never loses admin-saved content.
 *  2) Upstash Redis (REST) — kept as replica/fallback when its env vars exist.
 *  3) Local JSON files in ./data — for VPS / local development.
 * ------------------------------------------------------------------------- */
const SB_URL = (process.env.SUPABASE_URL || "")
  .trim()
  .replace(/\/+$/, "")          // trailing slashes
  .replace(/\/rest\/v1$/i, "")  // tolerate pasted "Data API URL" too
  .replace(/\/+$/, "");
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const useSupabase = Boolean(SB_URL && SB_KEY && /^https?:\/\//.test(SB_URL));

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
const useRedis = Boolean(REDIS_URL && REDIS_TOKEN);

const rkey = (name: Collection) => `wuwei:${name}`;

/* ---- Supabase (PostgREST) ---- */
const sbHeaders: Record<string, string> = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  "Content-Type": "application/json",
};

async function sbGet(key: string): Promise<any | null> {
  const res = await fetch(
    `${SB_URL}/rest/v1/collections?select=data&key=eq.${encodeURIComponent(key)}`,
    { headers: { ...sbHeaders, Accept: "application/json" }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`supabase read ${res.status}`);
  const rows = await res.json();
  return Array.isArray(rows) && rows.length ? rows[0].data : null;
}

async function sbSet(key: string, data: any): Promise<void> {
  const res = await fetch(`${SB_URL}/rest/v1/collections?on_conflict=key`, {
    method: "POST",
    headers: { ...sbHeaders, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ key, data, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`supabase write ${res.status} ${body.slice(0, 200)}`);
  }
}

/* ---- legacy backends (Redis → local file → bundled seed) ---- */
async function redisGet(key: string): Promise<string | null> {
  const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.result ?? null;
}

async function redisSet(key: string, value: string): Promise<void> {
  await fetch(`${REDIS_URL}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    body: value,
  });
}

async function readLegacy<T = any>(name: Collection): Promise<T> {
  if (useRedis) {
    try {
      const raw = await redisGet(rkey(name));
      if (raw != null) return JSON.parse(raw) as T;
    } catch {}
    return structuredClone(SEEDS[name]) as T;
  }
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, FILES[name]), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return structuredClone(SEEDS[name]) as T;
  }
}

async function writeLegacy(name: Collection, data: any): Promise<void> {
  if (useRedis) {
    await redisSet(rkey(name), JSON.stringify(data));
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, FILES[name]), JSON.stringify(data, null, 2), "utf-8");
}

export async function readCollection<T = any>(name: Collection): Promise<T> {
  if (useSupabase) {
    try {
      const row = await sbGet(rkey(name));
      if (row != null) return row as T;
      // one-time lazy migration: import Redis/file/seed data into Supabase
      const legacy = await readLegacy<T>(name);
      void sbSet(rkey(name), legacy).catch(() => {});
      return legacy;
    } catch {
      // Supabase unreachable → serve from legacy so the site stays up
      return readLegacy<T>(name);
    }
  }
  return readLegacy<T>(name);
}

export async function writeCollection(name: Collection, data: any): Promise<void> {
  if (useSupabase) {
    await sbSet(rkey(name), data);
    // keep the Redis replica in sync when configured (non-blocking)
    if (useRedis) void redisSet(rkey(name), JSON.stringify(data)).catch(() => {});
    return;
  }
  await writeLegacy(name, data);
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ---------------------------------------------------------------------------
 * Health probe — used by /api/admin/db-status so the admin can SEE which
 * backend is live and whether Supabase answers. Never exposes secrets.
 * ------------------------------------------------------------------------- */
export async function dbStatus() {
  const hostOf = (u: string) => {
    try {
      return new URL(u).host;
    } catch {
      return u.replace(/^https?:\/\//, "").split("/")[0] || null;
    }
  };
  const out: any = {
    primary: useSupabase ? "supabase" : useRedis ? "redis" : "local-files",
    supabase: { configured: useSupabase, host: SB_URL ? hostOf(SB_URL) : null, ping: null as string | null },
    redis: { configured: useRedis, host: REDIS_URL ? hostOf(REDIS_URL) : null },
  };
  if (useSupabase) {
    try {
      await sbGet("wuwei:__ping__"); // 200 with [] (or a row) both mean: reachable
      out.supabase.ping = "ok";
    } catch (e: any) {
      out.supabase.ping = String(e?.message || e).slice(0, 160);
      out.primary += " → supabase unreachable, serving from fallback";
    }
  }
  return out;
}
