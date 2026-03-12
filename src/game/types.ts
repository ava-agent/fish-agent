export type GamePhase = 'idle' | 'casting' | 'waiting' | 'bite' | 'fighting' | 'caught' | 'escaped' | 'no_bite';

export type FishRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type FishCategory = 'freshwater' | 'saltwater' | 'pond';
export type EntityType = 'fish' | 'ai_creature';
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'windy';
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface FishSpecies {
  id: string;
  name: string;
  nameCn: string;
  category: FishCategory;
  difficulty: Difficulty;
  minWeight: number; // kg
  maxWeight: number;
  preferredBait: string[];
  preferredTechnique: string;
  habitat: string;
  description: string;
  fightStrength: number; // 0-1
  swimSpeed: number;
  pixelArt: number[][];
  pixelColors: string[];
  rarity: FishRarity;
  tip: string; // real-world fishing tip
  entityType?: EntityType;
  quoteOnCatch?: string;
  drops?: ResourceDrop[];
}

export interface BaitType {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  effectiveness: Record<string, number>; // fishId -> 0-1
  pixelArt: number[][];
  pixelColors: string[];
}

export interface GearItem {
  id: string;
  name: string;
  nameCn: string;
  type: 'rod' | 'reel' | 'line' | 'hook';
  description: string;
  stats: Record<string, number>;
}

export interface Technique {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  steps: string[];
  suitableFish: string[];
  difficulty: Difficulty;
}

export interface GameState {
  phase: GamePhase;
  castPower: number;
  castDistance: number;
  bobberX: number;
  bobberY: number;
  selectedBait: string;
  currentFish: FishSpecies | null;
  lineTension: number; // 0-1
  reelSpeed: number;
  fishStamina: number; // 0-1
  fishX: number;
  fishY: number;
  score: number;
  biteTimer: number;
  hookWindow: number;
}

export interface FishingRecord {
  id: string;
  date: string;
  location: string;
  weather: Weather;
  duration: number; // minutes
  catches: CatchEntry[];
  notes: string;
  createdAt: number;
}

export interface CatchEntry {
  fishId: string;
  fishName: string;
  weight: number;
  technique: string;
  bait: string;
  time: string;
}

export interface FishDexEntry {
  fishId: string;
  discovered: boolean;
  caughtCount: number;
  bestWeight: number;
  firstCaughtDate: string;
}

export interface CommunityItem {
  id: string;
  name: string;
  type: 'forum' | 'app' | 'wechat' | 'website';
  description: string;
  url?: string;
  features: string[];
}

export interface FishingSpot {
  id: string;
  name: string;
  location: string;
  fishTypes: string[];
  difficulty: Difficulty;
  description: string;
  tips: string[];
}

export type ResourceType = 'prompt_fragment' | 'model_params' | 'training_data' | 'compute_crystal';

export interface ResourceDrop {
  type: ResourceType;
  amount: number;
}

export type AgentAttribute = 'perception' | 'reasoning' | 'generation' | 'compute';

export type EquipmentSlot = 'rod' | 'line' | 'hook';

export interface Achievement {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  condition: AchievementCondition;
  reward: AchievementReward;
}

export interface AchievementCondition {
  type: 'catch_count' | 'catch_species' | 'catch_specific' | 'combo' | 'collection';
  target: number;
  filter?: {
    entityType?: EntityType;
    speciesId?: string;
    rarity?: FishRarity;
  };
}

export interface AchievementReward {
  type: 'unlock_bait' | 'resources' | 'agent_levels' | 'title' | 'equipment_fragment';
  baitId?: string;
  resources?: ResourceDrop[];
  levels?: number;
  title?: string;
  fragmentId?: string;
}
