import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { PIXEL_COLORS } from '../../../src/theme/colors';
import { PixelText } from '../../../src/components/common/PixelText';
import { PixelCard } from '../../../src/components/common/PixelCard';
import { FISHING_SPOTS } from '../../../src/data/communities';
import { FISH_SPECIES } from '../../../src/data/fish-species';

export default function SpotsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PixelText variant="body" style={{ marginBottom: 16 }}>
        这里收集了各类钓鱼场所的介绍和实用建议，帮你找到理想钓点！
      </PixelText>

      {FISHING_SPOTS.map((spot) => {
        const fishNames = spot.fishTypes
          .map((id) => FISH_SPECIES.find((f) => f.id === id)?.nameCn)
          .filter(Boolean);

        return (
          <PixelCard key={spot.id} style={styles.spotCard}>
            <View style={styles.spotHeader}>
              <PixelText variant="subtitle">{spot.name}</PixelText>
              <View style={styles.diffBadge}>
                <PixelText variant="caption" color={PIXEL_COLORS.uiHighlight}>
                  {'★'.repeat(spot.difficulty)}
                </PixelText>
              </View>
            </View>

            <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>
              {spot.location}
            </PixelText>

            <PixelText variant="body" style={{ marginTop: 8 }}>
              {spot.description}
            </PixelText>

            {/* Fish types */}
            <View style={styles.fishRow}>
              <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>常见鱼种:</PixelText>
              <View style={styles.tagRow}>
                {fishNames.map((name, i) => (
                  <View key={i} style={styles.tag}>
                    <PixelText variant="caption" style={{ fontSize: 10 }}>{name}</PixelText>
                  </View>
                ))}
              </View>
            </View>

            {/* Tips */}
            <View style={styles.tipsContainer}>
              <PixelText variant="caption" color={PIXEL_COLORS.uiInfo} style={{ marginBottom: 4 }}>
                实用建议:
              </PixelText>
              {spot.tips.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <PixelText variant="caption" color={PIXEL_COLORS.uiHighlight}>{'>'}</PixelText>
                  <PixelText variant="caption" style={{ flex: 1, marginLeft: 6 }}>{tip}</PixelText>
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
  spotCard: { marginBottom: 16 },
  spotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diffBadge: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: PIXEL_COLORS.uiBg, borderWidth: 1, borderColor: PIXEL_COLORS.uiBorder },
  fishRow: { marginTop: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: PIXEL_COLORS.waterDeep + '44', borderWidth: 1, borderColor: PIXEL_COLORS.uiBorder },
  tipsContainer: { marginTop: 10, padding: 8, backgroundColor: PIXEL_COLORS.uiBg, borderWidth: 1, borderColor: PIXEL_COLORS.uiBorder },
  tipRow: { flexDirection: 'row', paddingVertical: 2 },
});
