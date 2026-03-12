# AI Invasion Game Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the pixel-art fishing simulator into a game where players fish up AI creatures, collect resources, build an AI assistant, and unlock achievements.

**Architecture:** Extend existing FishSpecies type with an `entityType` discriminator. AI creatures share the same spawn pool and fishing mechanics as real fish. Three new Zustand stores (agent, equipment, achievement) follow the existing persist+AsyncStorage pattern from `useFishDexStore`. Tab layout expands from 4 to 5 tabs.

**Tech Stack:** React Native 0.81, Expo SDK 54, Zustand v5, AsyncStorage, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-12-ai-invasion-game-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|----------------|
| `src/data/aiCreatures.ts` | 8 AI creature definitions (same FishSpecies shape) |
| `src/data/achievements.ts` | 7 achievement definitions with conditions and rewards |
| `src/data/aiEquipment.ts` | 3 AI-themed special equipment definitions |
| `src/stores/useAgentStore.ts` | AI assistant state: level, 4 attributes, resources, upgrade logic |
| `src/stores/useEquipmentStore.ts` | Equipment inventory, equipped slots, fragment crafting |
| `src/stores/useAchievementStore.ts` | Achievement progress tracking, unlock checking |
| `app/(tabs)/agent.tsx` | AI assistant training tab UI |
| `app/(tabs)/achievements.tsx` | Achievement list tab UI |

### Modified Files

| File | Changes |
|------|---------|
| `src/game/types.ts` | Add `entityType`, `quoteOnCatch`, `drops` to FishSpecies; add `'epic'` to FishRarity; add ResourceDrop, Achievement, AgentAttribute types |
| `src/data/fish-species.ts` | Add `entityType: 'fish'` to all 12 existing fish entries |
| `src/data/baits.ts` | Add 2 AI-themed baits with effectiveness for AI creatures |
| `src/stores/useGameStore.ts` | Add `lastCatchDrops` field; modify `catchFish` to compute resource drops |
| `src/theme/colors.ts` | Add AI creature UI colors (purple glow, cyan data, resource colors) |
| `app/(tabs)/index.tsx` | Add AI creature catch overlay, data particles, equipment HUD, agent HUD; modify spawn pool to include AI creatures |
| `app/(tabs)/_layout.tsx` | 5-tab layout: fishing, agent, encyclopedia, achievements, records |
| `app/(tabs)/encyclopedia/index.tsx` | Add entity type filter (All/Fish/AI), display AI creatures in grid |

---

## Chunk 1: Data Layer + Spawn Integration

### Task 1: Extend Type System

**Files:**
- Modify: `src/game/types.ts`

- [ ] **Step 1: Add new types and extend FishSpecies**

Add to `src/game/types.ts`:

