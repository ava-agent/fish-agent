import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgentAttribute, ResourceDrop, ResourceType } from '../game/types';

const UPGRADE_COSTS: Record<number, number> = {
  1: 10, 2: 25, 3: 50, 4: 100, 5: 0,
};

const ATTRIBUTE_RESOURCE: Record<AgentAttribute, ResourceType> = {
  perception: 'training_data',
  reasoning: 'model_params',
  generation: 'prompt_fragment',
  compute: 'compute_crystal',
};

const LEVEL_TITLES = ['', 'Hello World', 'Training...', 'Fine-tuning', 'Production Ready', 'AGI Candidate'];

interface AgentStore {
  perception: number;
  reasoning: number;
  generation: number;
  compute: number;
  resources: Record<ResourceType, number>;

  getLevel: () => number;
  getLevelTitle: () => string;
  upgradeAttribute: (attr: AgentAttribute) => boolean;
  addResources: (drops: ResourceDrop[]) => void;
  getUpgradeCost: (attr: AgentAttribute) => number;
  canUpgrade: (attr: AgentAttribute) => boolean;
}

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      perception: 1,
      reasoning: 1,
      generation: 1,
      compute: 1,
      resources: {
        prompt_fragment: 0,
        model_params: 0,
        training_data: 0,
        compute_crystal: 0,
      },

      getLevel: () => {
        const s = get();
        return Math.floor((s.perception + s.reasoning + s.generation + s.compute) / 4);
      },

      getLevelTitle: () => {
        const level = get().getLevel();
        return LEVEL_TITLES[Math.min(level, 5)] || LEVEL_TITLES[5];
      },

      getUpgradeCost: (attr) => {
        const currentLevel = get()[attr];
        return UPGRADE_COSTS[currentLevel] ?? 0;
      },

      canUpgrade: (attr) => {
        const s = get();
        const currentLevel = s[attr];
        if (currentLevel >= 5) return false;
        const cost = UPGRADE_COSTS[currentLevel];
        const resourceType = ATTRIBUTE_RESOURCE[attr];
        return s.resources[resourceType] >= cost;
      },

      upgradeAttribute: (attr) => {
        const s = get();
        if (!s.canUpgrade(attr)) return false;
        const cost = UPGRADE_COSTS[s[attr]];
        const resourceType = ATTRIBUTE_RESOURCE[attr];
        set({
          [attr]: s[attr] + 1,
          resources: { ...s.resources, [resourceType]: s.resources[resourceType] - cost },
        });
        return true;
      },

      addResources: (drops) => {
        set((state) => {
          const newResources = { ...state.resources };
          drops.forEach((drop) => {
            newResources[drop.type] = (newResources[drop.type] || 0) + drop.amount;
          });
          return { resources: newResources };
        });
      },
    }),
    {
      name: 'agent-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
