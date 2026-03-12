import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EquipmentSlot } from '../game/types';
import { GEAR_CATALOG } from '../data/gear-catalog';
import { AI_EQUIPMENT } from '../data/aiEquipment';

const ALL_GEAR = [...GEAR_CATALOG, ...AI_EQUIPMENT];

interface EquipmentStore {
  equipped: Record<EquipmentSlot, string | null>;
  inventory: string[];
  fragments: Record<string, number>;

  equip: (slot: EquipmentSlot, itemId: string) => void;
  unequip: (slot: EquipmentSlot) => void;
  addFragment: (fragmentId: string) => void;
  craftEquipment: (fragmentId: string) => boolean;
  hasItem: (itemId: string) => boolean;
  getFragmentCount: (fragmentId: string) => number;
  getEquippedItem: (slot: EquipmentSlot) => typeof ALL_GEAR[number] | undefined;
}

export const useEquipmentStore = create<EquipmentStore>()(
  persist(
    (set, get) => ({
      equipped: { rod: null, line: null, hook: null },
      inventory: [],
      fragments: {},

      equip: (slot, itemId) => {
        if (!get().inventory.includes(itemId)) return;
        set((state) => ({
          equipped: { ...state.equipped, [slot]: itemId },
        }));
      },

      unequip: (slot) => {
        set((state) => ({
          equipped: { ...state.equipped, [slot]: null },
        }));
      },

      addFragment: (fragmentId) => {
        set((state) => ({
          fragments: {
            ...state.fragments,
            [fragmentId]: (state.fragments[fragmentId] || 0) + 1,
          },
        }));
      },

      craftEquipment: (fragmentId) => {
        const count = get().fragments[fragmentId] || 0;
        if (count < 3) return false;
        set((state) => ({
          fragments: { ...state.fragments, [fragmentId]: count - 3 },
          inventory: [...state.inventory, fragmentId],
        }));
        return true;
      },

      hasItem: (itemId) => get().inventory.includes(itemId),

      getFragmentCount: (fragmentId) => get().fragments[fragmentId] || 0,

      getEquippedItem: (slot) => {
        const itemId = get().equipped[slot];
        if (!itemId) return undefined;
        return ALL_GEAR.find((g) => g.id === itemId);
      },
    }),
    {
      name: 'equipment-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
