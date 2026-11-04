// Server-side AI proxy. Provider API keys are read from environment variables at
// runtime so they never get embedded in the browser bundle.

const DEFAULT_OPENROUTER_MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free';
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const MAX_PROMPT_CHARS = 8000;
const PROVIDER_TIMEOUT_MS = 7000;

const env = (...names) => {
  for (const name of names) {
    const value = Netlify.env.get(name);
    if (value) return value;
  }
  return '';
};

async function chatCompletion(url, key, model, systemPrompt, userPrompt, extraHeaders = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...extraHeaders },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 50
    }),
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

async function gemini(key, model, systemPrompt, userPrompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 50 }
      }),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
    }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const systemPrompt = typeof body?.systemPrompt === 'string' ? body.systemPrompt.slice(0, MAX_PROMPT_CHARS) : '';
  const userPrompt = typeof body?.userPrompt === 'string' ? body.userPrompt.slice(0, MAX_PROMPT_CHARS) : '';
  if (!systemPrompt || !userPrompt) {
    return Response.json({ error: 'systemPrompt and userPrompt are required' }, { status: 400 });
  }

  const providers = [];
  const openRouterKey = env('OPENROUTER_API_KEY', 'VITE_OPENROUTER_API_KEY');
  const grokKey = env('GROK_API_KEY', 'VITE_GROK_API_KEY');
  const geminiKey = env('GEMINI_API_KEY', 'VITE_GEMINI_API_KEY');
  const groqKey = env('GROQ_API_KEY', 'VITE_GROQ_API_KEY');

  if (openRouterKey) {
    const model = env('OPENROUTER_MODEL', 'VITE_OPENROUTER_MODEL') || DEFAULT_OPENROUTER_MODEL;
    providers.push(['OpenRouter', () => chatCompletion('https://openrouter.ai/api/v1/chat/completions', openRouterKey, model, systemPrompt, userPrompt)]);
  }
  if (grokKey) {
    providers.push(['Grok', () => chatCompletion('https://api.x.ai/v1/chat/completions', grokKey, 'grok-beta', systemPrompt, userPrompt)]);
  }
  if (geminiKey) {
    const model = env('GEMINI_MODEL', 'VITE_GEMINI_MODEL') || DEFAULT_GEMINI_MODEL;
    providers.push(['Gemini', () => gemini(geminiKey, model, systemPrompt, userPrompt)]);
  }
  if (groqKey) {
    providers.push(['Groq', () => chatCompletion('https://api.groq.com/openai/v1/chat/completions', groqKey, 'llama-3.3-70b-versatile', systemPrompt, userPrompt)]);
  }

  if (providers.length === 0) {
    return Response.json({ text: null, error: 'No server AI provider is configured.' });
  }

  const failures = [];
  for (const [name, run] of providers) {
    try {
      const text = await run();
      if (text) return Response.json({ text, provider: name });
      failures.push(`${name} returned no text`);
    } catch (error) {
      failures.push(`${name} failed (${error?.name === 'TimeoutError' ? 'timeout' : error?.message || 'error'})`);
    }
  }
  return Response.json({ text: null, error: `${failures.join('; ')}.` });
};

export const config = {
  path: '/api/ai'
};