```typescript
// After existing FishRarity type (line 3), replace with:
export type FishRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// After existing FishCategory type (line 4), add:
export type EntityType = 'fish' | 'ai_creature';

// In FishSpecies interface, add these optional fields after line 25 (after `tip`):
  entityType?: EntityType;   // optional initially; defaults to 'fish' if omitted
  quoteOnCatch?: string;
  drops?: ResourceDrop[];

// Add new types at end of file:
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: Clean build (entityType is optional, so existing fish data compiles without changes)

- [ ] **Step 3: Commit type changes**

```bash
git add src/game/types.ts
git commit -m "feat: extend type system for AI creatures, resources, achievements"
```

---

### Task 2: Add AI Creature Data

**Files:**
- Create: `src/data/aiCreatures.ts`
- Modify: `src/data/fish-species.ts` (add `entityType: 'fish'` to all entries)

- [ ] **Step 1: Add `entityType: 'fish'` to all existing fish**

In `src/data/fish-species.ts`, add `entityType: 'fish' as const,` after the `id` line in every fish entry. This is a simple field addition to all 12 entries.

- [ ] **Step 2: Create AI creatures data file**

Create `src/data/aiCreatures.ts` with 8 AI creature definitions. Each follows the `FishSpecies` interface. Key fields:
- `entityType: 'ai_creature'`
- `category: 'freshwater'` (they appear in the same water)
- `quoteOnCatch`: humorous catch line
- `drops`: resource drops array
- `pixelArt` + `pixelColors`: unique pixel sprites for each creature

Creature list with pixel art:
1. **prompt_sprite** — Prompt 精灵 (common, difficulty 1) — small sparkly sprite
2. **token_swarm** — Token 小鱼群 (common, difficulty 1) — cluster of tiny fish
3. **hallucination_jelly** — Hallucination 水母 (rare, difficulty 2) — jellyfish shape
4. **overfitting_octopus** — 过拟合章鱼 (rare, difficulty 3) — octopus
5. **gan_twins** — GAN 双生鱼 (rare, difficulty 3) — mirrored fish pair
6. **transformer_whale** — Transformer 鲸 (epic, difficulty 4) — large whale
7. **loss_deep_fish** — Loss 深海鱼 (epic, difficulty 4) — angular deep sea fish
8. **agi_koi** — AGI 锦鲤 (legendary, difficulty 5) — ornate koi with glow

Each creature gets:
- Drops scaling with rarity: common drops 2-3 prompt_fragment + 1 training_data; rare drops 3-5 mixed; epic drops model_params + compute_crystal; legendary drops all types generously
- Unique `quoteOnCatch` per spec section 1.4

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: Clean (no errors)

- [ ] **Step 4: Commit**

```bash
git add src/data/aiCreatures.ts src/data/fish-species.ts
git commit -m "feat: add 8 AI creature species and mark existing fish with entityType"
```

---

### Task 3: Add AI-themed Baits

**Files:**
- Modify: `src/data/baits.ts`

- [ ] **Step 1: Add 2 new baits to BAITS array**

Append to the `BAITS` array in `src/data/baits.ts`. Note: these baits are added to the data array now but will be gated by achievement unlocks in Chunk 3 (Task 11). The `BaitSelector` component in `index.tsx` will be updated in Chunk 3 to filter by `useAchievementStore.getState().unlockedBaits`.

```typescript
{
  id: 'data_fragment',
  name: 'Data Fragment',
  nameCn: '数据碎片',
  description: 'AI 世界的通用诱饵。对 AI 生物有极强吸引力，对真鱼几乎无效。',
  effectiveness: {
    // Real fish: very low
    crucian_carp: 0.1, grass_carp: 0.1, common_carp: 0.1,
    // AI creatures: high
    prompt_sprite: 0.9, token_swarm: 0.85,
    hallucination_jelly: 0.7, overfitting_octopus: 0.7, gan_twins: 0.75,
    transformer_whale: 0.5, loss_deep_fish: 0.5, agi_koi: 0.3,
  },
  pixelArt: [
    [0, 1, 0, 1],
    [1, 2, 1, 0],
    [0, 1, 2, 1],
    [1, 0, 1, 0],
  ],
  pixelColors: ['transparent', '#44CCFF', '#AA66FF'],
},
{
  id: 'compute_chip',
  name: 'Compute Chip',
  nameCn: '算力芯片',
  description: '高级 AI 诱饵。对史诗和传说级 AI 生物有极高吸引力。',
  effectiveness: {
    // Real fish: nearly zero
    crucian_carp: 0.05,
    // AI creatures: scaled by rarity
    prompt_sprite: 0.3, token_swarm: 0.3,
    hallucination_jelly: 0.5, overfitting_octopus: 0.5, gan_twins: 0.5,
    transformer_whale: 0.9, loss_deep_fish: 0.85, agi_koi: 0.95,
  },
  pixelArt: [
    [0, 1, 1, 1, 0],
    [1, 2, 3, 2, 1],
    [1, 3, 2, 3, 1],
    [1, 2, 3, 2, 1],
    [0, 1, 1, 1, 0],
  ],
  pixelColors: ['transparent', '#333333', '#44CCFF', '#FFD700'],
},
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/data/baits.ts
git commit -m "feat: add data fragment and compute chip AI-themed baits"
```

---

### Task 4: Integrate AI Creatures into Spawn Pool

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Import AI creatures and merge with fish pool**

At the top of `app/(tabs)/index.tsx`, add import:
```typescript
import { AI_CREATURES } from '../../src/data/aiCreatures';
```

Create combined species pool:
```typescript
const ALL_SPECIES = [...FISH_SPECIES, ...AI_CREATURES];
```

- [ ] **Step 2: Replace FISH_SPECIES references in spawn logic with AI appearance rates**

In `releaseCast` callback (~line 458), replace `FISH_SPECIES.filter(...)` with `ALL_SPECIES.filter(...)` and add base appearance rate modifier for AI creatures per spec (common 15%, rare 8%, epic 3%, legendary 0.5%):

```typescript
const AI_BASE_RATES: Record<string, number> = {
  common: 0.15, uncommon: 0.10, rare: 0.08, epic: 0.03, legendary: 0.005,
};

