-- Fish Agent Database Schema

-- Fishing records table
CREATE TABLE IF NOT EXISTS fishing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location TEXT NOT NULL,
  weather TEXT NOT NULL CHECK (weather IN ('sunny', 'cloudy', 'rainy', 'windy')),
  duration INTEGER NOT NULL DEFAULT 60,
  catches JSONB NOT NULL DEFAULT '[]',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fish dex (collection) table
CREATE TABLE IF NOT EXISTS fish_dex (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  fish_id TEXT NOT NULL,
  caught_count INTEGER NOT NULL DEFAULT 1,
  best_weight NUMERIC(10, 2) NOT NULL DEFAULT 0,
  first_caught_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, fish_id)
);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  username TEXT NOT NULL DEFAULT 'Angler',
  fish_id TEXT NOT NULL,
  weight NUMERIC(10, 2) NOT NULL,
  caught_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fishing_records_user ON fishing_records(user_id);
CREATE INDEX IF NOT EXISTS idx_fishing_records_date ON fishing_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_fish_dex_user ON fish_dex(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_fish ON leaderboard(fish_id, weight DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_weight ON leaderboard(weight DESC);

-- Enable Row Level Security
ALTER TABLE fishing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fish_dex ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for now (public access)
-- In production, replace with proper auth-based policies
CREATE POLICY "Allow all on fishing_records" ON fishing_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on fish_dex" ON fish_dex FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on leaderboard" ON leaderboard FOR ALL USING (true) WITH CHECK (true);
