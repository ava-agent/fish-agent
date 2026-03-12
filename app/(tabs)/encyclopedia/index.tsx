import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { PIXEL_COLORS } from '../../../src/theme/colors';
import { PixelText } from '../../../src/components/common/PixelText';
import { PixelCard } from '../../../src/components/common/PixelCard';
import { PixelButton } from '../../../src/components/common/PixelButton';
import { PixelSprite } from '../../../src/components/common/PixelSprite';
import { FISH_SPECIES } from '../../../src/data/fish-species';
import { useFishDexStore } from '../../../src/stores/useFishDexStore';
import { FishCategory } from '../../../src/game/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const CATEGORIES: { key: FishCategory | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'freshwater', label: '淡水' },
  { key: 'pond', label: '池塘' },
];

const RARITY_BORDER: Record<string, string> = {
  common: PIXEL_COLORS.rarityCommon,
  uncommon: PIXEL_COLORS.rarityUncommon,
  rare: PIXEL_COLORS.rarityRare,
  legendary: PIXEL_COLORS.rarityLegendary,
};

export default function EncyclopediaScreen() {
  const [category, setCategory] = useState<FishCategory | 'all'>('all');
  const { isDiscovered, getEntry, getTotalDiscovered } = useFishDexStore();

  const filteredFish = FISH_SPECIES.filter(
    (f) => category === 'all' || f.category === category
  );

  const progressPercent = (getTotalDiscovered() / FISH_SPECIES.length) * 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Stats - EXP bar style */}
      <PixelCard style={styles.statsCard}>
        <PixelText variant="pixel" color={PIXEL_COLORS.hudActive}>
          图鉴进度: {getTotalDiscovered()} / {FISH_SPECIES.length}
        </PixelText>
        <View style={styles.progressOuter}>
          <View style={styles.progressInner}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%` },
              ]}
            />
            {/* Shine effect on the bar */}
            <View style={styles.progressShine} />
          </View>
        </View>
        <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim} style={{ marginTop: 4, fontSize: 9 }}>
          EXP {Math.round(progressPercent)}%
        </PixelText>
      </PixelCard>

      {/* Category filter - game menu tabs */}
      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => {
          const active = category === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setCategory(cat.key)}
              style={[styles.categoryBtn, active && styles.categoryActive]}
            >
              <PixelText
                variant="caption"
                color={active ? PIXEL_COLORS.hudActive : PIXEL_COLORS.hudInactive}
                style={active ? styles.categoryTextActive : undefined}
              >
                [{cat.label}]
              </PixelText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Fish grid */}
      <View style={styles.grid}>
        {filteredFish.map((fish) => {
          const discovered = isDiscovered(fish.id);
          const entry = getEntry(fish.id);
          const rarityBorder = RARITY_BORDER[fish.rarity] || PIXEL_COLORS.rarityCommon;
          return (
            <TouchableOpacity
              key={fish.id}
              onPress={() => router.push(`/encyclopedia/${fish.id}` as any)}
              style={styles.fishCard}
            >
              <View
                style={[
                  styles.fishCardOuter,
                  discovered && { borderColor: rarityBorder },
                ]}
              >
                <View style={[
                  styles.fishCardBorder,
                  discovered && { borderColor: rarityBorder + '55' },
                ]}>
                  <View style={styles.fishCardFill}>
                    <View style={[styles.fishPreview, !discovered && styles.fishHidden]}>
                      <PixelSprite
                        data={fish.pixelArt}
                        colors={discovered ? fish.pixelColors : fish.pixelColors.map(() => '#444444')}
                        pixelSize={4}
                      />
                    </View>
                    <PixelText variant="caption" numberOfLines={1} style={{ marginTop: 6, textAlign: 'center' }}>
                      {discovered ? fish.nameCn : '[???]'}
                    </PixelText>
                    {discovered && (
                      <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 9, textAlign: 'center' }}>
                        [已发现] x{entry?.caughtCount ?? 0}
                      </PixelText>
                    )}
                    {!discovered && (
                      <PixelText variant="caption" color={PIXEL_COLORS.hudInactive} style={{ fontSize: 9, textAlign: 'center' }}>
                        [未发现]
                      </PixelText>
                    )}
                    {/* Rarity indicator */}
                    <View style={styles.difficultyRow}>
                      <View style={[styles.rarityDot, { backgroundColor: rarityBorder }]} />
                      {Array.from({ length: fish.difficulty }, (_, i) => (
                        <PixelText key={i} variant="caption" color={PIXEL_COLORS.hudActive} style={{ fontSize: 8 }}>
                          ★
                        </PixelText>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick links */}
      <View style={styles.linksRow}>
        <PixelButton
          title="钓具大全"
          icon="⚔"
          onPress={() => router.push('/encyclopedia/gear' as any)}
          variant="secondary"
          size="small"
          style={{ flex: 1, marginRight: 8 }}
        />
        <PixelButton
          title="钓法教程"
          icon="📜"
          onPress={() => router.push('/encyclopedia/techniques' as any)}
          variant="secondary"
          size="small"
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIXEL_COLORS.hudBg },
  content: { padding: 16, paddingBottom: 32 },
  statsCard: { marginBottom: 12, alignItems: 'center' },
  progressOuter: {
    width: '100%',
    height: 16,
    backgroundColor: PIXEL_COLORS.windowOuter,
    borderWidth: 3,
    borderColor: PIXEL_COLORS.windowOuter,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressInner: {
    flex: 1,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 1,
    borderColor: PIXEL_COLORS.hudBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: PIXEL_COLORS.hudActive,
  },
  progressShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: PIXEL_COLORS.starColor + '33',
  },
  categoryRow: { flexDirection: 'row', marginBottom: 12, gap: 4 },
  categoryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.windowOuter,
    backgroundColor: PIXEL_COLORS.hudBg,
  },
  categoryActive: {
    borderColor: PIXEL_COLORS.hudActive,
    backgroundColor: PIXEL_COLORS.hudGlow,
    borderBottomWidth: 3,
  },
  categoryTextActive: {
    fontSize: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  fishCard: { width: CARD_WIDTH },
  fishCardOuter: {
    borderWidth: 3,
    borderColor: PIXEL_COLORS.windowOuter,
  },
  fishCardBorder: {
    borderWidth: 2,
    borderColor: PIXEL_COLORS.windowInner + '55',
  },
  fishCardFill: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: PIXEL_COLORS.windowFill,
    position: 'relative',
    overflow: 'hidden',
  },
  fishPreview: { height: 50, justifyContent: 'center', alignItems: 'center' },
  fishHidden: { opacity: 0.4 },
  difficultyRow: { flexDirection: 'row', marginTop: 4, alignItems: 'center', gap: 2 },
  rarityDot: {
    width: 6,
    height: 6,
    marginRight: 2,
  },
  linksRow: { flexDirection: 'row', marginTop: 20 },
});
