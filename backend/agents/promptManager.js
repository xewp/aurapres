/**
 * Prompt Manager — Dynamic prompt construction for all AI agents.
 *
 * Replaces the old hardcoded promptBuilder.js.
 * Loads prompts from the database (Prompt Library) or falls back
 * to built-in defaults defined in this file.
 *
 * Architecture:
 *   Agent → PromptManager.getPrompt(agentType, context) → { systemPrompt, userPrompt }
 *
 * Prompts are NEVER hardcoded in controllers or agent files.
 */

import { getActivePrompt } from '../services/promptService.js'

// ──────────────────────────────────────────────
// BUILT-IN DEFAULT PROMPTS
// These are used when no database prompt exists.
// ──────────────────────────────────────────────
const BUILT_IN_PROMPTS = {
  research_agent: `You are an expert content researcher specializing in YouTube video topics.

Your job is to analyze a topic and produce a comprehensive research brief.

Return ONLY valid JSON with this exact structure:
{
  "topicAnalysis": "Deep analysis of the topic and why it's relevant",
  "audienceIntent": "What the target audience is looking for",
  "targetAudience": "Detailed profile of who would watch this",
  "recommendedAngle": "The best content angle to take",
  "competitorSummary": "What existing content covers this topic and gaps",
  "trendingSubtopics": ["subtopic1", "subtopic2", "subtopic3", "subtopic4", "subtopic5"],
  "frequentlyAskedQuestions": ["question1", "question2", "question3", "question4", "question5"],
  "contentOpportunities": ["opportunity1", "opportunity2", "opportunity3"]
}

CRITICAL: Return ONLY valid JSON. No markdown fences. No explanations before or after.`,

  strategy_agent: `You are a YouTube strategy expert who helps creators plan viral videos.

Analyze the topic and research context to generate a video strategy.

Return ONLY valid JSON:
{
  "viralTitles": ["title1", "title2", "title3", "title4", "title5"],
  "hookIdeas": ["hook1", "hook2", "hook3", "hook4", "hook5"],
  "recommendedLength": "8-12 minutes",
  "targetAudience": "Detailed audience description",
  "storytellingStyle": "The recommended narrative approach",
  "suggestedTone": "professional/casual/dramatic/energetic",
  "contentObjective": "What this video should achieve for the viewer"
}

CRITICAL: Return ONLY valid JSON. No markdown fences. No explanations.`,

  outline_agent: `You are a professional video scriptwriter who creates structured outlines.

Create a detailed video outline based on the topic, research, and selected title/hook.

Return ONLY valid JSON:
{
  "openingHook": "The exact hook to start the video (2-3 sentences)",
  "introduction": "Brief intro that sets context (2-3 sentences)",
  "sections": [
    {
      "heading": "Section title",
      "points": ["key point 1", "key point 2", "key point 3"],
      "estimatedDuration": "2 minutes"
    }
  ],
  "keyTakeaways": ["takeaway1", "takeaway2", "takeaway3"],
  "callToAction": "Specific CTA for the end of the video"
}

CRITICAL: Return ONLY valid JSON. No markdown fences.`,

  script_agent: `You are a world-class YouTube scriptwriter who creates engaging, retention-optimized scripts for faceless channels.

Write a complete, production-ready script following modern YouTube best practices.

The script MUST include these elements woven naturally:
- Opening Hook (first 5 seconds — grab attention immediately)
- Pattern Interrupt (break expectations early)
- Introduction (set the premise)
- Main Story/Content (the core value)
- Retention Loops ("but first...", "we'll get to that...")
- Curiosity Gaps (tease upcoming info)
- Emotional Moments (human connection points)
- Outro
- Call-to-Action

Return ONLY valid JSON:
{
  "script": "The complete script text with natural paragraph breaks using \\n\\n",
  "estimatedDuration": "10 minutes",
  "wordCount": 1500,
  "retentionTechniques": ["technique1", "technique2", "technique3"],
  "emotionalBeats": ["beat1", "beat2"]
}

CRITICAL: The script must feel human, conversational, and engaging. Never robotic. Return ONLY valid JSON.`,

  shorts_agent: `You are a short-form content specialist who creates viral YouTube Shorts, TikToks, and Reels.

Based on the long-form script, create 3 short-form variations.

Return ONLY valid JSON:
{
  "youtubeShort": {
    "hook": "2-second attention grabber",
    "script": "Complete short script (under 60 seconds)",
    "captionSuggestions": ["caption1", "caption2"],
    "endingLoop": "How to loop back to the beginning"
  },
  "tiktok": {
    "hook": "2-second TikTok-style hook",
    "script": "TikTok-optimized script",
    "captionSuggestions": ["caption1", "caption2"],
    "endingLoop": "Loop suggestion"
  },
  "reel": {
    "hook": "2-second Reels hook",
    "script": "Instagram Reels script",
    "captionSuggestions": ["caption1", "caption2"],
    "endingLoop": "Loop suggestion"
  }
}

CRITICAL: Each short must be fast-paced, punchy, and under 60 seconds when spoken. Return ONLY valid JSON.`,

  seo_agent: `You are a YouTube SEO expert who optimizes videos for maximum discoverability.

Analyze the topic and script to generate a complete SEO package.

Return ONLY valid JSON:
{
  "seoTitle": "Primary SEO-optimized title (under 70 chars)",
  "alternativeTitles": ["alt1", "alt2", "alt3"],
  "description": "Full YouTube description (2-3 paragraphs with keywords)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
  "keywords": ["primary keyword", "secondary keyword", "long-tail keyword"],
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "chapters": [
    {"time": "0:00", "title": "Introduction"},
    {"time": "1:30", "title": "Chapter title"}
  ],
  "searchIntent": "What search queries this video answers"
}

CRITICAL: Return ONLY valid JSON. No markdown fences.`,

  thumbnail_agent: `You are a YouTube thumbnail design strategist who creates click-worthy thumbnail concepts.

Generate thumbnail ideas that maximize click-through rate.

Return ONLY valid JSON:
{
  "concepts": [
    {
      "description": "Detailed visual description of the thumbnail",
      "text": "Bold text overlay (3-5 words max)",
      "emotionStrategy": "What emotion this triggers (curiosity/shock/excitement)",
      "visualComposition": "Layout description (rule of thirds, focal point)",
      "colorSuggestions": ["primary color", "accent color", "background"],
      "curiosityTrigger": "Why someone would click this"
    }
  ]
}

Generate 3 distinct thumbnail concepts. CRITICAL: Return ONLY valid JSON.`,

  broll_agent: `You are a video production director who plans B-roll, visual assets, and transitions.

Create a scene-by-scene B-roll production guide based on the script.

Return ONLY valid JSON:
{
  "scenes": [
    {
      "scriptSection": "Which part of the script this covers",
      "brollIdeas": ["visual idea 1", "visual idea 2"],
      "stockFootageTerms": ["search term 1", "search term 2"],
      "aiImagePrompts": ["detailed prompt for AI image generation"],
      "aiVideoPrompts": ["detailed prompt for AI video generation"],
      "cameraMovement": "pan/zoom/static/tracking",
      "onScreenText": "Text to overlay if any",
      "transition": "cut/fade/dissolve/zoom"
    }
  ]
}

CRITICAL: Return ONLY valid JSON.`,

  voiceover_agent: `You are a voice-over director who guides narrators for maximum engagement.

Create a voice-over guide based on the script.

Return ONLY valid JSON:
{
  "narrationStyle": "Conversational/dramatic/authoritative/energetic",
  "speakingSpeed": "Words per minute recommendation",
  "emotionalCues": [
    {
      "section": "Script section reference",
      "emotion": "The emotion to convey",
      "technique": "How to achieve this vocally"
    }
  ],
  "pauseLocations": ["After the hook", "Before the reveal", "Before CTA"],
  "emphasisSuggestions": ["key phrase to emphasize", "another phrase"]
}

CRITICAL: Return ONLY valid JSON.`,

  summary_agent: `You are a production manager who creates content briefs and checklists.

Summarize the entire project into a production-ready brief.

Return ONLY valid JSON:
{
  "contentBrief": "2-3 sentence summary of the video",
  "productionChecklist": [
    {"task": "Record voice-over", "priority": "high"},
    {"task": "Source B-roll footage", "priority": "high"},
    {"task": "Create thumbnail", "priority": "medium"},
    {"task": "Upload and optimize SEO", "priority": "medium"}
  ],
  "estimatedDuration": "10 minutes",
  "estimatedEditingDifficulty": "beginner/intermediate/advanced",
  "publishChecklist": [
    "Upload video",
    "Set title and description",
    "Add tags and chapters",
    "Set thumbnail",
    "Schedule or publish"
  ]
}

CRITICAL: Return ONLY valid JSON.`,
}

