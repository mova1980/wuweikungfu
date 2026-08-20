import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { readCollection, writeCollection } from "./db";

/* ---------------------------------------------------------------------------
 * Admin authentication
 *  - Password priority:  1) hash stored in DB (`settings.adminPassword`)
 *                        2) ADMIN_PASSWORD env var
 *                        3) local-dev default (never shown in the UI)
 *  - Hashes: scrypt (Node built-in) with a 16-byte random salt, 64-byte key.
 *  - All comparisons are constant-time (timingSafeEqual).
 * ------------------------------------------------------------------------- */

const DEV_DEFAULT_PASSWORD = "wuwei2026"; // local development only

type StoredHash = { salt: string; hash: string };

export async function getStoredAdminHash(): Promise<StoredHash | null> {
  try {
    const s = await readCollection<any>("settings");
    const p = s?.adminPassword;
    return p?.salt && p?.hash ? { salt: String(p.salt), hash: String(p.hash) } : null;
  } catch {
    return null;
  }
}

function scryptMatches(password: string, salt: string, expectedHex: string): boolean {
  try {
    const actual = scryptSync(password, Buffer.from(salt, "hex"), 64);
    const expected = Buffer.from(expectedHex, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const stored = await getStoredAdminHash();
  if (stored) return scryptMatches(password, stored.salt, stored.hash);
  return safeEqual(password, process.env.ADMIN_PASSWORD || DEV_DEFAULT_PASSWORD);
}

export async function setAdminPassword(password: string): Promise<void> {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, Buffer.from(salt, "hex"), 64).toString("hex");
  const s = await readCollection<any>("settings");
  await writeCollection("settings", {
    ...s,
    adminPassword: { salt, hash, updatedAt: new Date().toISOString() },
  });
}

/** true if the admin already created a custom password from the panel */
export async function hasPanelPassword(): Promise<boolean> {
  return (await getStoredAdminHash()) !== null;
}

/* ---------------------------------------------------------------------------
 * Bruteforce guard — sliding window of failed attempts per IP.
 * (per serverless instance; still stops casual hammering)
 * ------------------------------------------------------------------------- */
const WINDOW_MS = 5 * 60 * 1000;
const MAX_FAILS = 8;
const fails = new Map<string, number[]>();

export function tooManyFails(ip: string): boolean {
  const now = Date.now();
  const list = (fails.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  fails.set(ip, list);
  return list.length >= MAX_FAILS;
}

export function recordFail(ip: string): void {
  const list = fails.get(ip) || [];
  list.push(Date.now());
  fails.set(ip, list);
}

export function clearFails(ip: string): void {
  fails.delete(ip);
}
