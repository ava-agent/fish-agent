import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { PIXEL_COLORS } from '../../src/theme/colors';
import { PixelText } from '../../src/components/common/PixelText';
import { PixelCard } from '../../src/components/common/PixelCard';
import { useAgentStore } from '../../src/stores/useAgentStore';
import { AgentAttribute } from '../../src/game/types';

const ATTR_CONFIG: {
  key: AgentAttribute;
  icon: string;
  label: string;
  color: string;
}[] = [
  { key: 'perception', icon: '👁', label: '感知', color: PIXEL_COLORS.aiGold },
  { key: 'reasoning', icon: '🧠', label: '推理', color: PIXEL_COLORS.aiPurple },
  { key: 'generation', icon: '⚡', label: '生成', color: PIXEL_COLORS.aiCyan },
  { key: 'compute', icon: '🔥', label: '算力', color: PIXEL_COLORS.resourceCompute },
];

const RESOURCE_CONFIG: {
  type: 'prompt_fragment' | 'model_params' | 'training_data' | 'compute_crystal';
  icon: string;
  label: string;
  color: string;
}[] = [
  { type: 'prompt_fragment', icon: '💎', label: 'Prompt碎片', color: PIXEL_COLORS.aiGold },
  { type: 'model_params', icon: '🔮', label: '模型参数', color: PIXEL_COLORS.aiPurple },
  { type: 'training_data', icon: '📊', label: '训练数据', color: PIXEL_COLORS.aiCyan },
  { type: 'compute_crystal', icon: '🔴', label: '算力晶体', color: PIXEL_COLORS.resourceCompute },
];

function StatRow({ attr }: { attr: typeof ATTR_CONFIG[number] }) {
  const level = useAgentStore((s) => s[attr.key]);
  const canUpgrade = useAgentStore((s) => s.canUpgrade(attr.key));
  const upgradeCost = useAgentStore((s) => s.getUpgradeCost(attr.key));
  const upgradeAttribute = useAgentStore((s) => s.upgradeAttribute);
  const isMax = level >= 5;
  const progressWidth = (level / 5) * 100;

  return (
    <View style={styles.statRow}>
      <View style={styles.statInfo}>
        <PixelText variant="caption" style={{ fontSize: 14 }}>{attr.icon}</PixelText>
        <PixelText variant="pixel" color={attr.color} style={{ fontSize: 10, marginLeft: 6 }}>
          {attr.label}
        </PixelText>
      </View>
      <View style={styles.statBarOuter}>
        <View style={[styles.statBarFill, { width: `${progressWidth}%`, backgroundColor: attr.color }]} />
        <View style={[styles.statBarShine, { width: `${progressWidth}%` }]} />
      </View>
      <PixelText variant="pixel" color={attr.color} style={{ fontSize: 9, marginHorizontal: 6 }}>
        Lv.{level}
      </PixelText>
      <TouchableOpacity
        onPress={() => upgradeAttribute(attr.key)}
        disabled={!canUpgrade}
        style={[
          styles.upgradeBtn,
          { borderColor: isMax ? PIXEL_COLORS.hudInactive : canUpgrade ? attr.color : PIXEL_COLORS.hudInactive },
          !canUpgrade && !isMax && styles.upgradeBtnDisabled,
        ]}
      >
        <PixelText
          variant="pixel"
          color={isMax ? PIXEL_COLORS.hudInactive : canUpgrade ? attr.color : PIXEL_COLORS.uiTextDim}
          style={{ fontSize: 8 }}
        >
          {isMax ? '[MAX]' : `[↑升级 ${upgradeCost}]`}
        </PixelText>
      </TouchableOpacity>
    </View>
  );
}