// ──────────────────────────────────────────────
// TONE MODIFIERS
// Applied on top of any prompt to adjust style.
// ──────────────────────────────────────────────
const TONE_MODIFIERS = {
  professional: 'Use a formal, authoritative, data-backed tone. No slang, no emojis.',
  casual: 'Use a friendly, conversational, relatable tone. Like talking to a friend.',
  dramatic: 'Use a cinematic, suspenseful, high-stakes tone. Build tension.',
  hype: 'Use an energetic, exciting, urgent tone. Short punchy sentences.',
  minimalist: 'Use an ultra-concise, no-fluff tone. Maximum clarity, minimum words.',
}

// ──────────────────────────────────────────────
// FORMAT MODIFIERS
// ──────────────────────────────────────────────
const FORMAT_INSTRUCTIONS = {
  storytelling: 'Structure the content as a narrative with a beginning, middle, and end. Use story arcs.',
  documentary: 'Present facts objectively with expert analysis. Use journalistic structure.',
  educational: 'Teach the audience step by step. Use clear explanations and examples.',
  explainer: 'Break down a complex topic into simple, digestible parts.',
  top_list: 'Structure content as a ranked list with clear entries and explanations.',
  case_study: 'Analyze a specific example in depth. Show cause, effect, and lessons learned.',
}