const candidates = ALL_SPECIES.filter((fish) => {
  const effectiveness = baitObj?.effectiveness[fish.id] ?? 0.1;
  // AI creatures have an additional base appearance rate gate
  if (fish.entityType === 'ai_creature') {
    const baseRate = AI_BASE_RATES[fish.rarity] ?? 0.1;
    return Math.random() < baseRate && Math.random() < effectiveness;
  }
  return Math.random() < effectiveness;
});
```

- [ ] **Step 3: Replace FISH_SPECIES in swimming fish decoration**

In the swimming fish useEffect (~line 405), replace `FISH_SPECIES.map` with `ALL_SPECIES.map` so AI creatures also appear swimming in the water.

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`

- [ ] **Step 5: Commit**

```bash
git add app/\(tabs\)/index.tsx
git commit -m "feat: integrate AI creatures into fishing spawn pool"
```

---

### Task 5: AI Creature Catch Result Overlay

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `src/theme/colors.ts`

- [ ] **Step 1: Add AI-themed colors**

Add to `src/theme/colors.ts`:
```typescript
  // AI Creature UI
  aiPurple: '#AA66FF',
  aiPurpleDim: '#5A3388',
  aiPurpleGlow: '#AA66FF33',
  aiCyan: '#44CCFF',
  aiCyanDim: '#1A6688',
  aiGold: '#FFD700',

  // Resources
  resourcePrompt: '#FFD700',
  resourceParams: '#AA66FF',
  resourceData: '#44CCFF',
  resourceCompute: '#FF5555',

  // Rarity epic (new)
  rarityEpic: '#AA66FF',
```

- [ ] **Step 2: Create AICatchResultOverlay component**

Add a new component in `app/(tabs)/index.tsx` (before the FishingScreen function):

