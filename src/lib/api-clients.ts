// Server-only API client utilities for external services
// Each function returns null on failure — never throws

const TIMEOUT_MS = 10000;

function withTimeout(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

// --- Kurdish TTS ---
export async function generateTTS(
  text: string,
  voice?: string
): Promise<Buffer | null> {
  const apiUrl = process.env.KURDISH_TTS_API_URL;
  const apiKey = process.env.KURDISH_TTS_API_KEY;
  if (!apiUrl || !apiKey) return null;

  try {
    const res = await fetch(`${apiUrl}/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ text, voice: voice || 'default' }),
      signal: withTimeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

// --- Forvo Pronunciation ---
export interface ForvoResult {
  audioUrl: string;
  username: string;
}

export async function fetchForvoPronunciation(
  word: string
): Promise<ForvoResult | null> {
  const apiKey = process.env.FORVO_API_KEY;
  if (!apiKey) return null;

  try {
    const encoded = encodeURIComponent(word);
    const res = await fetch(
      `https://apifree.forvo.com/key/${apiKey}/format/json/action/word-pronunciations/word/${encoded}/language/ku`,
      { signal: withTimeout(TIMEOUT_MS) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const items = data?.items;
    if (!Array.isArray(items) || items.length === 0) return null;

    // Pick the highest-rated pronunciation
    const best = items.sort(
      (a: { rate: number }, b: { rate: number }) => (b.rate || 0) - (a.rate || 0)
    )[0];
    return {
      audioUrl: best.pathmp3 || best.pathogg || '',
      username: best.username || 'unknown',
    };
  } catch {
    return null;
  }
}

// --- Wiktionary Definition (ku.wiktionary.org) ---
export async function fetchWiktionaryDefinition(
  word: string
): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(word);
    const res = await fetch(
      `https://ku.wiktionary.org/w/api.php?action=query&titles=${encoded}&prop=extracts&explaintext=1&format=json`,
      { signal: withTimeout(TIMEOUT_MS) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    if (!pageId || pageId === '-1') return null;

    const extract = pages[pageId]?.extract;
    if (!extract || typeof extract !== 'string') return null;

    // Clean up: take first meaningful paragraph
    const lines = extract
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0 && !l.startsWith('=='));

    return lines.slice(0, 3).join('\n') || null;
  } catch {
    return null;
  }
}

// --- Azure Translator ---
export async function translateWithAzure(
  text: string,
  from: string,
  to: string
): Promise<string | null> {
  const key = process.env.AZURE_TRANSLATOR_KEY;
  const region = process.env.AZURE_TRANSLATOR_REGION || 'westeurope';
  if (!key) return null;

  try {
    const res = await fetch(
      `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${from}&to=${to}`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Ocp-Apim-Subscription-Region': region,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ text }]),
        signal: withTimeout(TIMEOUT_MS),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0]?.translations?.[0]?.text || null;
  } catch {
    return null;
  }
}
