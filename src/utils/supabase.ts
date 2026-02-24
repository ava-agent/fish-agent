import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project URL and anon key
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database types
export interface DbFishingRecord {
  id: string;
  user_id: string;
  date: string;
  location: string;
  weather: string;
  duration: number;
  catches: any[];
  notes: string;
  created_at: string;
}

export interface DbFishDexEntry {
  id: string;
  user_id: string;
  fish_id: string;
  caught_count: number;
  best_weight: number;
  first_caught_date: string;
}

export interface DbLeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  fish_id: string;
  weight: number;
  caught_at: string;
}
