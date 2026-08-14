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
  | "assessments";

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
  assessments: [],
};

/* ---------------------------------------------------------------------------
 * Storage backends
 *  1) Upstash Redis (REST) — for Vercel / serverless (read-only filesystem).
 *     Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *     (or Vercel KV: KV_REST_API_URL + KV_REST_API_TOKEN).
 *  2) Local JSON files in ./data — for VPS / local development.
 * ------------------------------------------------------------------------- */
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
const useRedis = Boolean(REDIS_URL && REDIS_TOKEN);

const rkey = (name: Collection) => `wuwei:${name}`;

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

export async function readCollection<T = any>(name: Collection): Promise<T> {
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

export async function writeCollection(name: Collection, data: any): Promise<void> {
  if (useRedis) {
    await redisSet(rkey(name), JSON.stringify(data));
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, FILES[name]), JSON.stringify(data, null, 2), "utf-8");
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
