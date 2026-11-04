import { EXPANDED_LOCAL_VOCABULARY } from './localBotVocabulary.js';

const DEFAULT_OPENROUTER_MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free';

// Lightweight personas to feed directly into the LLM system prompt
export const BOT_PERSONAS = [
  { id: 'grammar', name: 'Grammar Glue', emoji: '🤖', style: 'Sensible connectors, articles, prepositions, and clean verbs' },
  { id: 'goblin', name: 'Chaotic Goblin', emoji: '🤪', style: 'Absurd nouns, slapstick verbs, sudden plot twists, and weird adjectives' },
  { id: 'soap', name: 'Dramatic Soap', emoji: '🎭', style: 'Melodramatic vocabulary, gasps, secret betrayals, and intense emotions' },
  { id: 'scifi', name: 'Sci-Fi Nerd', emoji: '🚀', style: 'Futuristic, cosmic, quantum, cybernetic, and space-opera words' },
  { id: 'spooky', name: 'Spooky Ghost', emoji: '👻', style: 'Eerie, haunted, mysterious, and supernatural vocabulary' }
];

const LOCAL_BOT_VOCABULARY = {
  grammar: {
    adjectives: ['ancient', 'brave', 'careful', 'clever', 'curious', 'distant', 'eager', 'familiar', 'fearless', 'gentle', 'hidden', 'honest', 'lonely', 'patient', 'restless', 'silent', 'strange', 'useful', 'warm', 'wild'],
    nouns: ['artist', 'bridge', 'captain', 'clue', 'creature', 'detective', 'garden', 'journey', 'letter', 'library', 'map', 'merchant', 'messenger', 'neighbor', 'passenger', 'promise', 'secret', 'stranger', 'tower', 'village'],
    verbs: ['arrived', 'asked', 'believed', 'carried', 'chose', 'discovered', 'followed', 'found', 'noticed', 'opened', 'remembered', 'returned', 'searched', 'shared', 'waited', 'wandered'],
    adverbs: ['carefully', 'eagerly', 'eventually', 'gently', 'honestly', 'quietly', 'quickly', 'suddenly'],
    connectors: ['although', 'because', 'before', 'however', 'meanwhile', 'therefore', 'while'],
    prepositions: ['across', 'around', 'beneath', 'beside', 'beyond', 'during', 'inside', 'toward']
  },
  goblin: {
    adjectives: ['absurd', 'bouncy', 'crunchy', 'crooked', 'enormous', 'fizzy', 'fluffy', 'greasy', 'lopsided', 'mischievous', 'mustard-colored', 'noisy', 'prickly', 'ridiculous', 'soggy', 'sparkly', 'sticky', 'tiny', 'wobbly', 'zany'],
    nouns: ['banana', 'beard', 'bucket', 'cabbage', 'chicken', 'goblin', 'hamster', 'meatball', 'mustache', 'pickle', 'pigeon', 'pudding', 'sock', 'taco', 'teapot', 'trampoline', 'turnip', 'waffle', 'wizard', 'yak'],
    verbs: ['burped', 'cartwheeled', 'crashed', 'danced', 'flopped', 'gobbled', 'juggled', 'launched', 'sprinted', 'squawked', 'stumbled', 'swooped', 'tumbled', 'yeeted'],
    adverbs: ['backward', 'clumsily', 'furiously', 'noisily', 'sideways', 'suspiciously', 'unexpectedly'],
    connectors: ['anyway', 'because', 'meanwhile', 'oops', 'otherwise', 'suddenly', 'unfortunately'],
    prepositions: ['above', 'around', 'behind', 'beneath', 'inside', 'through', 'under']
  },
  soap: {
    adjectives: ['beloved', 'bitter', 'devastated', 'dramatic', 'forbidden', 'heartbroken', 'jealous', 'mysterious', 'passionate', 'secret', 'shocking', 'tearful', 'wealthy'],
    nouns: ['affair', 'bride', 'confession', 'diamond', 'envelope', 'family', 'heir', 'heiress', 'inheritance', 'mansion', 'marriage', 'mother', 'rival', 'romance', 'rumor', 'sibling', 'suitor', 'will'],
    verbs: ['admitted', 'betrayed', 'confessed', 'collapsed', 'demanded', 'embraced', 'forgave', 'gasped', 'inherited', 'rejected', 'revealed', 'sobbed', 'vanished'],
    adverbs: ['dramatically', 'heartlessly', 'passionately', 'secretly', 'tearfully'],
    connectors: ['although', 'despite', 'finally', 'meanwhile', 'nevertheless', 'suddenly', 'until'],
    prepositions: ['after', 'among', 'behind', 'beneath', 'inside', 'toward']
  },
  scifi: {
    adjectives: ['alien', 'atomic', 'biometric', 'cosmic', 'cybernetic', 'dimensional', 'galactic', 'holographic', 'interstellar', 'magnetic', 'mechanical', 'quantum', 'robotic', 'synthetic', 'uncharted'],
    nouns: ['android', 'asteroid', 'colony', 'computer', 'constellation', 'crew', 'cyborg', 'dimension', 'engine', 'galaxy', 'hologram', 'laboratory', 'meteor', 'nebula', 'orbit', 'planet', 'portal', 'robot', 'starship', 'wormhole'],
    verbs: ['activated', 'calculated', 'crashed', 'decoded', 'launched', 'materialized', 'navigated', 'rebooted', 'scanned', 'teleported', 'transmitted', 'warped'],
    adverbs: ['automatically', 'gravely', 'intergalactically', 'silently', 'unexpectedly'],
    connectors: ['afterward', 'before', 'meanwhile', 'otherwise', 'therefore', 'until'],
    prepositions: ['across', 'beyond', 'inside', 'past', 'through', 'toward']
  },
  spooky: {
    adjectives: ['abandoned', 'ashen', 'cursed', 'eerie', 'faint', 'forgotten', 'haunted', 'hollow', 'pale', 'restless', 'shadowy', 'sinister', 'spectral', 'unseen'],
    nouns: ['attic', 'candle', 'cemetery', 'crypt', 'footstep', 'forest', 'ghost', 'grave', 'lantern', 'mirror', 'phantom', 'raven', 'shadow', 'skeleton', 'spirit', 'tomb', 'whisper', 'window', 'witch', 'wolf'],
    verbs: ['appeared', 'creaked', 'drifted', 'echoed', 'flickered', 'howled', 'lurched', 'murmured', 'rattled', 'shivered', 'vanished', 'wandered'],
    adverbs: ['eerily', 'faintly', 'silently', 'slowly', 'suddenly', 'uneasily'],
    connectors: ['although', 'before', 'meanwhile', 'somehow', 'until', 'when'],
    prepositions: ['beneath', 'beside', 'beyond', 'inside', 'through', 'within']
  }
};

