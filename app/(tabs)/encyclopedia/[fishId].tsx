import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { PIXEL_COLORS } from '../../../src/theme/colors';
import { PixelText } from '../../../src/components/common/PixelText';
import { PixelCard } from '../../../src/components/common/PixelCard';
import { PixelSprite } from '../../../src/components/common/PixelSprite';
import { FISH_SPECIES } from '../../../src/data/fish-species';
import { AI_CREATURES } from '../../../src/data/aiCreatures';
import { BAITS } from '../../../src/data/baits';
import { useFishDexStore } from '../../../src/stores/useFishDexStore';

const ALL_SPECIES = [...FISH_SPECIES, ...AI_CREATURES];

const RARITY_COLOR: Record<string, string> = {
  common: PIXEL_COLORS.rarityCommon,
  uncommon: PIXEL_COLORS.rarityUncommon,
  rare: PIXEL_COLORS.rarityRare,
  epic: PIXEL_COLORS.rarityEpic,
  legendary: PIXEL_COLORS.rarityLegendary,
};

const RARITY_LABEL: Record<string, string> = {
  common: '普通',
  uncommon: '少见',
  rare: '珍稀',
  epic: '史诗',
  legendary: '传说',
};

const CATEGORY_LABEL: Record<string, string> = {
  freshwater: '淡水',
  saltwater: '海水',
  pond: '池塘',
  digital: '数字世界',
};