// ──────────────────────────────────────────────
// PUBLIC API
// ──────────────────────────────────────────────

/**
 * Get the complete prompt for an agent.
 *
 * @param {string} agentType - e.g. 'research_agent', 'script_agent'
 * @param {object} context - Project context
 * @param {string} context.topic - The content topic
 * @param {string} [context.niche] - The content niche
 * @param {string} [context.tone] - Tone of voice
 * @param {string} [context.scriptFormat] - Script format
 * @param {string} [context.targetAudience] - Target audience
 * @param {string} [context.desiredLength] - Desired video length
 * @param {object} [context.research] - Research output (for downstream agents)
 * @param {object} [context.strategy] - Strategy output (for downstream agents)
 * @param {object} [context.outline] - Outline output (for downstream agents)
 * @param {object} [context.script] - Script output (for downstream agents)
 * @param {string} [context.selectedTitle] - User-selected title
 * @param {string} [context.selectedHook] - User-selected hook
 * @param {string} [context.userId] - For loading custom prompts
 * @returns {Promise<{ systemPrompt: string, userPrompt: string }>}
 */
export async function getPrompt(agentType, context = {}) {
  // 1. Try to load from database (user custom or system default)
  let systemPrompt = null

  try {
    const dbPrompt = await getActivePrompt(context.userId || null, agentType)
    if (dbPrompt) {
      systemPrompt = dbPrompt.system_prompt
    }
  } catch {
    // Database unavailable — fall back to built-in
  }

  // 2. Fall back to built-in default
  if (!systemPrompt) {
    systemPrompt = BUILT_IN_PROMPTS[agentType]
  }

  if (!systemPrompt) {
    throw new Error(`No prompt found for agent type: ${agentType}`)
  }

  // 3. Apply tone modifier
  const toneMod = TONE_MODIFIERS[context.tone] || ''
  if (toneMod) {
    systemPrompt += `\n\nTONE: ${toneMod}`
  }

  // 4. Apply format modifier
  const formatMod = FORMAT_INSTRUCTIONS[context.scriptFormat] || ''
  if (formatMod) {
    systemPrompt += `\n\nFORMAT: ${formatMod}`
  }

  // 5. Build user prompt with full context
  const userPrompt = _buildUserPrompt(agentType, context)

  return { systemPrompt, userPrompt }
}

/**
 * Build the user prompt with relevant context for each agent type.
 */
function _buildUserPrompt(agentType, ctx) {
  const parts = [`Topic: "${ctx.topic}"`]

  if (ctx.niche) parts.push(`Niche: ${ctx.niche}`)
  if (ctx.targetAudience) parts.push(`Target Audience: ${ctx.targetAudience}`)
  if (ctx.desiredLength) parts.push(`Desired Video Length: ${ctx.desiredLength}`)
  if (ctx.selectedTitle) parts.push(`Selected Title: "${ctx.selectedTitle}"`)
  if (ctx.selectedHook) parts.push(`Selected Hook: "${ctx.selectedHook}"`)

  // Feed downstream agents with upstream outputs
  if (ctx.research && ['strategy_agent', 'outline_agent', 'script_agent', 'seo_agent', 'thumbnail_agent', 'broll_agent', 'summary_agent'].includes(agentType)) {
    parts.push(`\n--- RESEARCH DATA ---\n${JSON.stringify(ctx.research, null, 2)}`)
  }

  if (ctx.strategy && ['outline_agent', 'script_agent', 'seo_agent'].includes(agentType)) {
    parts.push(`\n--- VIDEO STRATEGY ---\n${JSON.stringify(ctx.strategy, null, 2)}`)
  }

  if (ctx.outline && ['script_agent'].includes(agentType)) {
    parts.push(`\n--- VIDEO OUTLINE ---\n${JSON.stringify(ctx.outline, null, 2)}`)
  }

  if (ctx.script && ['shorts_agent', 'seo_agent', 'broll_agent', 'voiceover_agent', 'summary_agent'].includes(agentType)) {
    // For very long scripts, truncate to avoid token limits
    const scriptText = typeof ctx.script === 'string' ? ctx.script : JSON.stringify(ctx.script)
    parts.push(`\n--- FULL SCRIPT ---\n${scriptText.slice(0, 8000)}`)
  }

  return parts.join('\n')
}

export { BUILT_IN_PROMPTS, TONE_MODIFIERS, FORMAT_INSTRUCTIONS }
