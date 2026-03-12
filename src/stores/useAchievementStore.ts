import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EntityType, FishRarity } from '../game/types';
import { ACHIEVEMENTS } from '../data/achievements';
import { useAgentStore } from './useAgentStore';
import { useEquipmentStore } from './useEquipmentStore';
import { useFishDexStore } from './useFishDexStore';

interface AchievementProgress {
  current: number;
  unlocked: boolean;
  unlockedAt?: string;
}

interface AchievementStore {
  progress: Record<string, AchievementProgress>;
  unlockedBaits: string[];
  comboCount: number;
  titles: string[];

  recordCatch: (speciesId: string, entityType: EntityType | undefined, rarity: FishRarity) => void;
  recordCombo: (caught: boolean) => void;
  getProgress: (achievementId: string) => AchievementProgress;
  isUnlocked: (achievementId: string) => boolean;
  isBaitUnlocked: (baitId: string) => boolean;
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      progress: {},
      unlockedBaits: [],
      comboCount: 0,
      titles: [],

      recordCatch: (speciesId, entityType, rarity) => {
        const state = get();
        const newProgress = { ...state.progress };
        const newlyUnlockedBaits = [...state.unlockedBaits];
        const newTitles = [...state.titles];

        ACHIEVEMENTS.forEach((achievement) => {
          if (newProgress[achievement.id]?.unlocked) return;

          const prev = newProgress[achievement.id] || { current: 0, unlocked: false };
          let shouldIncrement = false;

          switch (achievement.condition.type) {
            case 'catch_count':
              if (achievement.condition.filter?.entityType && entityType === achievement.condition.filter.entityType) {
                shouldIncrement = true;
              }
              break;
            case 'catch_specific':
              if (achievement.condition.filter?.speciesId === speciesId) {
                shouldIncrement = true;
              }
              break;
            case 'collection': {
              const dex = useFishDexStore.getState();
              const totalDiscovered = dex.getTotalDiscovered();
              newProgress[achievement.id] = {
                ...prev,
                current: totalDiscovered,
                unlocked: totalDiscovered >= achievement.condition.target * 2,
                unlockedAt: totalDiscovered >= achievement.condition.target * 2 ? new Date().toISOString() : undefined,
              };
              return;
            }
          }

          if (shouldIncrement) {
            const newCurrent = prev.current + 1;
            const unlocked = newCurrent >= achievement.condition.target;
            newProgress[achievement.id] = {
              current: newCurrent,
              unlocked,
              unlockedAt: unlocked ? new Date().toISOString() : undefined,
            };

            if (unlocked) {
              // Apply reward
              switch (achievement.reward.type) {
                case 'unlock_bait':
                  if (achievement.reward.baitId && !newlyUnlockedBaits.includes(achievement.reward.baitId)) {
                    newlyUnlockedBaits.push(achievement.reward.baitId);
                  }
                  break;
                case 'resources':
                  if (achievement.reward.resources) {
                    useAgentStore.getState().addResources(achievement.reward.resources);
                  }
                  break;
                case 'agent_levels':
                  if (achievement.reward.levels) {
                    const agentStore = useAgentStore.getState();
                    for (let i = 0; i < achievement.reward.levels; i++) {
                      agentStore.upgradeAttribute('perception');
                      agentStore.upgradeAttribute('reasoning');
                      agentStore.upgradeAttribute('generation');
                      agentStore.upgradeAttribute('compute');
                    }
                  }
                  break;
                case 'title':
                  if (achievement.reward.title && !newTitles.includes(achievement.reward.title)) {
                    newTitles.push(achievement.reward.title);
                  }
                  break;
                case 'equipment_fragment':
                  if (achievement.reward.fragmentId) {
                    useEquipmentStore.getState().addFragment(achievement.reward.fragmentId);
                  }
                  break;
              }
            }
          }
        });

        set({ progress: newProgress, unlockedBaits: newlyUnlockedBaits, titles: newTitles });
      },

      recordCombo: (caught) => {
        set((state) => {
          const newCombo = caught ? state.comboCount + 1 : 0;
          const newProgress = { ...state.progress };

          const comboAchievement = ACHIEVEMENTS.find((a) => a.condition.type === 'combo');
          if (comboAchievement && !newProgress[comboAchievement.id]?.unlocked) {
            newProgress[comboAchievement.id] = {
              current: newCombo,
              unlocked: newCombo >= comboAchievement.condition.target,
              unlockedAt: newCombo >= comboAchievement.condition.target ? new Date().toISOString() : undefined,
            };

            if (newCombo >= comboAchievement.condition.target && comboAchievement.reward.fragmentId) {
              useEquipmentStore.getState().addFragment(comboAchievement.reward.fragmentId);
            }
          }

          return { comboCount: newCombo, progress: newProgress };
        });
      },

      getProgress: (achievementId) => {
        return get().progress[achievementId] || { current: 0, unlocked: false };
      },

      isUnlocked: (achievementId) => {
        return get().progress[achievementId]?.unlocked || false;
      },

      isBaitUnlocked: (baitId) => {
        // Default baits are always unlocked
        const lockedBaits = ['data_fragment', 'compute_chip'];
        if (!lockedBaits.includes(baitId)) return true;
        return get().unlockedBaits.includes(baitId);
      },
    }),
    {
      name: 'achievement-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
