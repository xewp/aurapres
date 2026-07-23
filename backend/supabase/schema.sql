-- ============================================================
-- StoryForge AI — Supabase Database Schema
-- ============================================================
-- Run this in the Supabase SQL Editor to create all tables.
-- This schema supports the MVP and is future-proofed for
-- Kanban boards, workflows, billing, and team collaboration.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- 1. PROJECTS
-- Core entity. One project = one content production package.
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  topic         TEXT NOT NULL,
  niche         TEXT NOT NULL DEFAULT 'general',
  target_audience TEXT DEFAULT '',
  tone          TEXT NOT NULL DEFAULT 'professional',
  script_format TEXT NOT NULL DEFAULT 'storytelling',
  desired_length TEXT DEFAULT '8-12 minutes',
  status        TEXT NOT NULL DEFAULT 'idea',
    -- Supports future Kanban: idea, research, outline, scripting,
    -- seo, thumbnail, production, review, scheduled, published
  is_favorite   BOOLEAN DEFAULT FALSE,
  is_archived   BOOLEAN DEFAULT FALSE,

  -- Step 2 selections (user picks from ideation results)
  selected_title TEXT DEFAULT NULL,
  selected_hook  TEXT DEFAULT NULL,

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user ON projects(user_id, created_at DESC);
CREATE INDEX idx_projects_status ON projects(user_id, status);
CREATE INDEX idx_projects_niche ON projects(user_id, niche);