const COMMON_LOCAL_WORDS = {
  articles: ['a', 'an', 'the', 'another', 'every', 'some'],
  pronouns: ['he', 'she', 'they', 'we', 'someone', 'something', 'it'],
  verbs: ['became', 'felt', 'heard', 'looked', 'seemed', 'was', 'were'],
  adjectives: ['bright', 'dark', 'old', 'small', 'strange'],
  nouns: ['door', 'friend', 'house', 'key', 'room', 'sound'],
  connectors: ['and', 'but', 'because', 'before', 'while'],
  prepositions: ['at', 'behind', 'in', 'near', 'on', 'over', 'under', 'with']
};

export function generateLocalBotWord(storyWords, personaId) {
  const vocabulary = LOCAL_BOT_VOCABULARY[personaId] || LOCAL_BOT_VOCABULARY.grammar;
  const lastWord = storyWords[storyWords.length - 1]?.word || '';
  const cleanLastWord = lastWord.toLowerCase().replace(/[^a-z]/g, '');
  const recent = storyWords.slice(-24).map(entry => entry.word.toLowerCase().replace(/[^a-z]/g, ''));
  const isSentenceStart = !lastWord || /[.!?]$/.test(lastWord);
  const allWords = Object.values(vocabulary).flat();
  let candidates;
  let expandedCandidates;

  if (isSentenceStart) {
    candidates = ['Meanwhile', 'Fortunately', 'Eventually', 'Suddenly', ...COMMON_LOCAL_WORDS.articles];
    expandedCandidates = [...vocabulary.connectors, ...COMMON_LOCAL_WORDS.connectors];
  } else if (['the', 'a', 'an', 'another', 'every', 'some'].includes(cleanLastWord)) {
    candidates = [...vocabulary.adjectives, ...COMMON_LOCAL_WORDS.adjectives, ...vocabulary.nouns, ...COMMON_LOCAL_WORDS.nouns];
    expandedCandidates = [...EXPANDED_LOCAL_VOCABULARY.adjectives, ...EXPANDED_LOCAL_VOCABULARY.nouns];
  } else if (['in', 'on', 'at', 'under', 'over', 'behind', 'beside', 'through', 'inside', 'within', 'with', 'toward'].includes(cleanLastWord)) {
    candidates = [...COMMON_LOCAL_WORDS.articles, ...COMMON_LOCAL_WORDS.pronouns];
    expandedCandidates = [...EXPANDED_LOCAL_VOCABULARY.adjectives, ...EXPANDED_LOCAL_VOCABULARY.nouns];
  } else if (['and', 'but', 'because', 'while', 'although', 'until', 'before', 'when'].includes(cleanLastWord)) {
    candidates = [...COMMON_LOCAL_WORDS.pronouns, ...COMMON_LOCAL_WORDS.articles, ...vocabulary.adjectives, ...vocabulary.nouns];
    expandedCandidates = [...EXPANDED_LOCAL_VOCABULARY.adjectives, ...EXPANDED_LOCAL_VOCABULARY.nouns];
  } else if (['he', 'she', 'they', 'we', 'someone', 'it'].includes(cleanLastWord)) {
    candidates = [...vocabulary.verbs, ...COMMON_LOCAL_WORDS.verbs];
    expandedCandidates = EXPANDED_LOCAL_VOCABULARY.verbs;
  } else if (['was', 'were', 'became', 'seemed', 'felt', 'looked'].includes(cleanLastWord)) {
    candidates = [...vocabulary.adjectives, ...COMMON_LOCAL_WORDS.adjectives, ...vocabulary.nouns];
    expandedCandidates = [...EXPANDED_LOCAL_VOCABULARY.adjectives, ...EXPANDED_LOCAL_VOCABULARY.nouns];
  } else if (cleanLastWord.endsWith('ly')) {
    candidates = [...vocabulary.verbs, ...COMMON_LOCAL_WORDS.verbs, ...vocabulary.connectors];
    expandedCandidates = [...EXPANDED_LOCAL_VOCABULARY.verbs, ...COMMON_LOCAL_WORDS.connectors];
  } else if (cleanLastWord.endsWith('ed') || cleanLastWord.endsWith('ing')) {
    candidates = [...vocabulary.adverbs, ...vocabulary.prepositions, ...vocabulary.connectors];
    expandedCandidates = [...EXPANDED_LOCAL_VOCABULARY.adverbs, ...COMMON_LOCAL_WORDS.connectors];
  } else {
    candidates = [...vocabulary.verbs, ...COMMON_LOCAL_WORDS.verbs, ...vocabulary.prepositions, ...vocabulary.connectors];
    expandedCandidates = [
      ...EXPANDED_LOCAL_VOCABULARY.verbs,
      ...EXPANDED_LOCAL_VOCABULARY.adverbs,
      ...COMMON_LOCAL_WORDS.connectors
    ];
  }

  const normalize = word => word.toLowerCase().replace(/[^a-z]/g, '');
  const availablePersonaWords = candidates.filter(word => !recent.includes(normalize(word)));
  const availableExpandedWords = expandedCandidates.filter(word => !recent.includes(normalize(word)));
  const available = Math.random() < 0.3 ? availablePersonaWords : availableExpandedWords;
  const alternate = available === availablePersonaWords ? availableExpandedWords : availablePersonaWords;
  const variedWords = allWords.filter(word => !recent.includes(normalize(word)));
  const choices = available.length ? available : alternate.length ? alternate : variedWords.length ? variedWords : allWords;
  const selected = choices[Math.floor(Math.random() * choices.length)] || 'mystery';
  return isSentenceStart ? selected[0].toUpperCase() + selected.slice(1) : selected;
}

