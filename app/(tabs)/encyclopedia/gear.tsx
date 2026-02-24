import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { PIXEL_COLORS } from '../../../src/theme/colors';
import { PixelText } from '../../../src/components/common/PixelText';
import { PixelCard } from '../../../src/components/common/PixelCard';
import { GEAR_CATALOG } from '../../../src/data/gear-catalog';

const GEAR_TYPES = [
  { key: 'all', label: '全部' },
  { key: 'rod', label: '鱼竿' },
  { key: 'line', label: '鱼线' },
  { key: 'hook', label: '鱼钩' },
];

export default function GearScreen() {
  const [filter, setFilter] = useState('all');

  const filtered = GEAR_CATALOG.filter((g) => filter === 'all' || g.type === filter);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.filterRow}>
        {GEAR_TYPES.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setFilter(t.key)}
            style={[styles.filterBtn, filter === t.key && styles.filterActive]}
          >
            <PixelText variant="caption" color={filter === t.key ? PIXEL_COLORS.uiHighlight : PIXEL_COLORS.uiTextDim}>
              {t.label}
            </PixelText>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.map((gear) => (
        <PixelCard key={gear.id} style={styles.gearCard}>
          <View style={styles.gearHeader}>
            <PixelText variant="subtitle">{gear.nameCn}</PixelText>
            <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>{gear.name}</PixelText>
          </View>
          <PixelText variant="body" style={{ marginTop: 6 }}>{gear.description}</PixelText>
          <View style={styles.statsGrid}>
            {Object.entries(gear.stats).map(([key, value]) => {
              const labels: Record<string, string> = {
                length: '长度(m)', power: '力量', sensitivity: '灵敏度',
                diameter: '线径(mm)', strength: '拉力', size: '号数', sharpness: '锋利度',
              };
              return (
                <View key={key} style={styles.statItem}>
                  <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>{labels[key] || key}</PixelText>
                  <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight}>{value}</PixelText>
                </View>
              );
            })}
          </View>
        </PixelCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIXEL_COLORS.uiBg },
  content: { padding: 16, paddingBottom: 32 },
  filterRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 2, borderColor: PIXEL_COLORS.uiBorder },
  filterActive: { borderColor: PIXEL_COLORS.uiHighlight, backgroundColor: PIXEL_COLORS.uiHighlight + '20' },
  gearCard: { marginBottom: 12 },
  gearHeader: {},
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 12 },
  statItem: { alignItems: 'center', minWidth: 60 },
});
