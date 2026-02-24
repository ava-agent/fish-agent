import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { PIXEL_COLORS } from '../../../src/theme/colors';
import { PixelText } from '../../../src/components/common/PixelText';
import { PixelCard } from '../../../src/components/common/PixelCard';
import { FISH_SPECIES } from '../../../src/data/fish-species';
import { BAITS } from '../../../src/data/baits';
import { useFishDexStore } from '../../../src/stores/useFishDexStore';

function PixelSprite({ data, colors, pixelSize = 4 }: { data: number[][]; colors: string[]; pixelSize?: number }) {
  return (
    <View>
      {data.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((colorIdx, c) => (
            <View
              key={c}
              style={{
                width: pixelSize, height: pixelSize,
                backgroundColor: colorIdx > 0 ? colors[colorIdx] : 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function FishDetailScreen() {
  const { fishId } = useLocalSearchParams<{ fishId: string }>();
  const fish = FISH_SPECIES.find((f) => f.id === fishId);
  const { isDiscovered, getEntry } = useFishDexStore();

  if (!fish) {
    return (
      <View style={styles.container}>
        <PixelText variant="title">未找到该鱼种</PixelText>
      </View>
    );
  }

  const discovered = isDiscovered(fish.id);
  const entry = getEntry(fish.id);
  const preferredBaits = BAITS.filter((b) => fish.preferredBait.includes(b.id));

  const rarityColor: Record<string, string> = {
    common: PIXEL_COLORS.uiText,
    uncommon: PIXEL_COLORS.uiInfo,
    rare: PIXEL_COLORS.fishPurple,
    legendary: PIXEL_COLORS.uiHighlight,
  };
  const rarityLabel: Record<string, string> = {
    common: '普通', uncommon: '少见', rare: '珍稀', legendary: '传说',
  };
  const categoryLabel: Record<string, string> = {
    freshwater: '淡水', saltwater: '海水', pond: '池塘',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Fish pixel art display */}
      <PixelCard style={styles.mainCard}>
        <View style={styles.fishDisplay}>
          <PixelSprite
            data={fish.pixelArt}
            colors={discovered ? fish.pixelColors : fish.pixelColors.map(() => '#444')}
            pixelSize={8}
          />
        </View>
        <PixelText variant="title" style={{ textAlign: 'center', marginTop: 12 }}>
          {discovered ? fish.nameCn : '???'}
        </PixelText>
        {discovered && (
          <PixelText variant="caption" style={{ textAlign: 'center' }}>
            {fish.name}
          </PixelText>
        )}
        <PixelText
          variant="caption"
          color={rarityColor[fish.rarity]}
          style={{ textAlign: 'center', marginTop: 4 }}
        >
          {rarityLabel[fish.rarity]} | {categoryLabel[fish.category]}
        </PixelText>
      </PixelCard>

      {/* Stats */}
      <PixelCard style={styles.section}>
        <PixelText variant="subtitle" style={{ marginBottom: 8 }}>基本信息</PixelText>
        <View style={styles.statRow}>
          <PixelText variant="caption">难度:</PixelText>
          <PixelText variant="caption" color={PIXEL_COLORS.uiHighlight}>
            {'★'.repeat(fish.difficulty)}{'☆'.repeat(5 - fish.difficulty)}
          </PixelText>
        </View>
        <View style={styles.statRow}>
          <PixelText variant="caption">体重范围:</PixelText>
          <PixelText variant="caption" color={PIXEL_COLORS.uiHighlight}>
            {fish.minWeight} - {fish.maxWeight} kg
          </PixelText>
        </View>
        <View style={styles.statRow}>
          <PixelText variant="caption">战斗力:</PixelText>
          <View style={styles.statBar}>
            <View style={[styles.statBarFill, { width: `${fish.fightStrength * 100}%`, backgroundColor: PIXEL_COLORS.uiDanger }]} />
          </View>
        </View>
        <View style={styles.statRow}>
          <PixelText variant="caption">速度:</PixelText>
          <View style={styles.statBar}>
            <View style={[styles.statBarFill, { width: `${(fish.swimSpeed / 5) * 100}%`, backgroundColor: PIXEL_COLORS.uiInfo }]} />
          </View>
        </View>
      </PixelCard>

      {/* Habitat */}
      <PixelCard style={styles.section}>
        <PixelText variant="subtitle" style={{ marginBottom: 8 }}>栖息地</PixelText>
        <PixelText variant="body">{fish.habitat}</PixelText>
      </PixelCard>

      {/* Description */}
      <PixelCard style={styles.section}>
        <PixelText variant="subtitle" style={{ marginBottom: 8 }}>简介</PixelText>
        <PixelText variant="body">{fish.description}</PixelText>
      </PixelCard>

      {/* Preferred baits */}
      <PixelCard style={styles.section}>
        <PixelText variant="subtitle" style={{ marginBottom: 8 }}>推荐鱼饵</PixelText>
        {preferredBaits.map((bait) => (
          <View key={bait.id} style={styles.baitItem}>
            <PixelSprite data={bait.pixelArt} colors={bait.pixelColors} pixelSize={4} />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <PixelText variant="caption">{bait.nameCn}</PixelText>
              <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 10 }}>
                {bait.description}
              </PixelText>
            </View>
          </View>
        ))}
      </PixelCard>

      {/* Fishing tip */}
      <PixelCard style={{ ...styles.section, borderColor: PIXEL_COLORS.uiInfo }}>
        <PixelText variant="subtitle" color={PIXEL_COLORS.uiInfo} style={{ marginBottom: 8 }}>
          实钓小贴士
        </PixelText>
        <PixelText variant="body">{fish.tip}</PixelText>
      </PixelCard>

      {/* Player stats */}
      {discovered && entry && (
        <PixelCard style={styles.section}>
          <PixelText variant="subtitle" style={{ marginBottom: 8 }}>我的记录</PixelText>
          <View style={styles.statRow}>
            <PixelText variant="caption">捕获次数:</PixelText>
            <PixelText variant="caption" color={PIXEL_COLORS.uiHighlight}>{entry.caughtCount}</PixelText>
          </View>
          <View style={styles.statRow}>
            <PixelText variant="caption">最大重量:</PixelText>
            <PixelText variant="caption" color={PIXEL_COLORS.uiHighlight}>{entry.bestWeight.toFixed(1)} kg</PixelText>
          </View>
          <View style={styles.statRow}>
            <PixelText variant="caption">首次发现:</PixelText>
            <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>
              {new Date(entry.firstCaughtDate).toLocaleDateString('zh-CN')}
            </PixelText>
          </View>
        </PixelCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIXEL_COLORS.uiBg },
  content: { padding: 16, paddingBottom: 32 },
  mainCard: { alignItems: 'center', marginBottom: 12 },
  fishDisplay: {
    width: '100%', height: 120, justifyContent: 'center', alignItems: 'center',
    backgroundColor: PIXEL_COLORS.waterDeep + '44',
  },
  section: { marginBottom: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  statBar: {
    width: 100, height: 8, backgroundColor: PIXEL_COLORS.uiBg,
    borderWidth: 1, borderColor: PIXEL_COLORS.uiBorder, overflow: 'hidden',
  },
  statBarFill: { height: '100%' },
  baitItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: PIXEL_COLORS.uiBorder + '44' },
});