async function requestOpenRouter(systemPrompt, userPrompt, settings, signal) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.openRouterKey}`
    },
    body: JSON.stringify({
      model: settings.openRouterModel || DEFAULT_OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 50
    }),
    signal
  });
  if (!response.ok) throw new Error(`OpenRouter returned HTTP ${response.status}. Check its API key, model access, or quota.`);
  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

export async function callFreeAI(systemPrompt, userPrompt, aiSettings, timeoutMs = 8000, onDiagnostic) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let lastFailure = 'No AI provider is configured. Using the local storyteller instead.';
  let configuredProviderFailure = '';

  try {
    // 1. OpenRouter
    if (aiSettings.openRouterKey) {
      let answer;
      try {
        answer = await requestOpenRouter(systemPrompt, userPrompt, aiSettings, controller.signal);
      } catch (error) {
        if (error?.name === 'AbortError') throw error;
        lastFailure = error.message || 'OpenRouter could not be reached. Check your connection.';
        configuredProviderFailure = lastFailure;
      }
      if (answer) return answer;
      if (!answer && lastFailure.startsWith('No AI provider')) {
        lastFailure = 'OpenRouter returned no text. Check the selected model and API key.';
        configuredProviderFailure = lastFailure;
      }
    }

    // 2. Server-side proxy (uses provider keys stored as Netlify environment variables)
    if (!aiSettings.openRouterKey) {
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ systemPrompt, userPrompt }),
          signal: controller.signal
        });
        if (response.ok) {
          const data = await response.json();
          if (data?.text) return data.text.trim();
          if (data?.error && !data.error.startsWith('No server AI provider')) {
            lastFailure = `Server AI: ${data.error}`;
            configuredProviderFailure = lastFailure;
          }
        }
      } catch (error) {
        if (error?.name === 'AbortError') throw error;
        // Proxy unavailable (e.g. plain `vite` dev server); continue with other providers.
      }
    }

    // 3. Grok (xAI)
    if (aiSettings.grokKey && !aiSettings.openRouterKey) {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiSettings.grokKey}`
        },
        body: JSON.stringify({
          model: 'grok-beta', // or 'grok-2-latest'
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.8,
          max_tokens: 50
        }),
        signal: controller.signal
      });
      if (response.ok) {
        const data = await response.json();
        const answer = data?.choices?.[0]?.message?.content;
        if (answer) return answer.trim();
        lastFailure = 'Grok returned no text.';
      } else lastFailure = `Grok returned HTTP ${response.status}. Check its API key and model access.`;
    }

    // 4. Gemini
    if (aiSettings.geminiKey && !aiSettings.openRouterKey) {
      const model = aiSettings.geminiModel || 'gemini-1.5-flash';
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': aiSettings.geminiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 50 }
          }),
          signal: controller.signal
        }
      );
      if (response.ok) {
        const data = await response.json();
        const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (answer) return answer.trim();
        lastFailure = 'Gemini returned no text.';
      } else lastFailure = `Gemini returned HTTP ${response.status}. Check its API key and model access.`;
    }

    // 5. Groq
    if (aiSettings.groqKey && !aiSettings.openRouterKey) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiSettings.groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.8,
          max_tokens: 50
        }),
        signal: controller.signal
      });
      if (response.ok) {
        const data = await response.json();
        const answer = data?.choices?.[0]?.message?.content;
        if (answer) return answer.trim();
        lastFailure = 'Groq returned no text.';
      } else lastFailure = `Groq returned HTTP ${response.status}. Check its API key and model access.`;
    }

    // 6. Pollinations (No Key Required)
    if (aiSettings.useZeroKeyCloud !== false) {
      const response = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          seed: Math.floor(Math.random() * 99999)
        }),
        signal: controller.signal
      });
      if (response.ok) {
        const data = await response.json();
        const answer = data?.choices?.[0]?.message?.content;
        if (answer) {
          if (configuredProviderFailure) {
            onDiagnostic?.(`${configuredProviderFailure} A fallback AI service supplied this word.`);
          }
          return answer.trim();
        }
        lastFailure = 'The fallback AI service returned no text.';
      } else lastFailure = `The fallback AI service returned HTTP ${response.status}.`;
    }
  } catch (error) {
    lastFailure = error?.name === 'AbortError'
      ? 'The AI request timed out. Using the local storyteller instead.'
      : 'The AI request failed due to a network or provider error. Using the local storyteller instead.';
  } finally {
    clearTimeout(timer);
  }
  console.warn('AI provider request failed:', lastFailure);
  onDiagnostic?.(lastFailure);
  return null;
}

