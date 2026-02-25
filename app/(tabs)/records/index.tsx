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

export default function RecordsScreen() {
  const { records, deleteRecord, getTotalCatches, getBiggestCatch } = useRecordStore();
  const totalCatches = getTotalCatches();
  const biggest = getBiggestCatch();

  return (
    <View style={styles.container}>
      {/* Stats summary */}
      <View style={styles.statsRow}>
        <PixelCard style={styles.statCard}>
          <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>出钓次数</PixelText>
          <PixelText variant="title" color={PIXEL_COLORS.uiHighlight}>{records.length}</PixelText>
        </PixelCard>
        <PixelCard style={styles.statCard}>
          <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>总钓获</PixelText>
          <PixelText variant="title" color={PIXEL_COLORS.uiHighlight}>{totalCatches}</PixelText>
        </PixelCard>
        <TouchableOpacity onPress={() => router.push('/records/stats' as any)}>
          <PixelCard style={styles.statCard}>
            <PixelText variant="caption" color={PIXEL_COLORS.uiInfo}>更多统计</PixelText>
            <MaterialCommunityIcons name="chart-bar" size={24} color={PIXEL_COLORS.uiInfo} />
          </PixelCard>
        </TouchableOpacity>
      </View>

      {biggest && (
        <PixelCard style={styles.biggestCard}>
          <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>最大钓获</PixelText>
          <PixelText variant="subtitle" color={PIXEL_COLORS.uiHighlight}>
            {biggest.fishName} - {biggest.weight.toFixed(1)}kg
          </PixelText>
        </PixelCard>
      )}

      {/* Records list */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {records.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="notebook-outline" size={48} color={PIXEL_COLORS.uiBorder} />
            <PixelText variant="body" color={PIXEL_COLORS.uiTextDim} style={{ marginTop: 12, textAlign: 'center' }}>
              还没有钓鱼记录{'\n'}去钓一场鱼，然后记录下来吧！
            </PixelText>
          </View>
        ) : (
          records.map((record) => (
            <PixelCard key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <View>
                  <PixelText variant="subtitle">{record.location}</PixelText>
                  <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>
                    {new Date(record.date).toLocaleDateString('zh-CN')}
                  </PixelText>
                </View>
                <View style={styles.weatherBadge}>
                  <MaterialCommunityIcons
                    name={WEATHER_ICONS[record.weather] as any}
                    size={18}
                    color={PIXEL_COLORS.uiHighlight}
                  />
                  <PixelText variant="caption" style={{ marginLeft: 4, fontSize: 10 }}>
                    {WEATHER_LABELS[record.weather]}
                  </PixelText>
                </View>
              </View>

              <View style={styles.recordStats}>
                <View style={styles.recordStat}>
                  <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>时长</PixelText>
                  <PixelText variant="pixel">{record.duration}分钟</PixelText>
                </View>
                <View style={styles.recordStat}>
                  <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>钓获</PixelText>
                  <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight}>{record.catches.length}条</PixelText>
                </View>
              </View>

              {record.catches.length > 0 && (
                <View style={styles.catchList}>
                  {record.catches.slice(0, 3).map((c, i) => (
                    <PixelText key={i} variant="caption" color={PIXEL_COLORS.uiTextDim}>
                      {c.fishName} {c.weight.toFixed(1)}kg
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
                <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim} numberOfLines={2} style={{ marginTop: 6 }}>
                  {record.notes}
                </PixelText>
              )}

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteRecord(record.id)}
              >
                <PixelText variant="caption" color={PIXEL_COLORS.uiDanger}>删除</PixelText>
              </TouchableOpacity>
            </PixelCard>
          ))
        )}
      </ScrollView>

      {/* Add button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/records/new' as any)}
      >
        <MaterialCommunityIcons name="plus" size={28} color={PIXEL_COLORS.uiBg} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIXEL_COLORS.uiBg, padding: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: { flex: 1, alignItems: 'center', padding: 8 },
  biggestCard: { marginBottom: 12, alignItems: 'center' },
  list: { flex: 1 },
  listContent: { paddingBottom: 80 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  recordCard: { marginBottom: 12 },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  weatherBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, backgroundColor: PIXEL_COLORS.uiBg, borderWidth: 1, borderColor: PIXEL_COLORS.uiBorder },
  recordStats: { flexDirection: 'row', gap: 20, marginTop: 8 },
  recordStat: {},
  catchList: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: PIXEL_COLORS.uiBorder + '44' },
  deleteBtn: { position: 'absolute', top: 12, right: 0, padding: 4 },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 56, height: 56, borderRadius: 0,
    backgroundColor: PIXEL_COLORS.uiHighlight,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: PIXEL_COLORS.uiBorder,
    boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.5)',
    elevation: 5,
  },
});
