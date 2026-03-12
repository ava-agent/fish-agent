import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { PIXEL_COLORS } from '../../../src/theme/colors';
import { PixelText } from '../../../src/components/common/PixelText';
import { PixelCard } from '../../../src/components/common/PixelCard';
import { useRecordStore } from '../../../src/stores/useRecordStore';
import { useFishDexStore } from '../../../src/stores/useFishDexStore';
import { FISH_SPECIES } from '../../../src/data/fish-species';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  const BAR_COLORS = [
    PIXEL_COLORS.rarityLegendary,
    PIXEL_COLORS.rarityRare,
    PIXEL_COLORS.rarityUncommon,
    PIXEL_COLORS.rarityUncommon,
    PIXEL_COLORS.rarityCommon,
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title */}
      <View style={styles.pageTitle}>
        <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 11, textAlign: 'center' }}>
          {'◆ 冒险者状态 ◆'}
        </PixelText>
      </View>

      {/* Overview stats - RPG status cards */}
      <View style={styles.overviewGrid}>
        <PixelCard variant="dark" style={styles.overviewCard}>
          <View style={styles.statusIcon}>
            <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 14 }}>⚔</PixelText>
          </View>
          <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 9, marginTop: 4 }}>
            出钓次数
          </PixelText>
          <PixelText variant="title" color={PIXEL_COLORS.hudActive}>{records.length}</PixelText>
        </PixelCard>
        <PixelCard variant="dark" style={styles.overviewCard}>
          <View style={styles.statusIcon}>
            <PixelText variant="pixel" color={PIXEL_COLORS.rarityUncommon} style={{ fontSize: 14 }}>◆</PixelText>
          </View>
          <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 9, marginTop: 4 }}>
            总钓获
          </PixelText>
          <PixelText variant="title" color={PIXEL_COLORS.hudActive}>{totalCatches}</PixelText>
        </PixelCard>
        <PixelCard variant="dark" style={styles.overviewCard}>
          <View style={styles.statusIcon}>
            <PixelText variant="pixel" color={PIXEL_COLORS.rarityRare} style={{ fontSize: 14 }}>◈</PixelText>
          </View>
          <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 9, marginTop: 4 }}>
            总时长
          </PixelText>
          <PixelText variant="title" color={PIXEL_COLORS.hudActive}>
            {totalDuration >= 60 ? `${Math.round(totalDuration / 60)}h` : `${totalDuration}m`}
          </PixelText>
        </PixelCard>
        <PixelCard variant="dark" style={styles.overviewCard}>
          <View style={styles.statusIcon}>
            <PixelText variant="pixel" color={PIXEL_COLORS.rarityLegendary} style={{ fontSize: 14 }}>★</PixelText>
          </View>
          <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 9, marginTop: 4 }}>
            图鉴进度
          </PixelText>
          <PixelText variant="title" color={PIXEL_COLORS.hudActive}>
            {getTotalDiscovered()}/{FISH_SPECIES.length}
          </PixelText>
        </PixelCard>
      </View>

      {biggest && (
        <PixelCard variant="highlight" style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 10 }}>
              {'═══ '}★ 最大钓获 ★{' ═══'}
            </PixelText>
          </View>
          <PixelText variant="title" style={{ marginTop: 6, textAlign: 'center' }}>
            {biggest.fishName} - {biggest.weight.toFixed(1)}kg
          </PixelText>
        </PixelCard>
      )}

      {/* Top fish chart - HP/EXP bar style */}
      {topFish.length > 0 && (
        <PixelCard style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 10 }}>
              {'═══ 最常钓获 ═══'}
            </PixelText>
          </View>
          <View style={{ marginTop: 8 }}>
            {topFish.map(([name, count], i) => {
              const barColor = BAR_COLORS[i] || PIXEL_COLORS.rarityCommon;
              return (
                <View key={i} style={styles.barRow}>
                  <PixelText variant="pixel" style={styles.barLabel} numberOfLines={1} color={PIXEL_COLORS.uiText}>
                    {name}
                  </PixelText>
                  <View style={styles.barTrack}>
                    <View style={styles.barTrackInner}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${(count / maxCount) * 100}%`,
                            backgroundColor: barColor,
                          },
                        ]}
                      />
                      <View style={[styles.barFillShine, { width: `${(count / maxCount) * 100}%` }]} />
                    </View>
                  </View>
                  <View style={styles.barValueFrame}>
                    <PixelText variant="pixel" color={barColor} style={{ fontSize: 10 }}>
                      {count}
                    </PixelText>
                  </View>
                </View>
              );
            })}
          </View>
        </PixelCard>
      )}

      {/* Monthly activity - game-styled bars */}
      {months.length > 0 && (
        <PixelCard style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 10 }}>
              {'═══ 月度活跃 ═══'}
            </PixelText>
          </View>
          <View style={styles.monthChart}>
            {months.map(([month, count], i) => (
              <View key={i} style={styles.monthBar}>
                <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 9, marginBottom: 4 }}>
                  {count}
                </PixelText>
                <View style={styles.monthBarTrack}>
                  <View
                    style={[
                      styles.monthBarFill,
                      { height: `${(count / maxMonthly) * 100}%` },
                    ]}
                  >
                    <View style={styles.monthBarShine} />
                  </View>
                </View>
                <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 9, marginTop: 4 }}>
                  {month.slice(5)}月
                </PixelText>
              </View>
            ))}
          </View>
        </PixelCard>
      )}

      {/* Collection progress - achievement dots */}
      <PixelCard style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 10 }}>
            {'═══ 图鉴收集 ═══'}
          </PixelText>
        </View>
        <View style={styles.collectionGrid}>
          {FISH_SPECIES.map((fish) => {
            const discovered = !!entries[fish.id]?.discovered;
            return (
              <View
                key={fish.id}
                style={[
                  styles.collectionDot,
                  {
                    backgroundColor: discovered ? PIXEL_COLORS.hudActive : PIXEL_COLORS.hudBg,
                    borderColor: discovered ? PIXEL_COLORS.hudActive + '88' : PIXEL_COLORS.hudBorder,
                  },
                ]}
              >
                {discovered && <View style={styles.dotShine} />}
              </View>
            );
          })}
        </View>
        <View style={styles.collectionFooter}>
          <View style={styles.collectionSeparator} />
          <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 9, textAlign: 'center', marginTop: 8 }}>
            已发现 {getTotalDiscovered()} / {FISH_SPECIES.length} 种鱼类
          </PixelText>
        </View>
      </PixelCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIXEL_COLORS.uiBg },
  content: { padding: 16, paddingBottom: 32 },
  pageTitle: {
    paddingVertical: 8,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: PIXEL_COLORS.windowOuter,
  },
  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  overviewCard: { width: (SCREEN_WIDTH - 48) / 2, alignItems: 'center', padding: 12 },
  statusIcon: {
    width: 28,
    height: 28,
    backgroundColor: PIXEL_COLORS.windowOuter,
    borderWidth: 1,
    borderColor: PIXEL_COLORS.hudBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: { marginBottom: 12 },
  sectionTitleRow: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  barLabel: { width: 60, fontSize: 9 },
  barTrack: {
    flex: 1,
    height: 18,
    padding: 2,
    backgroundColor: PIXEL_COLORS.windowOuter,
    marginHorizontal: 8,
  },
  barTrackInner: {
    flex: 1,
    height: '100%',
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 1,
    borderColor: PIXEL_COLORS.hudBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  barFillShine: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 4,
    backgroundColor: '#FFFFFF22',
  },
  barValueFrame: {
    width: 30,
    alignItems: 'flex-end',
  },
  monthChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  monthBar: { alignItems: 'center', flex: 1 },
  monthBarTrack: {
    width: 22,
    height: 80,
    padding: 2,
    backgroundColor: PIXEL_COLORS.windowOuter,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  monthBarFill: {
    width: '100%',
    backgroundColor: PIXEL_COLORS.rarityUncommon,
    position: 'relative',
    overflow: 'hidden',
  },
  monthBarShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FFFFFF33',
  },
  collectionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  collectionDot: {
    width: 18,
    height: 18,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  dotShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#FFFFFF33',
  },
  collectionFooter: {
    marginTop: 4,
  },
  collectionSeparator: {
    height: 2,
    backgroundColor: PIXEL_COLORS.windowOuter,
    marginTop: 8,
  },
});