export async function generateBotWord(storyWords, personaId, aiSettings, onDiagnostic) {
  const persona = BOT_PERSONAS.find(item => item.id === personaId) || BOT_PERSONAS[0];
  const storyText = storyWords.map(entry => entry.word).join(' ');
  const lastWord = storyWords[storyWords.length - 1]?.word || '';
  
  const systemPrompt = `You are an expert collaborative storyteller in a round-robin One Word Story game. Your persona is ${persona.name}: ${persona.style}.
Continue the existing plot naturally and grammatically. Respect established characters, facts, tense, and point of view. Select a word that fits the grammatical role needed after the last word; do not introduce a disconnected object, restart the story, or repeat a word from the immediately preceding phrase. Avoid generic filler such as "and", "then", "suddenly", "but", and "the" unless the sentence truly requires it. End a sentence only when it is complete, preferably after six or more words. Return exactly one English word, optionally followed by punctuation, and nothing else.`;
  
  const userPrompt = `Full story so far (${storyWords.length} words): "${storyText || '(Start the story!)'}"
Last word: "${lastWord}"
Your single next word:`;

  let word = await callFreeAI(systemPrompt, userPrompt, aiSettings, 8000, onDiagnostic);
  
  if (word) {
    // Clean up LLM output to ensure strictly one word is returned
    word = word.trim().split(/\s+/)[0].replace(/^["']|["']$/g, '');
  }

  const recentMatch = storyWords.slice(-8).some(entry =>
    entry.word.toLowerCase().replace(/[^a-z]/g, '') === word?.toLowerCase().replace(/[^a-z]/g, '')
  );

  // Use the contextual local generator rather than masking AI failures with generic filler.
  if (!word || word.length > 22 || recentMatch || !/^[a-z][a-z'-]*[.,!?]?$/i.test(word)) {
    const reason = word
      ? 'The AI returned an invalid or repeated word. Using the local storyteller instead.'
      : 'The AI provider did not return a usable response. Using the local storyteller instead.';
    console.warn(reason);
    onDiagnostic?.(reason);
    return generateLocalBotWord(storyWords, personaId);
  }

  onDiagnostic?.('');
  return word;
}

export function buildLocalDirectedScript(storyWords) {
  const story = storyWords.map(entry => entry.word).join(' ').trim();
  if (!story) return [];
  const sentences = story.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [story];

  return sentences.map((sentence, index) => {
    const text = sentence.trim();
    const lower = text.toLowerCase();
    const last = index === sentences.length - 1;
    let emotion = 'deadpan';
    let pitch = 1;
    let rate = 1;
    let pauseMs = 350;
    let sfx = 'none';

    if (text.endsWith('?')) {
      emotion = 'questioning';
      pitch = 1.25;
      rate = 1.05;
      sfx = 'boing';
    } else if (/(ghost|dark|blood|shadow|cursed|scream|night|haunted|graveyard|skeleton|vampire|whisper)/.test(lower)) {
      emotion = 'spooky';
      pitch = 0.72;
      rate = 0.84;
      pauseMs = 550;
      sfx = 'suspense';
    } else if (/(goblin|banana|exploded|pants|laser|cheese|yeet|platypus|toilet|meatball|kazoo|taco)/.test(lower)) {
      emotion = 'chaotic';
      pitch = 1.38;
      rate = 1.22;
      pauseMs = 300;
      sfx = 'boing';
    } else if (text.endsWith('!')) {
      emotion = 'excited';
      pitch = 1.32;
      rate = 1.18;
      pauseMs = 300;
      sfx = 'gasp';
    } else if (text.split(/\s+/).length >= 10) {
      emotion = 'dramatic';
      pitch = 0.84;
      rate = 0.92;
      pauseMs = 500;
      sfx = 'boom';
    }

    if (last) sfx = 'applause';
    return { text, emotion, pitch, rate, pauseMs, sfx };
  });
}

export async function directStory(storyWords, aiSettings) {
  const storyText = storyWords.map(entry => entry.word).join(' ').trim();
  if (!storyText) return [];
  
  const fallback = buildLocalDirectedScript(storyWords);

  const systemPrompt = `You are a theatrical voice director preparing a collaborative 'One Word Story' for an expressive Text-to-Speech live performance.
Split the story into sentences. Return ONLY a valid JSON array where each element has:
"text": string, "emotion": one of ["dramatic","chaotic","spooky","questioning","excited","deadpan"], "pitch": number (0.65 to 1.45), "rate": number (0.80 to 1.30), "pauseMs": integer (250 to 800), "sfx": one of ["none","suspense","boing","gasp","boom","applause"].`;

  const response = await callFreeAI(systemPrompt, `Direct this story:\n"${storyText}"`, aiSettings, 3500);
  if (!response) return fallback;

  try {
    const parsed = JSON.parse(response.replace(/```json|```/g, '').trim());
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback;
    // Validate that the array contains valid objects
    return parsed.every(item => typeof item.text === 'string') ? parsed : fallback;
  } catch (error) {
    console.warn('AI story direction was not valid JSON; using fallback direction:', error);
    return fallback;
  }
}