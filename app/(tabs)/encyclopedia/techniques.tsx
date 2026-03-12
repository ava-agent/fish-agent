import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { PIXEL_COLORS } from '../../../src/theme/colors';
import { PixelText } from '../../../src/components/common/PixelText';
import { PixelCard } from '../../../src/components/common/PixelCard';
import { TECHNIQUES } from '../../../src/data/techniques';
import { FISH_SPECIES } from '../../../src/data/fish-species';

const DIFFICULTY_COLORS = [
  PIXEL_COLORS.rarityCommon,
  PIXEL_COLORS.rarityCommon,
  PIXEL_COLORS.rarityUncommon,
  PIXEL_COLORS.rarityRare,
  PIXEL_COLORS.rarityRare,
  PIXEL_COLORS.rarityLegendary,
];

export default function TechniquesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PixelCard variant="dark" style={styles.introCard}>
        <PixelText variant="body" color={PIXEL_COLORS.hudActive} style={{ textAlign: 'center' }}>
          ⚔ 掌握不同的钓法技巧，提高你的钓鱼水平！
        </PixelText>
      </PixelCard>

      {TECHNIQUES.map((tech) => {
        const suitableFishNames = tech.suitableFish
          .map((id) => FISH_SPECIES.find((f) => f.id === id)?.nameCn)
          .filter(Boolean);

        const diffColor = DIFFICULTY_COLORS[tech.difficulty] || PIXEL_COLORS.rarityCommon;

        return (
          <View key={tech.id} style={[styles.skillCardOuter, { borderColor: diffColor }]}>
            <View style={[styles.skillCardBorder, { borderColor: diffColor + '44' }]}>
              <View style={styles.skillCardFill}>
                {/* Skill header */}
                <View style={styles.techHeader}>
                  <View style={{ flex: 1 }}>
                    <PixelText variant="subtitle" color={PIXEL_COLORS.uiText}>
                      {tech.nameCn}
                    </PixelText>
                    <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>
                      {tech.name}
                    </PixelText>
                  </View>
                  <View style={[styles.diffBadge, { borderColor: diffColor }]}>
                    <PixelText variant="caption" color={diffColor} style={{ fontSize: 10 }}>
                      LV{tech.difficulty}
                    </PixelText>
                    <PixelText variant="caption" color={diffColor} style={{ fontSize: 9 }}>
                      {'★'.repeat(tech.difficulty)}
                    </PixelText>
                  </View>
                </View>

                <PixelText variant="body" style={{ marginTop: 8 }}>{tech.description}</PixelText>

                {/* Steps - quest style */}
                <View style={styles.stepsContainer}>
                  <PixelText variant="caption" color={PIXEL_COLORS.hudActive} style={{ marginBottom: 6, textAlign: 'center' }}>
                    --- 操作步骤 ---
                  </PixelText>
                  {tech.steps.map((step, i) => (
                    <View key={i} style={styles.stepRow}>
                      <View style={styles.stepBadge}>
                        <PixelText variant="caption" color={PIXEL_COLORS.hudActive} style={styles.stepBadgeText}>
                          {i + 1}
                        </PixelText>
                      </View>
                      <View style={styles.stepContent}>
                        <PixelText variant="caption" color={PIXEL_COLORS.hudActive} style={{ fontSize: 9, marginBottom: 1 }}>
                          [步骤 {i + 1}]
                        </PixelText>
                        <PixelText variant="caption" color={PIXEL_COLORS.uiText} style={{ flex: 1 }}>
                          {step}
                        </PixelText>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Suitable fish - game item badges */}
                <View style={styles.fishTags}>
                  <PixelText variant="caption" color={PIXEL_COLORS.hudActive} style={{ marginBottom: 6, textAlign: 'center' }}>
                    --- 适合鱼种 ---
                  </PixelText>
                  <View style={styles.tagRow}>
                    {suitableFishNames.map((name, i) => (
                      <View key={i} style={styles.tag}>
                        <View style={styles.tagInner}>
                          <PixelText variant="caption" color={PIXEL_COLORS.uiText} style={{ fontSize: 10 }}>
                            🐟 {name}
                          </PixelText>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIXEL_COLORS.hudBg },
  content: { padding: 16, paddingBottom: 32 },
  introCard: { marginBottom: 16 },
  skillCardOuter: {
    borderWidth: 3,
    borderColor: PIXEL_COLORS.windowOuter,
    marginBottom: 16,
  },
  skillCardBorder: {
    borderWidth: 2,
    borderColor: PIXEL_COLORS.windowInner + '55',
  },
  skillCardFill: {
    padding: 12,
    backgroundColor: PIXEL_COLORS.windowFill,
    position: 'relative',
    overflow: 'hidden',
  },
  techHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.hudBorder,
    alignItems: 'center',
  },
  stepsContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.windowOuter,
  },
  stepRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: PIXEL_COLORS.hudActive,
    backgroundColor: PIXEL_COLORS.hudGlow,
    marginRight: 8,
    marginTop: 2,
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: PIXEL_COLORS.windowOuter + '44',
  },
  fishTags: { marginTop: 10 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    borderWidth: 2,
    borderColor: PIXEL_COLORS.windowOuter,
    backgroundColor: PIXEL_COLORS.hudBg,
  },
  tagInner: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: PIXEL_COLORS.hudBorder,
  },
});
