import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { PIXEL_COLORS } from '../../../src/theme/colors';
import { PixelText } from '../../../src/components/common/PixelText';
import { PixelCard } from '../../../src/components/common/PixelCard';
import { useRecordStore } from '../../../src/stores/useRecordStore';
import { useFishDexStore } from '../../../src/stores/useFishDexStore';
import { FISH_SPECIES } from '../../../src/data/fish-species';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;

export default function StatsScreen() {
  const { records, getTotalCatches, getBiggestCatch } = useRecordStore();
  const { entries, getTotalDiscovered } = useFishDexStore();

  const totalCatches = getTotalCatches();
  const biggest = getBiggestCatch();
  const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);

  // Fish catch frequency
  const fishCounts: Record<string, number> = {};
  for (const record of records) {
    for (const c of record.catches) {
      fishCounts[c.fishName] = (fishCounts[c.fishName] || 0) + 1;
    }
  }
  const topFish = Object.entries(fishCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxCount = topFish.length > 0 ? topFish[0][1] : 1;

  // Monthly activity
  const monthlyCounts: Record<string, number> = {};
  for (const record of records) {
    const month = record.date.slice(0, 7);
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
  }
  const months = Object.entries(monthlyCounts).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  const maxMonthly = months.length > 0 ? Math.max(...months.map(([, v]) => v)) : 1;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Overview stats */}
      <View style={styles.overviewGrid}>
        <PixelCard style={styles.overviewCard}>
          <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>出钓次数</PixelText>
          <PixelText variant="title" color={PIXEL_COLORS.uiHighlight}>{records.length}</PixelText>
        </PixelCard>
        <PixelCard style={styles.overviewCard}>
          <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>总钓获</PixelText>
          <PixelText variant="title" color={PIXEL_COLORS.uiHighlight}>{totalCatches}</PixelText>
        </PixelCard>
        <PixelCard style={styles.overviewCard}>
          <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>总时长</PixelText>
          <PixelText variant="title" color={PIXEL_COLORS.uiHighlight}>
            {totalDuration >= 60 ? `${Math.round(totalDuration / 60)}h` : `${totalDuration}m`}
          </PixelText>
        </PixelCard>
        <PixelCard style={styles.overviewCard}>
          <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>图鉴进度</PixelText>
          <PixelText variant="title" color={PIXEL_COLORS.uiHighlight}>
            {getTotalDiscovered()}/{FISH_SPECIES.length}
          </PixelText>
        </PixelCard>
      </View>

      {biggest && (
        <PixelCard style={styles.section}>
          <PixelText variant="subtitle" color={PIXEL_COLORS.uiHighlight}>最大钓获</PixelText>
          <PixelText variant="title" style={{ marginTop: 4 }}>
            {biggest.fishName} - {biggest.weight.toFixed(1)}kg
          </PixelText>
        </PixelCard>
      )}

      {/* Top fish chart */}
      {topFish.length > 0 && (
        <PixelCard style={styles.section}>
          <PixelText variant="subtitle" style={{ marginBottom: 12 }}>最常钓获</PixelText>
          {topFish.map(([name, count], i) => (
            <View key={i} style={styles.barRow}>
              <PixelText variant="caption" style={styles.barLabel} numberOfLines={1}>
                {name}
              </PixelText>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${(count / maxCount) * 100}%`,
                      backgroundColor: i === 0 ? PIXEL_COLORS.uiHighlight : PIXEL_COLORS.uiInfo,
                    },
                  ]}
                />
              </View>
              <PixelText variant="caption" color={PIXEL_COLORS.uiHighlight} style={styles.barValue}>
                {count}
              </PixelText>
            </View>
          ))}
        </PixelCard>
      )}

      {/* Monthly activity */}
      {months.length > 0 && (
        <PixelCard style={styles.section}>
          <PixelText variant="subtitle" style={{ marginBottom: 12 }}>月度活跃</PixelText>
          <View style={styles.monthChart}>
            {months.map(([month, count], i) => (
              <View key={i} style={styles.monthBar}>
                <View style={styles.monthBarTrack}>
                  <View
                    style={[
                      styles.monthBarFill,
                      { height: `${(count / maxMonthly) * 100}%` },
                    ]}
                  />
                </View>
                <PixelText variant="caption" style={{ fontSize: 9, marginTop: 4 }}>
                  {month.slice(5)}月
                </PixelText>
                <PixelText variant="caption" color={PIXEL_COLORS.uiHighlight} style={{ fontSize: 9 }}>
                  {count}
                </PixelText>
              </View>
            ))}
          </View>
        </PixelCard>
      )}

      {/* Collection progress */}
      <PixelCard style={styles.section}>
        <PixelText variant="subtitle" style={{ marginBottom: 8 }}>图鉴收集</PixelText>
        <View style={styles.collectionGrid}>
          {FISH_SPECIES.map((fish) => {
            const discovered = !!entries[fish.id]?.discovered;
            return (
              <View
                key={fish.id}
                style={[styles.collectionDot, { backgroundColor: discovered ? PIXEL_COLORS.uiHighlight : PIXEL_COLORS.uiBorder }]}
              />
            );
          })}
        </View>
        <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim} style={{ marginTop: 8, textAlign: 'center' }}>
          已发现 {getTotalDiscovered()} / {FISH_SPECIES.length} 种鱼类
        </PixelText>
      </PixelCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIXEL_COLORS.uiBg },
  content: { padding: 16, paddingBottom: 32 },
  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  overviewCard: { width: (SCREEN_WIDTH - 48) / 2, alignItems: 'center', padding: 12 },
  section: { marginBottom: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barLabel: { width: 60, fontSize: 10 },
  barTrack: {
    flex: 1, height: 14, backgroundColor: PIXEL_COLORS.uiBg,
    borderWidth: 1, borderColor: PIXEL_COLORS.uiBorder, overflow: 'hidden', marginHorizontal: 8,
  },
  barFill: { height: '100%' },
  barValue: { width: 24, textAlign: 'right', fontSize: 11 },
  monthChart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 100 },
  monthBar: { alignItems: 'center', flex: 1 },
  monthBarTrack: {
    width: 20, height: 70, backgroundColor: PIXEL_COLORS.uiBg,
    borderWidth: 1, borderColor: PIXEL_COLORS.uiBorder,
    justifyContent: 'flex-end', overflow: 'hidden',
  },
  monthBarFill: { width: '100%', backgroundColor: PIXEL_COLORS.uiInfo },
  collectionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  collectionDot: { width: 16, height: 16, borderWidth: 1, borderColor: PIXEL_COLORS.uiBorder },
});
