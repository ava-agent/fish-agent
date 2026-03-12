import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PIXEL_COLORS } from '../../../src/theme/colors';
import { PixelText } from '../../../src/components/common/PixelText';
import { PixelCard } from '../../../src/components/common/PixelCard';
import { PixelButton } from '../../../src/components/common/PixelButton';
import { useRecordStore } from '../../../src/stores/useRecordStore';

const WEATHER_ICONS: Record<string, string> = {
  sunny: 'weather-sunny',
  cloudy: 'weather-cloudy',
  rainy: 'weather-rainy',
  windy: 'weather-windy',
};

const WEATHER_LABELS: Record<string, string> = {
  sunny: '晴天',
  cloudy: '多云',
  rainy: '雨天',
  windy: '大风',
};

const WEATHER_COLORS: Record<string, string> = {
  sunny: PIXEL_COLORS.rarityLegendary,
  cloudy: PIXEL_COLORS.rarityCommon,
  rainy: PIXEL_COLORS.rarityUncommon,
  windy: PIXEL_COLORS.rarityRare,
};

export default function RecordsScreen() {
  const { records, deleteRecord, getTotalCatches, getBiggestCatch } = useRecordStore();
  const totalCatches = getTotalCatches();
  const biggest = getBiggestCatch();

  return (
    <View style={styles.container}>
      {/* RPG-style stats row */}
      <View style={styles.statsRow}>
        <PixelCard variant="dark" style={styles.statCard}>
          <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 9, marginBottom: 2 }}>
            出钓
          </PixelText>
          <PixelText variant="title" color={PIXEL_COLORS.hudActive}>{records.length}</PixelText>
        </PixelCard>
        <PixelCard variant="dark" style={styles.statCard}>
          <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 9, marginBottom: 2 }}>
            钓获
          </PixelText>
          <PixelText variant="title" color={PIXEL_COLORS.hudActive}>{totalCatches}</PixelText>
        </PixelCard>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push('/records/stats' as any)}>
          <PixelCard variant="highlight" style={styles.statCard}>
            <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 9, marginBottom: 2 }}>
              统计
            </PixelText>
            <MaterialCommunityIcons name="chart-bar" size={24} color={PIXEL_COLORS.hudActive} />
          </PixelCard>
        </TouchableOpacity>
      </View>

      {biggest && (
        <PixelCard variant="highlight" style={styles.biggestCard}>
          <View style={styles.biggestInner}>
            <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 9 }}>
              {'★ '}最大钓获{'★'}
            </PixelText>
            <PixelText variant="subtitle" color={PIXEL_COLORS.hudActive} style={{ marginTop: 2 }}>
              {biggest.fishName} - {biggest.weight.toFixed(1)}kg
            </PixelText>
          </View>
        </PixelCard>
      )}

      {/* Records list */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {records.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyFrame}>
              <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 10, marginBottom: 8 }}>
                {'═══ 冒险日志 ═══'}
              </PixelText>
              <MaterialCommunityIcons name="notebook-outline" size={48} color={PIXEL_COLORS.hudInactive} />
              <View style={styles.emptySeparator} />
              <PixelText variant="body" color={PIXEL_COLORS.uiTextDim} style={{ textAlign: 'center' }}>
                日志为空...
              </PixelText>
              <PixelText variant="caption" color={PIXEL_COLORS.hudInactive} style={{ textAlign: 'center', marginTop: 4 }}>
                {'> '}去钓一场鱼，记录你的冒险吧！
              </PixelText>
            </View>
          </View>
        ) : (
          records.map((record) => {
            const weatherColor = WEATHER_COLORS[record.weather] || PIXEL_COLORS.uiTextDim;

            return (
              <PixelCard key={record.id} style={styles.recordCard}>
                {/* Journal entry header */}
                <View style={styles.recordHeader}>
                  <View style={{ flex: 1 }}>
                    <PixelText variant="subtitle">{record.location}</PixelText>
                    <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 9, marginTop: 2 }}>
                      {new Date(record.date).toLocaleDateString('zh-CN')}
                    </PixelText>
                  </View>
                  <View style={[styles.weatherBadge, { borderColor: weatherColor + '66' }]}>
                    <MaterialCommunityIcons
                      name={WEATHER_ICONS[record.weather] as any}
                      size={16}
                      color={weatherColor}
                    />
                    <PixelText variant="caption" color={weatherColor} style={{ marginLeft: 4, fontSize: 10 }}>
                      {WEATHER_LABELS[record.weather]}
                    </PixelText>
                  </View>
                </View>

                <View style={styles.recordSeparator} />

                {/* Stats row - RPG style */}
                <View style={styles.recordStats}>
                  <View style={styles.recordStat}>
                    <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 9 }}>时长</PixelText>
                    <PixelText variant="pixel" color={PIXEL_COLORS.uiText} style={{ fontSize: 11 }}>
                      {record.duration}分钟
                    </PixelText>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.recordStat}>
                    <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 9 }}>钓获</PixelText>
                    <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 11 }}>
                      {record.catches.length}条
                    </PixelText>
                  </View>
                </View>

                {record.catches.length > 0 && (
                  <View style={styles.catchList}>
                    {record.catches.slice(0, 3).map((c, i) => (
                      <PixelText key={i} variant="caption" color={PIXEL_COLORS.rarityUncommon} style={{ fontSize: 10 }}>
                        {'◆ '}{c.fishName} {c.weight.toFixed(1)}kg
                      </PixelText>
                    ))}
                    {record.catches.length > 3 && (
                      <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>
                        ...还有{record.catches.length - 3}条
                      </PixelText>
                    )}
                  </View>
                )}

                {record.notes && (
                  <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim} numberOfLines={2} style={{ marginTop: 6, fontStyle: 'italic' }}>
                    {'> '}{record.notes}
                  </PixelText>
                )}

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteRecord(record.id)}
                >
                  <PixelText variant="pixel" color={PIXEL_COLORS.uiDanger} style={{ fontSize: 9 }}>
                    {'✕ '}删除
                  </PixelText>
                </TouchableOpacity>
              </PixelCard>
            );
          })
        )}
      </ScrollView>

      {/* Pixel-art FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/records/new' as any)}
        activeOpacity={0.7}
      >
        <View style={styles.fabOuter}>
          <View style={styles.fabInner}>
            <View style={styles.fabShine} />
            <PixelText variant="title" color={PIXEL_COLORS.windowOuter} style={{ fontSize: 24, lineHeight: 28 }}>
              +
            </PixelText>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIXEL_COLORS.uiBg, padding: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: { flex: 1, alignItems: 'center', padding: 10 },
  biggestCard: { marginBottom: 12 },
  biggestInner: { alignItems: 'center' },
  list: { flex: 1 },
  listContent: { paddingBottom: 80 },
  emptyState: { alignItems: 'center', paddingTop: 50 },
  emptyFrame: {
    alignItems: 'center',
    padding: 24,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.windowOuter,
    backgroundColor: PIXEL_COLORS.hudBg,
    width: '80%',
  },
  emptySeparator: {
    height: 2,
    width: '60%',
    backgroundColor: PIXEL_COLORS.hudBorder + '44',
    marginVertical: 12,
  },
  recordCard: { marginBottom: 12 },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.hudBorder,
  },
  recordSeparator: {
    height: 2,
    backgroundColor: PIXEL_COLORS.windowOuter,
    marginVertical: 8,
  },
  recordStats: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: PIXEL_COLORS.hudBg,
    padding: 8,
    borderWidth: 1,
    borderColor: PIXEL_COLORS.hudBorder,
  },
  recordStat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 2,
    backgroundColor: PIXEL_COLORS.hudBorder,
  },
  catchList: {
    marginTop: 8,
    paddingTop: 8,
    paddingLeft: 4,
    borderTopWidth: 1,
    borderTopColor: PIXEL_COLORS.windowOuter,
  },
  deleteBtn: {
    position: 'absolute',
    top: 14,
    right: 4,
    padding: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fabOuter: {
    padding: 3,
    backgroundColor: PIXEL_COLORS.windowOuter,
  },
  fabInner: {
    width: 50,
    height: 50,
    backgroundColor: PIXEL_COLORS.hudActive,
    borderWidth: 2,
    borderColor: '#B8960A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  fabShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FFE85A',
  },
});
