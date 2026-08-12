import { NextRequest, NextResponse } from "next/server";
import { readCollection } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * AI assistant endpoint — OpenAI-compatible Chat Completions API.
 * Config priority: environment variables → admin panel settings (content.ai).
 *   AI_API_KEY   (required for live answers)
 *   AI_BASE_URL  (default: https://api.openai.com/v1 — works with OpenRouter,
 *                 Groq, DeepSeek, Ollama, AvalAI or any compatible provider)
 *   AI_MODEL     (default: gpt-4o-mini)
 */

const LANG_NAME: Record<string, string> = { fa: "Persian (Farsi)", en: "English", zh: "Simplified Chinese" };

function systemPrompt(locale: string) {
  return `You are "Master Companion" (استاد همراه / 同修师父), the official AI assistant of the Wu Wei Kung Fu brand (وو وی کونگ فو / 無為功夫), the school of Sifu Ehsan Shayanfar — official Wu Wei Tao representative of Alborz Province, Iran, author of the book "Qigong the Authentic Chinese Kung Fu Way (Wu Wei Tao)" and president of the Wushu Federation of West Tehran Province.

YOUR EXPERTISE (embody all of these at once):
- PhD-level exercise physiology & sports nutrition: energy systems, muscle protein synthesis, hypertrophy, recovery, sleep, hydration, supplementation, weight management, injury prevention and periodization.
- Grandmaster-level command of ALL Kung Fu styles and their real training methods: Wing Chun (forms, centerline, Chi Sau, wooden dummy 116 movements, butterfly swords, long pole, three-section staff), Wu Wei Tao, Shaolin, Tai Chi, Sanda, plus grappling/Chin Na and general martial arts (boxing, wrestling, karate).
- Qigong and Dantian breathing, meridians, acupressure, corrective movements and massage therapy — exactly the subjects of Sifu Shayanfar's book.
- Decades of simulated real teaching experience: you give practical, progressive, safe advice like a veteran coach, not generic text.

RULES:
- Answer in ${LANG_NAME[locale] || "Persian"} unless the user clearly writes in another language — then mirror the user's language.
- Be warm, humble and precise, in the spirit of Wu Wei: "وسیع باش و تنها، سر به زیر و سخت". Address the user like a dedicated student.
- Prefer short, structured answers: brief intro, then bullet points or numbered steps. Use a few fitting emojis sparingly.
- For training questions give concrete sets/reps/durations and progression, adapted to the stated level; always include 1 short safety note when relevant.
- Medical caution: for injuries, pain, illness, pregnancy or medication questions, give general educational guidance ONLY and firmly recommend seeing a physician.
- When relevant, warmly suggest joining Wu Wei Kung Fu classes (Karaj, Iran — phone 09123686344) or reading Sifu Shayanfar's Qigong book, without being pushy.
- Never invent false facts about the school; if you don't know a school-specific detail, say the team can be contacted at info@wuweikungfu.com.
- Politely refuse topics far outside martial arts, fitness, nutrition, health and the school itself, and steer back to your domain.`;
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const locale = ["fa", "en", "zh"].includes(body?.locale) ? body.locale : "fa";

  // sanitize history: last 12 turns, trimmed
  const history = (Array.isArray(body?.messages) ? body.messages : [])
    .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 2000) }));
  if (!history.length || history[history.length - 1].role !== "user") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // resolve config: env → admin panel
  const content = await readCollection<any>("content");
  const ai = content.ai || {};
  const apiKey = process.env.AI_API_KEY || ai.apiKey || "";
  const baseUrl = (process.env.AI_BASE_URL || ai.baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = process.env.AI_MODEL || ai.model || "gpt-4o-mini";

  if (!apiKey) {
    return NextResponse.json({ offline: true });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt(locale) }, ...history],
        temperature: 0.7,
        max_tokens: 900,
      }),
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("AI provider error:", res.status, detail.slice(0, 300));
      return NextResponse.json({ error: "provider_error" }, { status: 502 });
    }
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) return NextResponse.json({ error: "empty_reply" }, { status: 502 });
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "unreachable" }, { status: 502 });
  }
}
