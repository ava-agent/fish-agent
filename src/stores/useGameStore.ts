import { create } from 'zustand';
import { GamePhase, FishSpecies } from '../game/types';

interface GameStore {
  phase: GamePhase;
  castPower: number;
  castDistance: number;
  bobberX: number;
  bobberY: number;
  selectedBait: string;
  currentFish: FishSpecies | null;
  lineTension: number;
  reelSpeed: number;
  fishStamina: number;
  fishX: number;
  fishY: number;
  score: number;
  totalCatches: number;

  setPhase: (phase: GamePhase) => void;
  setCastPower: (power: number) => void;
  cast: (power: number) => void;
  selectBait: (baitId: string) => void;
  setCurrentFish: (fish: FishSpecies | null) => void;
  updateTension: (tension: number) => void;
  updateReelSpeed: (speed: number) => void;
  updateFishStamina: (stamina: number) => void;
  updateFishPosition: (x: number, y: number) => void;
  catchFish: () => void;
  fishEscaped: () => void;
  reset: () => void;
}

const initialState = {
  phase: 'idle' as GamePhase,
  castPower: 0,
  castDistance: 0,
  bobberX: 0,
  bobberY: 0,
  selectedBait: 'earthworm',
  currentFish: null as FishSpecies | null,
  lineTension: 0.5,
  reelSpeed: 0,
  fishStamina: 1,
  fishX: 0,
  fishY: 0,
  score: 0,
  totalCatches: 0,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setCastPower: (power) => set({ castPower: Math.max(0, Math.min(1, power)) }),

  cast: (power) =>
    set({
      phase: 'waiting',
      castPower: power,
      castDistance: power * 100,
      bobberX: 50 + power * 40,
      bobberY: 60,
    }),

  selectBait: (baitId) => set({ selectedBait: baitId }),

  setCurrentFish: (fish) =>
    set({
      currentFish: fish,
      fishStamina: 1,
      lineTension: 0.5,
    }),

  updateTension: (tension) =>
    set({ lineTension: Math.max(0, Math.min(1, tension)) }),

  updateReelSpeed: (speed) => set({ reelSpeed: speed }),

  updateFishStamina: (stamina) =>
    set({ fishStamina: Math.max(0, Math.min(1, stamina)) }),

  updateFishPosition: (x, y) => set({ fishX: x, fishY: y }),

  catchFish: () =>
    set((state) => ({
      phase: 'caught',
      score: state.score + (state.currentFish ? Math.round(state.currentFish.difficulty * 100) : 50),
      totalCatches: state.totalCatches + 1,
    })),

  fishEscaped: () => set({ phase: 'escaped', currentFish: null }),

  reset: () => set({ ...initialState }),
}));