-- ──────────────────────────────────────────────
-- 2. PROJECT ASSETS
-- Stores the 10-part output package for each project.
-- Each row is one asset type (research, script, seo, etc.)
-- Content is stored as JSONB for maximum flexibility.
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_assets (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  asset_type    TEXT NOT NULL,
    -- research, strategy, outline, script, shorts,
    -- seo, thumbnail, broll, voiceover, summary
  content       JSONB NOT NULL DEFAULT '{}',
  provider_used TEXT DEFAULT NULL,
  model_used    TEXT DEFAULT NULL,
  tokens_used   INTEGER DEFAULT 0,
  duration_ms   INTEGER DEFAULT 0,
  version       INTEGER DEFAULT 1,
  status        TEXT NOT NULL DEFAULT 'pending',
    -- pending, generating, completed, error
  error_message TEXT DEFAULT NULL,

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_project ON project_assets(project_id);
CREATE UNIQUE INDEX idx_assets_project_type ON project_assets(project_id, asset_type, version);

-- ──────────────────────────────────────────────
-- 3. PROMPTS (Prompt Library)
-- System prompts for each AI agent.
-- user_id = NULL means it's a system default.
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prompts (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    -- NULL = system default prompt
  agent_type    TEXT NOT NULL,
    -- research_agent, strategy_agent, outline_agent,
    -- script_agent, shorts_agent, seo_agent,
    -- thumbnail_agent, broll_agent, voiceover_agent,
    -- summary_agent, title_generator, hook_generator
  name          TEXT NOT NULL DEFAULT 'Default',
  system_prompt TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  is_default    BOOLEAN DEFAULT FALSE,

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prompts_user ON prompts(user_id, agent_type);
CREATE INDEX idx_prompts_system ON prompts(agent_type) WHERE user_id IS NULL;

-- ──────────────────────────────────────────────
-- 4. NICHE PRESETS
-- Curated templates for specific content niches.
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS niche_presets (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,  -- e.g. 'ai-technology'
  name          TEXT NOT NULL,          -- e.g. 'AI & Technology'
  emoji         TEXT DEFAULT '📁',
  description   TEXT DEFAULT '',
  default_tone  TEXT DEFAULT 'professional',
  default_format TEXT DEFAULT 'educational',
  hook_style    TEXT DEFAULT '',
  seo_strategy  TEXT DEFAULT '',
  thumbnail_style TEXT DEFAULT '',
  is_active     BOOLEAN DEFAULT TRUE,
  sort_order    INTEGER DEFAULT 0,

  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 5. USAGE LOGS
-- Track every AI request for analytics and future billing.
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usage_logs (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id    UUID REFERENCES projects(id) ON DELETE SET NULL,
  agent_type    TEXT NOT NULL,
  provider      TEXT NOT NULL,
  model         TEXT DEFAULT NULL,
  tokens_used   INTEGER DEFAULT 0,
  duration_ms   INTEGER DEFAULT 0,
  status_code   INTEGER DEFAULT 200,
  success       BOOLEAN DEFAULT TRUE,
  error         TEXT DEFAULT NULL,

  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_user ON usage_logs(user_id, created_at DESC);
CREATE INDEX idx_usage_provider ON usage_logs(provider, created_at DESC);

-- ──────────────────────────────────────────────
-- 6. TRENDING TOPICS (Future-proofed, empty for now)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trending_topics (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  source        TEXT NOT NULL,  -- google_trends, reddit, youtube
  category      TEXT DEFAULT 'general',
  title         TEXT NOT NULL,
  description   TEXT DEFAULT '',
  score         REAL DEFAULT 0,
  url           TEXT DEFAULT '',
  metadata      JSONB DEFAULT '{}',
  fetched_at    TIMESTAMPTZ DEFAULT NOW(),

  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trending_category ON trending_topics(category, score DESC);

-- ──────────────────────────────────────────────
-- 7. WORKFLOWS (Future-proofed, empty for now)
-- Saved AI agent chains per user.
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflows (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT DEFAULT '',
  steps         JSONB NOT NULL DEFAULT '[]',
    -- Array of { agent_type, provider, config }
  is_active     BOOLEAN DEFAULT TRUE,

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflows_user ON workflows(user_id);

-- ──────────────────────────────────────────────
-- 8. ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- Projects: users can only CRUD their own
CREATE POLICY "Users manage their own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Assets: inherit from project ownership
CREATE POLICY "Users manage their own project assets"
  ON project_assets FOR ALL
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  )
  WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Prompts: users see system defaults + their own
CREATE POLICY "Users see system and own prompts"
  ON prompts FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users manage their own prompts"
  ON prompts FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Usage logs: users see their own
CREATE POLICY "Users see their own usage"
  ON usage_logs FOR SELECT
  USING (user_id = auth.uid());

-- Workflows: users manage their own
CREATE POLICY "Users manage their own workflows"
  ON workflows FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Niche presets: public read
ALTER TABLE niche_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read niche presets"
  ON niche_presets FOR SELECT
  USING (true);

-- Trending topics: public read
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read trending topics"
  ON trending_topics FOR SELECT
  USING (true);

-- ──────────────────────────────────────────────
-- 9. SEED: NICHE PRESETS
-- ──────────────────────────────────────────────
INSERT INTO niche_presets (slug, name, emoji, description, default_tone, default_format, hook_style, seo_strategy, thumbnail_style, sort_order) VALUES
  ('ai-technology', 'AI & Technology', '🤖', 'Artificial intelligence, machine learning, software, and emerging tech.', 'professional', 'educational', 'Start with a shocking stat or prediction about AI/tech', 'Focus on long-tail keywords with high search volume in tech', 'Bold text overlay, futuristic color palette (blue, purple, neon)', 1),
  ('business-finance', 'Business & Finance', '💰', 'Entrepreneurship, investing, personal finance, and business strategy.', 'professional', 'case_study', 'Open with a dollar figure or financial revelation', 'Target "how to" and "best" keywords in finance', 'Green/gold tones, money imagery, clean professional look', 2),
  ('history-documentary', 'History & Documentaries', '📜', 'Historical events, untold stories, ancient civilizations, and documentaries.', 'professional', 'storytelling', 'Begin with a mysterious or unknown historical fact', 'Leverage curiosity-gap titles and long-tail historical queries', 'Dramatic vintage textures, sepia tones, mysterious atmosphere', 3),
  ('psychology-self-improvement', 'Psychology & Self-Improvement', '🧠', 'Human behavior, mental health, productivity, habits, and personal growth.', 'professional', 'educational', 'Lead with a counterintuitive psychological finding', 'Target "why do" and "how to" psychology queries', 'Mind/brain imagery, clean minimalist design, warm colors', 4),
  ('entrepreneurship', 'Entrepreneurship', '💼', 'Startups, side hustles, solopreneurship, and building businesses.', 'hype', 'case_study', 'Open with a founder story or revenue number', 'Target startup and hustle culture keywords', 'Bold, high-contrast, energetic design with success imagery', 5)
ON CONFLICT (slug) DO NOTHING;

-- ──────────────────────────────────────────────
-- 10. AUTO-UPDATE TIMESTAMPS
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_timestamp
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_assets_timestamp
  BEFORE UPDATE ON project_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_prompts_timestamp
  BEFORE UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workflows_timestamp
  BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
