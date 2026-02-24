import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { PIXEL_COLORS } from '../../../src/theme/colors';
import { PixelText } from '../../../src/components/common/PixelText';
import { PixelCard } from '../../../src/components/common/PixelCard';
import { PixelButton } from '../../../src/components/common/PixelButton';
import { FISH_SPECIES } from '../../../src/data/fish-species';
import { useFishDexStore } from '../../../src/stores/useFishDexStore';
import { FishCategory } from '../../../src/game/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

function PixelSprite({ data, colors, pixelSize = 4 }: { data: number[][]; colors: string[]; pixelSize?: number }) {
  return (
    <View>
      {data.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((colorIdx, c) => (
            <View
              key={c}
              style={{
                width: pixelSize,
                height: pixelSize,
                backgroundColor: colorIdx > 0 ? colors[colorIdx] : 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const CATEGORIES: { key: FishCategory | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'freshwater', label: '淡水' },
  { key: 'pond', label: '池塘' },
];

export default function EncyclopediaScreen() {
  const [category, setCategory] = useState<FishCategory | 'all'>('all');
  const { isDiscovered, getEntry, getTotalDiscovered } = useFishDexStore();

  const filteredFish = FISH_SPECIES.filter(
    (f) => category === 'all' || f.category === category
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Stats */}
      <PixelCard style={styles.statsCard}>
        <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight}>
          图鉴进度: {getTotalDiscovered()} / {FISH_SPECIES.length}
        </PixelText>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(getTotalDiscovered() / FISH_SPECIES.length) * 100}%` },
            ]}
          />
        </View>
      </PixelCard>

      {/* Category filter */}
      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => setCategory(cat.key)}
            style={[styles.categoryBtn, category === cat.key && styles.categoryActive]}
          >
            <PixelText
              variant="caption"
              color={category === cat.key ? PIXEL_COLORS.uiHighlight : PIXEL_COLORS.uiTextDim}
            >
              {cat.label}
            </PixelText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fish grid */}
      <View style={styles.grid}>
        {filteredFish.map((fish) => {
          const discovered = isDiscovered(fish.id);
          const entry = getEntry(fish.id);
          return (
            <TouchableOpacity
              key={fish.id}
              onPress={() => router.push(`/encyclopedia/${fish.id}` as any)}
              style={styles.fishCard}
            >
              <PixelCard style={styles.fishCardInner}>
                <View style={[styles.fishPreview, !discovered && styles.fishHidden]}>
                  <PixelSprite
                    data={fish.pixelArt}
                    colors={discovered ? fish.pixelColors : fish.pixelColors.map(() => '#444444')}
                    pixelSize={4}
                  />
                </View>
                <PixelText variant="caption" numberOfLines={1} style={{ marginTop: 6 }}>
                  {discovered ? fish.nameCn : '???'}
                </PixelText>
                {discovered && (
                  <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 9 }}>
                    x{entry?.caughtCount ?? 0}
                  </PixelText>
                )}
                <View style={styles.difficultyRow}>
                  {Array.from({ length: fish.difficulty }, (_, i) => (
                    <PixelText key={i} variant="caption" color={PIXEL_COLORS.uiHighlight} style={{ fontSize: 8 }}>
                      ★
                    </PixelText>
                  ))}
                </View>
              </PixelCard>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick links */}
      <View style={styles.linksRow}>
        <PixelButton
          title="钓具大全"
          onPress={() => router.push('/encyclopedia/gear' as any)}
          variant="secondary"
          size="small"
          style={{ flex: 1, marginRight: 8 }}
        />
        <PixelButton
          title="钓法教程"
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
  container: { flex: 1, backgroundColor: PIXEL_COLORS.uiBg },
  content: { padding: 16, paddingBottom: 32 },
  statsCard: { marginBottom: 12, alignItems: 'center' },
  progressBar: {
    width: '100%', height: 10, backgroundColor: PIXEL_COLORS.uiBg,
    borderWidth: 2, borderColor: PIXEL_COLORS.uiBorder, marginTop: 8, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: PIXEL_COLORS.uiHighlight },
  categoryRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  categoryBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 2, borderColor: PIXEL_COLORS.uiBorder,
  },
  categoryActive: { borderColor: PIXEL_COLORS.uiHighlight, backgroundColor: PIXEL_COLORS.uiHighlight + '20' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  fishCard: { width: CARD_WIDTH },
  fishCardInner: { alignItems: 'center', padding: 8 },
  fishPreview: { height: 50, justifyContent: 'center', alignItems: 'center' },
  fishHidden: { opacity: 0.4 },
  difficultyRow: { flexDirection: 'row', marginTop: 2 },
  linksRow: { flexDirection: 'row', marginTop: 20 },
});