```typescript
function AICatchResultOverlay({
  fish, weight, isNewDiscovery, onContinue,
}: {
  fish: FishSpecies; weight: number; isNewDiscovery: boolean; onContinue: () => void;
}) {
  return (
    <View style={styles.overlay}>
      <PixelCard style={[styles.catchCard, { borderColor: PIXEL_COLORS.aiPurple }]}>
        <View style={styles.newBadge}>
          <PixelText variant="pixel" color={PIXEL_COLORS.aiPurple}>
            {'★★★ AI 实体捕获！★★★'}
          </PixelText>
        </View>

        <View style={styles.catchFishDisplay}>
          <PixelSprite data={fish.pixelArt} colors={fish.pixelColors} pixelSize={8} />
        </View>

        <PixelText variant="subtitle" style={{ textAlign: 'center', marginTop: 12 }}>
          {fish.nameCn}
        </PixelText>
        <PixelText variant="caption" color={PIXEL_COLORS.aiPurple} style={{ textAlign: 'center', marginTop: 2 }}>
          [{fish.rarity === 'epic' ? '史诗' : fish.rarity === 'legendary' ? '传说' : fish.rarity === 'rare' ? '稀有' : '普通'}]
        </PixelText>

        {/* Weight */}
        <View style={styles.catchStats}>
          <View style={styles.catchStat}>
            <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim}>重量</PixelText>
            <PixelText variant="subtitle" color={PIXEL_COLORS.aiPurple}>{weight.toFixed(1)} kg</PixelText>
          </View>
          <View style={styles.catchStatDivider} />
          <View style={styles.catchStat}>
            <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim}>难度</PixelText>
            <PixelText variant="subtitle" color={PIXEL_COLORS.aiPurple}>{'★'.repeat(fish.difficulty)}</PixelText>
          </View>
        </View>

        {/* Quote */}
        {fish.quoteOnCatch && (
          <View style={[styles.tipBox, { borderColor: PIXEL_COLORS.aiPurpleDim }]}>
            <PixelText variant="caption" color={PIXEL_COLORS.uiText} style={{ fontStyle: 'italic' }}>
              "{fish.quoteOnCatch}"
            </PixelText>
          </View>
        )}

        {/* Resource drops */}
        {fish.drops && fish.drops.length > 0 && (
          <View style={styles.dropsRow}>
            {fish.drops.map((drop, i) => {
              const dropConfig: Record<string, { color: string; label: string }> = {
                prompt_fragment: { color: PIXEL_COLORS.resourcePrompt, label: 'Prompt碎片' },
                model_params: { color: PIXEL_COLORS.resourceParams, label: '模型参数' },
                training_data: { color: PIXEL_COLORS.resourceData, label: '训练数据' },
                compute_crystal: { color: PIXEL_COLORS.resourceCompute, label: '算力晶体' },
              };
              const cfg = dropConfig[drop.type];
              return (
                <View key={i} style={[styles.dropChip, { borderColor: cfg.color + '66' }]}>
                  <PixelText variant="pixel" color={cfg.color}>+{drop.amount}</PixelText>
                  <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim} style={{ marginLeft: 4 }}>
                    {cfg.label}
                  </PixelText>
                </View>
              );
            })}
          </View>
        )}

        <PixelButton title="继续钓鱼" onPress={onContinue} style={{ marginTop: 12 }} icon="▸" />
      </PixelCard>
    </View>
  );
}
```

- [ ] **Step 3: Add styles for drops row and chips**

Add to the StyleSheet at the bottom of `app/(tabs)/index.tsx`:

```typescript
dropsRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 6,
  marginTop: 8,
},
dropChip: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: PIXEL_COLORS.hudBg,
  borderWidth: 1,
  paddingHorizontal: 8,
  paddingVertical: 4,
},
```

- [ ] **Step 4: Update existing CatchResultOverlay to handle 'epic' rarity**

In the existing `CatchResultOverlay` component (~line 243), add `'epic'` to both `rarityColor` and `rarityLabel` maps:
```typescript
const rarityColor: Record<string, string> = {
  common: PIXEL_COLORS.rarityCommon,
  uncommon: PIXEL_COLORS.rarityUncommon,
  rare: PIXEL_COLORS.rarityRare,
  epic: PIXEL_COLORS.rarityEpic,      // NEW
  legendary: PIXEL_COLORS.rarityLegendary,
};
const rarityLabel: Record<string, string> = {
  common: '普通', uncommon: '少见', rare: '珍稀', epic: '史诗', legendary: '传说',  // epic added
};
```

- [ ] **Step 5: Route to correct overlay based on entityType**

In the FishingScreen render, where `CatchResultOverlay` is shown (when `phase === 'caught'`), add a branch:

