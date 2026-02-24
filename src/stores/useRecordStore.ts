import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FishingRecord, CatchEntry } from '../game/types';

interface RecordStore {
  records: FishingRecord[];
  addRecord: (record: Omit<FishingRecord, 'id' | 'createdAt'>) => void;
  updateRecord: (id: string, updates: Partial<FishingRecord>) => void;
  deleteRecord: (id: string) => void;
  getRecord: (id: string) => FishingRecord | undefined;
  addCatchToRecord: (recordId: string, catchEntry: CatchEntry) => void;
  getTotalCatches: () => number;
  getBiggestCatch: () => { fishName: string; weight: number } | null;
}

export const useRecordStore = create<RecordStore>()(
  persist(
    (set, get) => ({
      records: [],

      addRecord: (record) =>
        set((state) => ({
          records: [
            {
              ...record,
              id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
              createdAt: Date.now(),
            },
            ...state.records,
          ],
        })),

      updateRecord: (id, updates) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),

      getRecord: (id) => get().records.find((r) => r.id === id),

      addCatchToRecord: (recordId, catchEntry) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === recordId
              ? { ...r, catches: [...r.catches, catchEntry] }
              : r
          ),
        })),

      getTotalCatches: () =>
        get().records.reduce((sum, r) => sum + r.catches.length, 0),

      getBiggestCatch: () => {
        let biggest: { fishName: string; weight: number } | null = null;
        for (const record of get().records) {
          for (const c of record.catches) {
            if (!biggest || c.weight > biggest.weight) {
              biggest = { fishName: c.fishName, weight: c.weight };
            }
          }
        }
        return biggest;
      },
    }),
    {
      name: 'fishing-records-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