export default function FishDetailScreen() {
  const { fishId } = useLocalSearchParams<{ fishId: string }>();
  const fish = ALL_SPECIES.find((f) => f.id === fishId);
  const { isDiscovered, getEntry } = useFishDexStore();

  if (!fish) {
    return (
      <View style={styles.container}>
        <PixelText variant="title">未找到该鱼种</PixelText>
      </View>
    );
  }

  const discovered = isDiscovered(fish.id);
  const entry = getEntry(fish.id);
  const isAI = fish.entityType === 'ai_creature';
  const preferredBaits = BAITS.filter((b) => fish.preferredBait.includes(b.id));
  const rarityColor = RARITY_COLOR[fish.rarity] || PIXEL_COLORS.rarityCommon;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Fish pixel art display with rarity glow border */}
      <PixelCard style={styles.mainCard}>
        <View style={[styles.fishDisplayOuter, { borderColor: rarityColor }]}>
          <View style={[styles.fishDisplayGlow, { backgroundColor: rarityColor + '18' }]}>
            <View style={[styles.fishDisplayInner, { borderColor: rarityColor + '44' }]}>
              <PixelSprite
                data={fish.pixelArt}
                colors={discovered ? fish.pixelColors : fish.pixelColors.map(() => '#444')}
                pixelSize={8}
              />
            </View>
          </View>
        </View>
        <PixelText variant="title" style={{ textAlign: 'center', marginTop: 12 }}>
          {discovered ? fish.nameCn : '[???]'}
        </PixelText>
        {discovered && (
          <PixelText variant="caption" style={{ textAlign: 'center' }}>
            {fish.name}
          </PixelText>
        )}
        <View style={styles.rarityBadge}>
          <View style={[styles.rarityDot, { backgroundColor: rarityColor }]} />
          <PixelText
            variant="caption"
            color={rarityColor}
            style={{ textAlign: 'center' }}
          >
            [{RARITY_LABEL[fish.rarity]}] | {CATEGORY_LABEL[fish.category]}
          </PixelText>
        </View>
      </PixelCard>

      {/* Stats - RPG style */}
      <PixelCard style={styles.section}>
        <PixelText variant="subtitle" color={PIXEL_COLORS.hudActive} style={{ marginBottom: 8, textAlign: 'center' }}>
          === 基本信息 ===
        </PixelText>
        <View style={styles.statRow}>
          <PixelText variant="caption" style={styles.statLabel}>LV 难度</PixelText>
          <PixelText variant="caption" color={PIXEL_COLORS.hudActive}>
            {'★'.repeat(fish.difficulty)}{'☆'.repeat(5 - fish.difficulty)}
          </PixelText>
        </View>
        <View style={styles.statRow}>
          <PixelText variant="caption" style={styles.statLabel}>WT 体重</PixelText>
          <PixelText variant="caption" color={PIXEL_COLORS.hudActive}>
            {fish.minWeight} - {fish.maxWeight} kg
          </PixelText>
        </View>
        <View style={styles.statRow}>
          <PixelText variant="caption" style={styles.statLabel}>ATK 战力</PixelText>
          <View style={styles.statBarOuter}>
            <View style={styles.statBarInner}>
              <View style={[styles.statBarFill, { width: `${fish.fightStrength * 100}%`, backgroundColor: PIXEL_COLORS.uiDanger }]} />
              <View style={styles.statBarShine} />
            </View>
          </View>
        </View>
        <View style={styles.statRow}>
          <PixelText variant="caption" style={styles.statLabel}>SPD 速度</PixelText>
          <View style={styles.statBarOuter}>
            <View style={styles.statBarInner}>
              <View style={[styles.statBarFill, { width: `${(fish.swimSpeed / 5) * 100}%`, backgroundColor: PIXEL_COLORS.uiInfo }]} />
              <View style={styles.statBarShine} />
            </View>
          </View>
        </View>
      </PixelCard>

      {/* Habitat */}
      <PixelCard style={styles.section}>
        <PixelText variant="subtitle" color={PIXEL_COLORS.hudActive} style={{ marginBottom: 8, textAlign: 'center' }}>
          === 栖息地 ===
        </PixelText>
        <PixelText variant="body">{fish.habitat}</PixelText>
      </PixelCard>

      {/* Description */}
      <PixelCard style={styles.section}>
        <PixelText variant="subtitle" color={PIXEL_COLORS.hudActive} style={{ marginBottom: 8, textAlign: 'center' }}>
          === 简介 ===
        </PixelText>
        <PixelText variant="body">{fish.description}</PixelText>
      </PixelCard>

      {/* AI creature quote */}
      {isAI && fish.quoteOnCatch && (
        <PixelCard variant="highlight" style={styles.section}>
          <PixelText variant="subtitle" color={PIXEL_COLORS.aiPurple} style={{ marginBottom: 8, textAlign: 'center' }}>
            === AI 语录 ===
          </PixelText>
          <PixelText variant="body" color={PIXEL_COLORS.uiText} style={{ fontStyle: 'italic', textAlign: 'center' }}>
            "{fish.quoteOnCatch}"
          </PixelText>
        </PixelCard>
      )}

      {/* AI creature drops */}
      {isAI && fish.drops && fish.drops.length > 0 && (
        <PixelCard style={styles.section}>
          <PixelText variant="subtitle" color={PIXEL_COLORS.aiCyan} style={{ marginBottom: 8, textAlign: 'center' }}>
            === 掉落资源 ===
          </PixelText>
          {fish.drops.map((drop, i) => {
            const dropLabels: Record<string, string> = {
              prompt_fragment: 'Prompt碎片',
              model_params: '模型参数',
              training_data: '训练数据',
              compute_crystal: '算力晶体',
            };
            return (
              <View key={i} style={styles.statRow}>
                <PixelText variant="caption" style={styles.statLabel}>{dropLabels[drop.type] || drop.type}</PixelText>
                <PixelText variant="caption" color={PIXEL_COLORS.aiCyan}>+{drop.amount}</PixelText>
              </View>
            );
          })}
        </PixelCard>
      )}

      {/* Preferred baits - inventory slot style */}
      <PixelCard style={styles.section}>
        <PixelText variant="subtitle" color={PIXEL_COLORS.hudActive} style={{ marginBottom: 8, textAlign: 'center' }}>
          === 推荐鱼饵 ===
        </PixelText>
        {preferredBaits.map((bait) => (
          <View key={bait.id} style={styles.baitSlot}>
            <View style={styles.baitIcon}>
              <PixelSprite data={bait.pixelArt} colors={bait.pixelColors} pixelSize={4} />
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <PixelText variant="caption" color={PIXEL_COLORS.uiText}>{bait.nameCn}</PixelText>
              <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 10 }}>
                {bait.description}
              </PixelText>
            </View>
          </View>
        ))}
      </PixelCard>

      {/* Fishing tip */}
      <PixelCard variant="highlight" style={styles.section}>
        <PixelText variant="subtitle" color={PIXEL_COLORS.uiInfo} style={{ marginBottom: 8, textAlign: 'center' }}>
          === 实钓小贴士 ===
        </PixelText>
        <PixelText variant="body">{fish.tip}</PixelText>
      </PixelCard>

      {/* Player stats */}
      {discovered && entry && (
        <PixelCard style={styles.section}>
          <PixelText variant="subtitle" color={PIXEL_COLORS.hudActive} style={{ marginBottom: 8, textAlign: 'center' }}>
            === 我的记录 ===
          </PixelText>
          <View style={styles.statRow}>
            <PixelText variant="caption" style={styles.statLabel}>CNT 捕获</PixelText>
            <PixelText variant="caption" color={PIXEL_COLORS.hudActive}>{entry.caughtCount}</PixelText>
          </View>
          <View style={styles.statRow}>
            <PixelText variant="caption" style={styles.statLabel}>MAX 重量</PixelText>
            <PixelText variant="caption" color={PIXEL_COLORS.hudActive}>{entry.bestWeight.toFixed(1)} kg</PixelText>
          </View>
          <View style={styles.statRow}>
            <PixelText variant="caption" style={styles.statLabel}>1ST 发现</PixelText>
            <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>
              {new Date(entry.firstCaughtDate).toLocaleDateString('zh-CN')}
            </PixelText>
          </View>
        </PixelCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIXEL_COLORS.hudBg },
  content: { padding: 16, paddingBottom: 32 },
  mainCard: { alignItems: 'center', marginBottom: 12 },
  fishDisplayOuter: {
    width: '100%',
    borderWidth: 3,
    borderColor: PIXEL_COLORS.rarityCommon,
  },
  fishDisplayGlow: {
    width: '100%',
    padding: 2,
  },
  fishDisplayInner: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PIXEL_COLORS.waterDeep + '44',
    borderWidth: 1,
    borderColor: PIXEL_COLORS.rarityCommon + '44',
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    gap: 6,
  },
  rarityDot: {
    width: 8,
    height: 8,
  },
  section: { marginBottom: 12 },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: PIXEL_COLORS.windowOuter + '44',
  },
  statLabel: {
    minWidth: 80,
    color: PIXEL_COLORS.uiTextDim,
    letterSpacing: 1,
  },
  statBarOuter: {
    width: 110,
    height: 12,
    backgroundColor: PIXEL_COLORS.windowOuter,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.windowOuter,
    overflow: 'hidden',
  },
  statBarInner: {
    flex: 1,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 1,
    borderColor: PIXEL_COLORS.hudBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  statBarFill: { height: '100%' },
  statBarShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: PIXEL_COLORS.starColor + '44',
  },
  baitSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.windowOuter,
    backgroundColor: PIXEL_COLORS.hudBg,
  },
  baitIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PIXEL_COLORS.hudBorder,
    backgroundColor: PIXEL_COLORS.windowFill,
  },
});