```typescript
{phase === 'caught' && currentFish && (
  currentFish.entityType === 'ai_creature'
    ? <AICatchResultOverlay fish={currentFish} weight={caughtWeight} isNewDiscovery={isNewDiscovery} onContinue={handleContinue} />
    : <CatchResultOverlay fish={currentFish} weight={caughtWeight} isNewDiscovery={isNewDiscovery} onContinue={handleContinue} />
)}
```

> **Note:** Achievement progress display in the catch overlay (spec 1.4 "成就进度提示") is deferred to Chunk 3 Task 11, when `useAchievementStore` exists. The `AICatchResultOverlay` will be updated at that point to show progress.

- [ ] **Step 6: Verify build**

Run: `npx tsc --noEmit`

- [ ] **Step 7: Commit**

```bash
git add src/theme/colors.ts app/\(tabs\)/index.tsx
git commit -m "feat: add AI creature catch overlay with quotes and resource drops"
```

---

### Task 6: Add Data Particles in Water

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Create DataParticle and DataParticles components**

Add before FishingScreen function. **Important:** Each particle must be its own component to avoid React hooks rules violation (no hooks inside `.map()` loops).

```typescript
const PARTICLE_DATA = ['01', 'AI', '∇', 'λ', '10', '{}', '>>'].map((text, i) => ({
  text,
  x: Math.random() * SCREEN_WIDTH,
  delay: i * 600,
  bottom: 20 + i * 15,
}));

function DataParticle({ text, x, delay, bottom }: { text: string; x: number; delay: number; bottom: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 4000, useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [30, -40] });
  const opacity = anim.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.5, 0.3, 0] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        bottom,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <PixelText variant="pixel" color={PIXEL_COLORS.aiPurple} style={{ fontSize: 8 }}>
        {text}
      </PixelText>
    </Animated.View>
  );
}

function DataParticles() {
  return (
    <>
      {PARTICLE_DATA.map((p, i) => (
        <DataParticle key={i} {...p} />
      ))}
    </>
  );
}
```

- [ ] **Step 2: Add DataParticles inside the water section**

In the FishingScreen render, inside the water `<View>` (after `<WaterWaves />`), add:

```typescript
<DataParticles />
```

- [ ] **Step 3: Verify build and commit**

```bash
npx tsc --noEmit
git add app/\(tabs\)/index.tsx
git commit -m "feat: add floating data particles in water hinting AI presence"
```

---

## Chunk 2: Agent System

### Task 7: Create Agent Store

**Files:**
- Create: `src/stores/useAgentStore.ts`

- [ ] **Step 1: Create the agent store**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgentAttribute, ResourceDrop, ResourceType } from '../game/types';

