import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FishDexEntry } from '../game/types';

interface FishDexStore {
  entries: Record<string, FishDexEntry>;
  discoverFish: (fishId: string, weight: number) => void;
  isDiscovered: (fishId: string) => boolean;
  getEntry: (fishId: string) => FishDexEntry | undefined;
  getTotalDiscovered: () => number;
}

export const useFishDexStore = create<FishDexStore>()(
  persist(
    (set, get) => ({
      entries: {},

      discoverFish: (fishId, weight) =>
        set((state) => {
          const existing = state.entries[fishId];
          const now = new Date().toISOString();
          return {
            entries: {
              ...state.entries,
              [fishId]: {
                fishId,
                discovered: true,
                caughtCount: (existing?.caughtCount ?? 0) + 1,
                bestWeight: Math.max(existing?.bestWeight ?? 0, weight),
                firstCaughtDate: existing?.firstCaughtDate ?? now,
              },
            },
          };
        }),

      isDiscovered: (fishId) => !!get().entries[fishId]?.discovered,

      getEntry: (fishId) => get().entries[fishId],

      getTotalDiscovered: () =>
        Object.values(get().entries).filter((e) => e.discovered).length,
    }),
    {
      name: 'fish-dex-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
