import OpenAI from "openai";

export function aiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

let client: OpenAI | null = null;
function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

/**
 * Run a chat completion. Returns null if AI is not configured or errors, so
 * callers can fall back to deterministic templates. This keeps the whole app
 * runnable with zero API keys.
 */
export async function aiComplete(
  system: string,
  user: string,
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<string | null> {
  const c = getClient();
  if (!c) return null;
  try {
    const res = await c.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 900,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    return res.choices[0]?.message?.content?.trim() ?? null;
  } catch (err) {
    console.error("[ai] completion failed, falling back to template", err);
    return null;
  }
}