const UPGRADE_COSTS: Record<number, number> = {
  1: 10, 2: 25, 3: 50, 4: 100, 5: 0, // Lv.5 is max
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
```

- [ ] **Step 2: Wire resource collection into catch flow**

In `app/(tabs)/index.tsx`, import `useAgentStore`:
```typescript
import { useAgentStore } from '../../src/stores/useAgentStore';
```

In `FishingScreen`, get `addResources`:
```typescript
const { addResources } = useAgentStore();
```

In `handleHookSet` callback, after `discoverFish(fish.id, weight)` and `catchFish()` (~line 516), add resource collection:
```typescript
if (fish.drops) {
  addResources(fish.drops);
}
```

Also add small training_data drop for real fish (after the `if (fish.drops)` block):
```typescript
if (fish.entityType === 'fish') {
  addResources([{ type: 'training_data', amount: 1 }]);
}
```

- [ ] **Step 3: Verify build and commit**

```bash
npx tsc --noEmit
git add src/stores/useAgentStore.ts app/\(tabs\)/index.tsx
git commit -m "feat: add agent store with resource collection on catch"
```

---

### Task 8: Create Agent Tab UI

**Files:**
- Create: `app/(tabs)/agent.tsx`

- [ ] **Step 1: Build agent training screen**

Create `app/(tabs)/agent.tsx` — the AI assistant training/upgrade interface. Use the same pixel-art RPG styling as other screens. Key sections:
- Agent avatar area: pixel robot sprite + level + title
- 4 stat bars (perception/reasoning/generation/compute) with upgrade buttons
- Resource inventory display at bottom
- Each stat row: icon + name + progress bar + level + upgrade button

Follow existing UI patterns from `app/(tabs)/encyclopedia/index.tsx` and `app/(tabs)/records/index.tsx` for layout structure (SafeAreaView, ScrollView, PixelCard, PixelText, StyleSheet).

Use `useAgentStore` for all state. The upgrade button calls `upgradeAttribute(attr)` and shows cost. Disabled state when `!canUpgrade(attr)` or at max level.

Color coding per attribute:
- Perception: `PIXEL_COLORS.aiGold` (#FFD700)
- Reasoning: `PIXEL_COLORS.aiPurple` (#AA66FF)
- Generation: `PIXEL_COLORS.aiCyan` (#44CCFF)
- Compute: `PIXEL_COLORS.resourceCompute` (#FF5555)

Resource chips at bottom showing current inventory with icons.

- [ ] **Step 2: Verify build and commit**

```bash
npx tsc --noEmit
git add app/\(tabs\)/agent.tsx
git commit -m "feat: add AI assistant training tab with stat upgrades"
```

---

### Task 9: Agent HUD in Game Screen

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Create AgentHUD component**

Add to `app/(tabs)/index.tsx`:

```typescript
function AgentHUD() {
  const { getLevel, getLevelTitle, generation, reasoning } = useAgentStore();
  const level = getLevel();
  const title = getLevelTitle();

  if (level < 1) return null;

  return (
    <View style={styles.agentHud}>
      <PixelText variant="pixel" color={PIXEL_COLORS.aiCyan} style={{ fontSize: 8 }}>
        AI ASSISTANT Lv.{level}
      </PixelText>
      <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 7 }}>
        {title}
      </PixelText>
    </View>
  );
}
```

- [ ] **Step 2: Add bait recommendation based on generation attribute**

In `BaitSelector`, import `useAgentStore` and add AI recommendation logic:
- If `generation >= 3`, find the bait with highest effectiveness for AI creatures and show an "AI推荐" badge next to it
- This is computed by summing effectiveness values across all AI creature IDs

- [ ] **Step 3: Add fish prediction on bite based on reasoning attribute**

When `phase === 'bite'` and `reasoning >= 3`, show a prediction text:
```typescript
<PixelText variant="pixel" color={PIXEL_COLORS.aiCyan} style={{ fontSize: 9 }}>
  {`${Math.round(60 + Math.random() * 35)}% → ${currentFish?.nameCn}`}
</PixelText>
```

- [ ] **Step 4: Apply compute bonus to stamina drain**

In `handleHookSet` game loop, modify `staminaDrain` calculation to include compute bonus:
```typescript
const computeLevel = useAgentStore.getState().compute;
const computeBonus = 1 + computeLevel * 0.1; // Lv.5 = 1.5x drain
staminaDrain *= computeBonus;
```

- [ ] **Step 5: Add AgentHUD to game scene**

Position it at top-right of the game scene (absolute positioning), shown during all phases.

- [ ] **Step 6: Add agentHud style**

```typescript
agentHud: {
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: PIXEL_COLORS.hudBg + 'DD',
  borderWidth: 1,
  borderColor: PIXEL_COLORS.aiCyanDim,
  padding: 6,
  zIndex: 20,
},
```

- [ ] **Step 7: Verify build and commit**

```bash
npx tsc --noEmit
git add app/\(tabs\)/index.tsx
git commit -m "feat: add agent HUD, bait recommendation, fish prediction, compute bonus"
```

---

## Chunk 3: Equipment + Achievements

### Task 10: Create Equipment Store

**Files:**
- Create: `src/stores/useEquipmentStore.ts`
- Create: `src/data/aiEquipment.ts`

- [ ] **Step 1: Create AI equipment data**

Create `src/data/aiEquipment.ts` with 3 special AI equipment items following `GearItem` interface:

```typescript
import { GearItem } from '../game/types';

