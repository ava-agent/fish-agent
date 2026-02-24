import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { PIXEL_COLORS } from '../../../src/theme/colors';
import { PixelText } from '../../../src/components/common/PixelText';
import { PixelCard } from '../../../src/components/common/PixelCard';
import { TECHNIQUES } from '../../../src/data/techniques';
import { FISH_SPECIES } from '../../../src/data/fish-species';

export default function TechniquesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PixelText variant="body" style={{ marginBottom: 16 }}>
        掌握不同的钓法技巧，提高你的钓鱼水平！
      </PixelText>

      {TECHNIQUES.map((tech) => {
        const suitableFishNames = tech.suitableFish
          .map((id) => FISH_SPECIES.find((f) => f.id === id)?.nameCn)
          .filter(Boolean);

        return (
          <PixelCard key={tech.id} style={styles.techCard}>
            <View style={styles.techHeader}>
              <PixelText variant="subtitle">{tech.nameCn}</PixelText>
              <View style={styles.diffBadge}>
                <PixelText variant="caption" color={PIXEL_COLORS.uiHighlight}>
                  {'★'.repeat(tech.difficulty)}
                </PixelText>
              </View>
            </View>
            <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>{tech.name}</PixelText>

            <PixelText variant="body" style={{ marginTop: 8 }}>{tech.description}</PixelText>

            <View style={styles.stepsContainer}>
              <PixelText variant="caption" color={PIXEL_COLORS.uiInfo} style={{ marginBottom: 4 }}>
                操作步骤:
              </PixelText>
              {tech.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <PixelText variant="caption" color={PIXEL_COLORS.uiHighlight}>
                    {i + 1}.
                  </PixelText>
                  <PixelText variant="caption" style={{ flex: 1, marginLeft: 6 }}>
                    {step}
                  </PixelText>
                </View>
              ))}
            </View>

            <View style={styles.fishTags}>
              <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>
                适合鱼种:
              </PixelText>
              <View style={styles.tagRow}>
                {suitableFishNames.map((name, i) => (
                  <View key={i} style={styles.tag}>
                    <PixelText variant="caption" style={{ fontSize: 10 }}>{name}</PixelText>
                  </View>
                ))}
              </View>
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
  techCard: { marginBottom: 16 },
  techHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diffBadge: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: PIXEL_COLORS.uiBg, borderWidth: 1, borderColor: PIXEL_COLORS.uiBorder },
  stepsContainer: { marginTop: 12, padding: 8, backgroundColor: PIXEL_COLORS.uiBg, borderWidth: 1, borderColor: PIXEL_COLORS.uiBorder },
  stepRow: { flexDirection: 'row', paddingVertical: 3 },
  fishTags: { marginTop: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: PIXEL_COLORS.waterDeep + '44', borderWidth: 1, borderColor: PIXEL_COLORS.uiBorder },
});
