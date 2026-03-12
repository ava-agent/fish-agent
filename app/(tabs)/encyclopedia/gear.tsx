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

const TYPE_BORDER_COLORS: Record<string, string> = {
  rod: PIXEL_COLORS.rarityUncommon,
  line: PIXEL_COLORS.envGrassLight,
  hook: PIXEL_COLORS.fishOrange,
};

const TYPE_ICONS: Record<string, string> = {
  rod: '🎣',
  line: '〰',
  hook: '🪝',
};

const STAT_LABELS: Record<string, string> = {
  length: 'LEN 长度',
  power: 'PWR 力量',
  sensitivity: 'SNS 灵敏',
  diameter: 'DIA 线径',
  strength: 'STR 拉力',
  size: 'SIZ 号数',
  sharpness: 'SHP 锋利',
};

function getStatMaxValue(key: string): number {
  switch (key) {
    case 'length': return 6;
    case 'power': return 10;
    case 'sensitivity': return 10;
    case 'diameter': return 0.5;
    case 'strength': return 10;
    case 'size': return 12;
    case 'sharpness': return 10;
    default: return 10;
  }
}

function getStatBarColor(key: string): string {
  switch (key) {
    case 'power':
    case 'strength':
      return PIXEL_COLORS.uiDanger;
    case 'sensitivity':
    case 'sharpness':
      return PIXEL_COLORS.hudActive;
    case 'length':
    case 'size':
    case 'diameter':
      return PIXEL_COLORS.uiInfo;
    default:
      return PIXEL_COLORS.uiSuccess;
  }
}

export default function GearScreen() {
  const [filter, setFilter] = useState('all');

  const filtered = GEAR_CATALOG.filter((g) => filter === 'all' || g.type === filter);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Filter tabs - game menu style */}
      <View style={styles.filterRow}>
        {GEAR_TYPES.map((t) => {
          const active = filter === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setFilter(t.key)}
              style={[styles.filterBtn, active && styles.filterActive]}
            >
              <PixelText
                variant="caption"
                color={active ? PIXEL_COLORS.hudActive : PIXEL_COLORS.hudInactive}
              >
                [{t.label}]
              </PixelText>
            </TouchableOpacity>
          );
        })}
      </View>

      {filtered.map((gear) => {
        const typeBorder = TYPE_BORDER_COLORS[gear.type] || PIXEL_COLORS.hudBorder;
        const typeIcon = TYPE_ICONS[gear.type] || '';
        return (
          <View key={gear.id} style={[styles.gearCardOuter, { borderColor: typeBorder }]}>
            <View style={[styles.gearCardBorder, { borderColor: typeBorder + '44' }]}>
              <View style={styles.gearCardFill}>
                {/* Type indicator bar */}
                <View style={[styles.typeBar, { backgroundColor: typeBorder }]} />

                <View style={styles.gearHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {typeIcon ? (
                      <PixelText variant="caption" style={{ fontSize: 14 }}>{typeIcon}</PixelText>
                    ) : null}
                    <PixelText variant="subtitle" color={PIXEL_COLORS.uiText}>{gear.nameCn}</PixelText>
                  </View>
                  <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>{gear.name}</PixelText>
                </View>

                <PixelText variant="body" style={{ marginTop: 6 }}>{gear.description}</PixelText>

                {/* Stats with RPG bars */}
                <View style={styles.statsDivider}>
                  <PixelText variant="caption" color={PIXEL_COLORS.hudActive} style={{ textAlign: 'center' }}>
                    --- 装备属性 ---
                  </PixelText>
                </View>
                <View style={styles.statsGrid}>
                  {Object.entries(gear.stats).map(([key, value]) => {
                    const maxVal = getStatMaxValue(key);
                    const barColor = getStatBarColor(key);
                    const percent = Math.min((Number(value) / maxVal) * 100, 100);
                    return (
                      <View key={key} style={styles.statItem}>
                        <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim} style={styles.statLabel}>
                          {STAT_LABELS[key] || key}
                        </PixelText>
                        <View style={styles.statBarRow}>
                          <View style={styles.statBarOuter}>
                            <View style={styles.statBarInner}>
                              <View style={[styles.statBarFill, { width: `${percent}%`, backgroundColor: barColor }]} />
                              <View style={styles.statBarShine} />
                            </View>
                          </View>
                          <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={styles.statValue}>
                            {value}
                          </PixelText>
                        </View>
                      </View>
                    );
                  })}
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
  filterRow: { flexDirection: 'row', marginBottom: 12, gap: 4 },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.windowOuter,
    backgroundColor: PIXEL_COLORS.hudBg,
  },
  filterActive: {
    borderColor: PIXEL_COLORS.hudActive,
    backgroundColor: PIXEL_COLORS.hudGlow,
    borderBottomWidth: 3,
  },
  gearCardOuter: {
    borderWidth: 3,
    borderColor: PIXEL_COLORS.windowOuter,
    marginBottom: 14,
  },
  gearCardBorder: {
    borderWidth: 2,
    borderColor: PIXEL_COLORS.windowInner + '55',
  },
  gearCardFill: {
    padding: 12,
    backgroundColor: PIXEL_COLORS.windowFill,
    position: 'relative',
    overflow: 'hidden',
  },
  typeBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    bottom: 0,
  },
  gearHeader: {},
  statsDivider: {
    marginTop: 10,
    marginBottom: 6,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: PIXEL_COLORS.windowOuter + '66',
  },
  statsGrid: { gap: 6 },
  statItem: {},
  statLabel: {
    letterSpacing: 1,
    marginBottom: 2,
  },
  statBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBarOuter: {
    flex: 1,
    height: 10,
    backgroundColor: PIXEL_COLORS.windowOuter,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.windowOuter,
    overflow: 'hidden',
  },
  statBarInner: {
    flex: 1,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 1,
    borderColor: PIXEL_COLORS.hudBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  statBarFill: { height: '100%' },
  statBarShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: PIXEL_COLORS.starColor + '33',
  },
  statValue: {
    minWidth: 30,
    textAlign: 'right',
    fontSize: 10,
  },
});