export const AI_EQUIPMENT: GearItem[] = [
  {
    id: 'neural_line',
    name: 'Neural Network Line',
    nameCn: '神经网络鱼线',
    type: 'line',
    description: '张力自动向最佳区间微调',
    stats: { strength: 8, diameter: 0.25, sensitivity: 9, autoTension: 0.05 },
  },
  {
    id: 'attention_rod',
    name: 'Attention Rod',
    nameCn: '注意力鱼竿',
    type: 'rod',
    description: '等待阶段显示 2 个浮漂',
    stats: { length: 4.5, power: 8, sensitivity: 10, dualBobber: 1 },
  },
  {
    id: 'gradient_hook',
    name: 'Gradient Descent Hook',
    nameCn: '梯度下降鱼钩',
    type: 'hook',
    description: '鱼体力消耗速度逐渐加快',
    stats: { size: 6, sharpness: 9, strength: 8, acceleratingDrain: 0.001 },
  },
];
```

- [ ] **Step 2: Create equipment store**

Create `src/stores/useEquipmentStore.ts` with Zustand + persist:
- State: `equipped: Record<EquipmentSlot, string | null>`, `inventory: string[]`, `fragments: Record<string, number>`
- Actions: `equip(slot, itemId)`, `unequip(slot)`, `addFragment(fragmentId)`, `craftEquipment(fragmentId)` (3 fragments → 1 item, add to inventory)
- Getters: `getEquipped(slot)`, `hasItem(itemId)`, `getFragmentCount(fragmentId)`

- [ ] **Step 3: Apply equipment stats in game loop**

In `app/(tabs)/index.tsx`, import `useEquipmentStore` and `GEAR_CATALOG` + `AI_EQUIPMENT`.

In `handleHookSet` game loop:
- Get equipped line item, check its `strength` stat → use as break threshold (default 0.85, scale: `0.85 + strength * 0.01`)
- Get equipped hook, check `acceleratingDrain` → add cumulative drain bonus each tick
- Neural line `autoTension`: if tension is outside 0.3-0.7, nudge it toward center by ±autoTension value

In `releaseCast`:
- Get equipped rod `sensitivity` → modify hook window duration: `2500 + sensitivity * 150` ms
- Get equipped rod `power` → modify cast distance multiplier

- [ ] **Step 4: Verify build and commit**

```bash
npx tsc --noEmit
git add src/data/aiEquipment.ts src/stores/useEquipmentStore.ts app/\(tabs\)/index.tsx
git commit -m "feat: add equipment store and apply gear stats to game mechanics"
```

---

### Task 11: Create Achievement Store and Data

**Files:**
- Create: `src/data/achievements.ts`
- Create: `src/stores/useAchievementStore.ts`

- [ ] **Step 1: Create achievements data**

Create `src/data/achievements.ts` with 7 achievement definitions per spec section 5.1. Each achievement has `id`, `nameCn`, `description`, `condition` (type + target + optional filter), and `reward`.

- [ ] **Step 2: Create achievement store**

Create `src/stores/useAchievementStore.ts` with Zustand + persist:
- State: `progress: Record<string, { current: number; unlocked: boolean; unlockedAt?: string }>`
- Actions:
  - `recordCatch(speciesId, entityType, rarity)` — increments relevant counters, checks unlock conditions
  - `recordCombo(count)` — for combo tracking
  - `getProgress(achievementId)` — returns current/target/unlocked
  - `getNewlyUnlocked()` — returns achievements unlocked since last check, then clears
- All unlock checks happen inside `recordCatch`/`recordCombo`. When an achievement unlocks, apply its reward:
  - `'resources'` → call `useAgentStore.getState().addResources(reward.resources)`
  - `'agent_levels'` → directly increment agent attributes
  - `'unlock_bait'` — store a `unlockedBaits: string[]` array in this store

- [ ] **Step 3: Wire achievement tracking into catch flow**

In `app/(tabs)/index.tsx`, after `catchFish()` in the game loop:
```typescript
const { recordCatch } = useAchievementStore.getState();
recordCatch(fish.id, fish.entityType, fish.rarity);
```

- [ ] **Step 4: Verify build and commit**

```bash
npx tsc --noEmit
git add src/data/achievements.ts src/stores/useAchievementStore.ts app/\(tabs\)/index.tsx
git commit -m "feat: add achievement system with auto-tracking on catch"
```

---

### Task 12: Create Achievements Tab UI

**Files:**
- Create: `app/(tabs)/achievements.tsx`

- [ ] **Step 1: Build achievements screen**

Create `app/(tabs)/achievements.tsx` — list of all achievements with progress bars. Use RPG pixel-art styling consistent with other tabs.

Layout:
- Header with total unlocked count
- List of achievement cards, each showing:
  - Achievement name + description
  - Progress bar (current/target)
  - Reward preview
  - Unlocked badge (gold border + checkmark) when completed
  - Locked styling (dimmed) when not yet unlocked

Use `useAchievementStore` for state. Import `ACHIEVEMENTS` from data file for display info.

- [ ] **Step 2: Verify build and commit**

```bash
npx tsc --noEmit
git add app/\(tabs\)/achievements.tsx
git commit -m "feat: add achievements tab with progress tracking"
```

---

## Chunk 4: Tab Restructure + Encyclopedia Refactor

### Task 13: Restructure Tab Layout

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Update to 5-tab layout**

Replace the 4-tab configuration with 5 tabs:
1. `index` — 钓鱼 (fish icon, unchanged)
2. `agent` — AI助手 (robot icon: `"robot"`)
3. `encyclopedia` — 图鉴 (book icon, unchanged)
4. `achievements` — 成就 (trophy icon: `"trophy"`)
5. `records` — 记录 (notebook icon, unchanged)

Remove the `community` tab entry. Add new tab entries for `agent` and `achievements` with the same styling pattern (icon + glow effect).

- [ ] **Step 2: Verify tab navigation works**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/_layout.tsx
git commit -m "feat: restructure tabs to 5-tab layout with agent and achievements"
```

