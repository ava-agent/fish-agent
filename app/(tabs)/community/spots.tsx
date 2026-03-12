import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { PIXEL_COLORS } from '../../../src/theme/colors';
import { PixelText } from '../../../src/components/common/PixelText';
import { PixelCard } from '../../../src/components/common/PixelCard';
import { FISHING_SPOTS } from '../../../src/data/communities';
import { FISH_SPECIES } from '../../../src/data/fish-species';

const DIFFICULTY_COLORS = [
  PIXEL_COLORS.rarityCommon,
  PIXEL_COLORS.rarityCommon,
  PIXEL_COLORS.rarityUncommon,
  PIXEL_COLORS.rarityRare,
  PIXEL_COLORS.rarityLegendary,
];

export default function SpotsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PixelCard variant="highlight" style={styles.headerCard}>
        <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ textAlign: 'center' }}>
          {'◆ 钓点地图 ◆'}
        </PixelText>
        <View style={styles.headerSeparator} />
        <PixelText variant="body" style={{ marginTop: 8 }}>
          这里收集了各类钓鱼场所的介绍和实用建议，帮你找到理想钓点！
        </PixelText>
      </PixelCard>

      {FISHING_SPOTS.map((spot) => {
        const fishNames = spot.fishTypes
          .map((id) => FISH_SPECIES.find((f) => f.id === id)?.nameCn)
          .filter(Boolean);
        const diffColor = DIFFICULTY_COLORS[Math.min(spot.difficulty, 4)] || PIXEL_COLORS.rarityCommon;

        return (
          <PixelCard key={spot.id} style={styles.spotCard}>
            {/* Title bar */}
            <View style={styles.titleBar}>
              <View style={styles.titleBarLeft}>
                <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 10 }}>
                  {'▣ '}
                </PixelText>
                <PixelText variant="subtitle">{spot.name}</PixelText>
              </View>
              <View style={styles.diffBadge}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <PixelText
                    key={i}
                    variant="caption"
                    color={i < spot.difficulty ? diffColor : PIXEL_COLORS.hudInactive}
                    style={{ fontSize: 14, letterSpacing: 0 }}
                  >
                    ★
                  </PixelText>
                ))}
              </View>
            </View>

            {/* Location tag */}
            <View style={styles.locationRow}>
              <PixelText variant="pixel" color={PIXEL_COLORS.rarityUncommon} style={{ fontSize: 10 }}>
                {'◇ '}
              </PixelText>
              <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>
                {spot.location}
              </PixelText>
            </View>

            <PixelText variant="body" style={{ marginTop: 8 }}>
              {spot.description}
            </PixelText>

            {/* Fish types - inventory style */}
            <View style={styles.fishSection}>
              <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 10, marginBottom: 6 }}>
                {'═══ 常见鱼种 ═══'}
              </PixelText>
              <View style={styles.tagRow}>
                {fishNames.map((name, i) => (
                  <View key={i} style={styles.fishTag}>
                    <PixelText variant="caption" color={PIXEL_COLORS.rarityUncommon} style={{ fontSize: 10 }}>
                      {'◆ '}{name}
                    </PixelText>
                  </View>
                ))}
              </View>
            </View>

            {/* Tips - quest hints style */}
            <View style={styles.tipsContainer}>
              <View style={styles.tipsHeader}>
                <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 10 }}>
                  {'═══ 探索提示 ═══'}
                </PixelText>
              </View>
              {spot.tips.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <PixelText variant="caption" color={PIXEL_COLORS.hudActive} style={{ fontSize: 11 }}>
                    {'>'}
                  </PixelText>
                  <PixelText variant="caption" style={{ flex: 1, marginLeft: 8 }}>
                    {tip}
                  </PixelText>
                </View>
              ))}
            </View>
          </PixelCard>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIXEL_COLORS.uiBg },
  content: { padding: 16, paddingBottom: 32 },
  headerCard: { marginBottom: 16 },
  headerSeparator: {
    height: 2,
    backgroundColor: PIXEL_COLORS.hudActive + '44',
    marginHorizontal: 20,
    marginTop: 4,
  },
  spotCard: { marginBottom: 16 },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: PIXEL_COLORS.windowOuter,
    marginBottom: 6,
  },
  titleBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  diffBadge: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 1,
    borderColor: PIXEL_COLORS.hudBorder,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fishSection: {
    marginTop: 12,
    padding: 8,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 1,
    borderColor: PIXEL_COLORS.hudBorder,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  fishTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: PIXEL_COLORS.windowOuter,
    borderWidth: 1,
    borderColor: PIXEL_COLORS.rarityUncommon + '44',
  },
  tipsContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.windowOuter,
  },
  tipsHeader: {
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: PIXEL_COLORS.hudBorder + '66',
  },
  tipRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingLeft: 4,
  },
});
