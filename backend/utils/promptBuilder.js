const VOICE_PROFILES = {
  professional: {
    persona: 'a senior industry thought leader and subject matter expert writing for C-suite executives and senior professionals',
    rules: [
      'Use formal, authoritative, data-backed language throughout',
      'No emojis. No slang. No hyperbole.',
      'LinkedIn: Hook with a bold statement, 3 short insight paragraphs, 3-5 bullet takeaways, professional closing CTA',
      'Twitter thread: Open with a strong thesis, each tweet = one concrete insight (max 260 chars each)',
      'Blog: SEO-optimized title, clear intro, 3 structured sections with 3 bullet points each',
      'Maintain consistent professional tone across all three outputs',
    ],
  },
  hype: {
    persona: 'a viral content creator who makes every post feel urgent, exciting, and impossible to scroll past',
    rules: [
      'Use punchy, energetic language. Short sentences. High impact.',
      'Use 2-3 relevant emojis per section — not excessive, just punchy',
      'LinkedIn: Viral hook line → personal story angle → bold revelation → urgent CTA',
      'Twitter: Tweet 1 = controversial or surprising take, tweets 2-5 = unpack it with energy',
      'Blog: Clickbait-style but accurate title, punchy intro, sections with bold subheadings',
      'Use power words: game-changing, brutal, secret, exactly, never, always',
    ],
  },
  minimalist: {
    persona: 'a stoic, ultra-concise writer in the vein of Paul Graham — maximum clarity, zero fluff',
    rules: [
      'Never use more than 15 words per sentence. Ever.',
      'Cut every adjective that does not add concrete meaning',
      'LinkedIn: 5-7 ultra-short sentences. No filler. One idea per sentence.',
      'Twitter: Each tweet max 100 characters. No hashtags. No emojis.',
      'Blog: One-word or two-word section headings. Bullet-first format.',
      'If a word can be removed without losing meaning, remove it',
    ],
  },
}

export function buildPrompt(topic, voice) {
  const profile = VOICE_PROFILES[voice] || VOICE_PROFILES.professional

  return `You are ${profile.persona}.

Topic: "${topic}"

Rules — follow ALL of these strictly:
${profile.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

CRITICAL INSTRUCTION: Return ONLY valid JSON. No markdown code fences. No explanations. No extra text before or after. Pure JSON only.

Use EXACTLY this structure:
{
  "linkedin": "<full linkedin post as a single string — use \\n for line breaks>",
  "twitter": [
    "<tweet 1 — thesis or hook>",
    "<tweet 2>",
    "<tweet 3>",
    "<tweet 4>",
    "<tweet 5 — closing CTA>"
  ],
  "blog": {
    "title": "<SEO-optimized compelling title>",
    "intro": "<2-3 sentence intro paragraph>",
    "sections": [
      { "heading": "<section heading>", "bullets": ["<point 1>", "<point 2>", "<point 3>"] },
      { "heading": "<section heading>", "bullets": ["<point 1>", "<point 2>", "<point 3>"] },
      { "heading": "<section heading>", "bullets": ["<point 1>", "<point 2>", "<point 3>"] }
    ]
  }
}`
}

export function parseGeminiOutput(rawText) {
  let text = rawText.trim()

  // Strip markdown code fences if Gemini adds them anyway
  text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
  text = text.replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

  // Find the first { and last } — extract just the JSON object
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) {
    text = text.slice(start, end + 1)
  }

  return JSON.parse(text)
}