---

### Task 14: Refactor Encyclopedia to Show AI Creatures

**Files:**
- Modify: `app/(tabs)/encyclopedia/index.tsx`

- [ ] **Step 1: Add entity type filter**

Import `AI_CREATURES` and add filter tabs at top of the fish list:
- "全部" — shows all species
- "鱼类" — shows only `entityType === 'fish'`
- "AI生物" — shows only `entityType === 'ai_creature'`

Use a `useState` for the filter, then filter `ALL_SPECIES` accordingly.

- [ ] **Step 2: Add rarity-based border colors for AI creatures**

For `entityType === 'ai_creature'`, use rarity-specific border colors:
- epic: `PIXEL_COLORS.rarityEpic`
- legendary: `PIXEL_COLORS.rarityLegendary`

Add a small "AI" badge in the corner of AI creature cards.

- [ ] **Step 3: Verify build and commit**

```bash
npx tsc --noEmit
git add app/\(tabs\)/encyclopedia/index.tsx
git commit -m "feat: encyclopedia shows AI creatures with entity type filter"
```

---

### Task 15: Final Build Verification

- [ ] **Step 1: Full TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Web export build**

Run: `npx expo export --platform web`
Expected: Build succeeds, output in `dist/`

- [ ] **Step 3: Final commit with any fixes**

Fix any build errors found, then:
```bash
git add -A
git commit -m "fix: resolve build issues from AI invasion feature integration"
```