export default function AgentScreen() {
  const agentLevel = useAgentStore((s) => s.getLevel());
  const agentTitle = useAgentStore((s) => s.getLevelTitle());
  const resources = useAgentStore((s) => s.resources);
  const nextLevelTotal = (agentLevel + 1) * 4;
  const currentTotal = useAgentStore((s) => s.perception + s.reasoning + s.generation + s.compute);
  const toNextLevel = nextLevelTotal - currentTotal;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <PixelText variant="title" color={PIXEL_COLORS.aiCyan} style={styles.header}>
        {'═══ 你的 AI 助手 ═══'}
      </PixelText>

      {/* Avatar section */}
      <PixelCard style={styles.avatarCard}>
        <View style={styles.avatarSection}>
          {/* Pixel robot face */}
          <View style={styles.robotFace}>
            <View style={styles.robotHead}>
              <View style={styles.robotAntenna} />
              <View style={styles.robotAntennaBase} />
              <View style={styles.robotSkull}>
                <View style={styles.robotEyeRow}>
                  <View style={[styles.robotEye, { backgroundColor: PIXEL_COLORS.aiCyan }]} />
                  <View style={[styles.robotEye, { backgroundColor: PIXEL_COLORS.aiCyan }]} />
                </View>
                <View style={styles.robotMouth}>
                  <View style={styles.robotMouthLine} />
                </View>
              </View>
            </View>
          </View>
          <View style={styles.avatarInfo}>
            <PixelText variant="subtitle" color={PIXEL_COLORS.aiCyan}>
              Lv.{agentLevel}
            </PixelText>
            <PixelText variant="pixel" color={PIXEL_COLORS.uiText} style={{ fontSize: 10, marginTop: 4 }}>
              {agentTitle}
            </PixelText>
            <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim} style={{ marginTop: 6, fontSize: 9 }}>
              {toNextLevel > 0 ? `距离下一级还需: ${toNextLevel} 训练数据` : '已达最高等级'}
            </PixelText>
          </View>
        </View>
      </PixelCard>

      {/* Attribute stats */}
      <PixelCard style={styles.statsCard}>
        <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight} style={{ marginBottom: 10, fontSize: 10 }}>
          [ 属性面板 ]
        </PixelText>
        {ATTR_CONFIG.map((attr) => (
          <StatRow key={attr.key} attr={attr} />
        ))}
      </PixelCard>

      {/* Resource inventory */}
      <PixelCard style={styles.resourceCard}>
        <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight} style={{ marginBottom: 10, fontSize: 10 }}>
          [ 资源仓库 ]
        </PixelText>
        <View style={styles.resourceGrid}>
          {RESOURCE_CONFIG.map((res) => (
            <View key={res.type} style={[styles.resourceChip, { borderColor: res.color + '66' }]}>
              <PixelText variant="caption" style={{ fontSize: 14 }}>{res.icon}</PixelText>
              <PixelText variant="pixel" color={res.color} style={{ fontSize: 9, marginTop: 2 }}>
                {resources[res.type]}
              </PixelText>
              <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 8, marginTop: 2 }}>
                {res.label}
              </PixelText>
            </View>
          ))}
        </View>
      </PixelCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIXEL_COLORS.hudBg },
  content: { padding: 16, paddingBottom: 32 },
  header: { textAlign: 'center', marginBottom: 16 },

  // Avatar section
  avatarCard: { marginBottom: 12 },
  avatarSection: { flexDirection: 'row', alignItems: 'center' },
  robotFace: { marginRight: 16 },
  robotHead: { alignItems: 'center' },
  robotAntenna: { width: 2, height: 10, backgroundColor: PIXEL_COLORS.aiCyan },
  robotAntennaBase: { width: 8, height: 4, backgroundColor: PIXEL_COLORS.aiCyanDim },
  robotSkull: {
    width: 48,
    height: 48,
    backgroundColor: PIXEL_COLORS.uiPanel,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.aiCyanDim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  robotEyeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 28,
    marginBottom: 6,
  },
  robotEye: { width: 8, height: 8 },
  robotMouth: { width: 20, height: 4, backgroundColor: PIXEL_COLORS.hudBg, justifyContent: 'center' },
  robotMouthLine: { width: 20, height: 2, backgroundColor: PIXEL_COLORS.aiCyanDim },
  avatarInfo: { flex: 1 },

  // Stats
  statsCard: { marginBottom: 12 },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  statBarOuter: {
    flex: 1,
    height: 12,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.hudBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  statBarFill: {
    height: '100%',
  },
  statBarShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 2,
    backgroundColor: '#FFFFFF33',
  },
  upgradeBtn: {
    borderWidth: 2,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: PIXEL_COLORS.hudBg,
  },
  upgradeBtnDisabled: {
    opacity: 0.5,
  },

  // Resources
  resourceCard: { marginBottom: 12 },
  resourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resourceChip: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    backgroundColor: PIXEL_COLORS.hudBg,
  },
});
