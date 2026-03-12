import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { PIXEL_COLORS } from '../../src/theme/colors';
import { PixelText } from '../../src/components/common/PixelText';
import { PixelCard } from '../../src/components/common/PixelCard';
import { ACHIEVEMENTS } from '../../src/data/achievements';
import { useAchievementStore } from '../../src/stores/useAchievementStore';

function getRewardText(reward: typeof ACHIEVEMENTS[number]['reward']): string {
  switch (reward.type) {
    case 'unlock_bait':
      return `解锁鱼饵: ${reward.baitId}`;
    case 'resources':
      if (reward.resources && reward.resources.length > 0) {
        return reward.resources.map((r) => `${r.type} x${r.amount}`).join(', ');
      }
      return '资源奖励';
    case 'agent_levels':
      return `AI 助手属性 +${reward.levels}`;
    case 'title':
      return `称号: ${reward.title}`;
    case 'equipment_fragment':
      return `装备碎片: ${reward.fragmentId}`;
    default:
      return '未知奖励';
  }
}

export default function AchievementsScreen() {
  const { getProgress } = useAchievementStore();

  const unlockedCount = ACHIEVEMENTS.filter(
    (a) => getProgress(a.id).unlocked
  ).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <PixelText variant="title" color={PIXEL_COLORS.aiGold} style={styles.header}>
        {'═══ 成就系统 ═══'}
      </PixelText>

      {/* Summary */}
      <PixelCard style={styles.summaryCard}>
        <PixelText variant="pixel" color={PIXEL_COLORS.aiGold} style={{ textAlign: 'center' }}>
          已解锁: {unlockedCount} / {ACHIEVEMENTS.length}
        </PixelText>
        <View style={styles.summaryBar}>
          <View style={styles.summaryBarInner}>
            <View
              style={[
                styles.summaryBarFill,
                { width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` },
              ]}
            />
            <View style={styles.summaryBarShine} />
          </View>
        </View>
      </PixelCard>

      {/* Achievement cards */}
      {ACHIEVEMENTS.map((achievement) => {
        const progress = getProgress(achievement.id);
        const isUnlocked = progress.unlocked;

        return (
          <View
            key={achievement.id}
            style={[
              styles.achievementOuter,
              { borderColor: isUnlocked ? PIXEL_COLORS.aiGold : PIXEL_COLORS.uiBorder },
            ]}
          >
            <View
              style={[
                styles.achievementInner,
                {
                  borderColor: isUnlocked
                    ? PIXEL_COLORS.aiGold + '55'
                    : PIXEL_COLORS.windowInner + '33',
                },
              ]}
            >
              <View
                style={[
                  styles.achievementFill,
                  { opacity: isUnlocked ? 1 : 0.6 },
                ]}
              >
                {/* Title row */}
                <View style={styles.titleRow}>
                  <PixelText
                    variant="pixel"
                    color={isUnlocked ? PIXEL_COLORS.aiGold : PIXEL_COLORS.uiTextDim}
                    style={{ fontSize: 10 }}
                  >
                    {isUnlocked ? '\u2713 ' : ''}{achievement.nameCn}
                  </PixelText>
                  <PixelText
                    variant="caption"
                    color={PIXEL_COLORS.uiTextDim}
                    style={{ fontSize: 9 }}
                  >
                    {achievement.name}
                  </PixelText>
                </View>

                {/* Description */}
                <PixelText
                  variant="caption"
                  color={isUnlocked ? PIXEL_COLORS.uiText : PIXEL_COLORS.uiTextDim}
                  style={{ marginTop: 6, fontSize: 11 }}
                >
                  {achievement.description}
                </PixelText>

                {/* Progress bar */}
                <View style={styles.progressOuter}>
                  <View style={styles.progressInner}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(
                            (progress.current / achievement.condition.target) * 100,
                            100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <PixelText
                    variant="caption"
                    color={isUnlocked ? PIXEL_COLORS.aiCyan : PIXEL_COLORS.uiTextDim}
                    style={{ fontSize: 9, marginLeft: 8 }}
                  >
                    {Math.min(progress.current, achievement.condition.target)}/{achievement.condition.target}
                  </PixelText>
                </View>

                {/* Reward */}
                <View style={styles.rewardRow}>
                  <PixelText
                    variant="caption"
                    color={isUnlocked ? PIXEL_COLORS.aiGold : PIXEL_COLORS.uiTextDim}
                    style={{ fontSize: 9 }}
                  >
                    {isUnlocked ? '\u2605 ' : '\u2606 '}奖励: {getRewardText(achievement.reward)}
                  </PixelText>
                </View>

                {/* Unlocked timestamp */}
                {isUnlocked && progress.unlockedAt && (
                  <PixelText
                    variant="caption"
                    color={PIXEL_COLORS.uiTextDim}
                    style={{ fontSize: 8, marginTop: 4 }}
                  >
                    解锁于 {new Date(progress.unlockedAt).toLocaleDateString()}
                  </PixelText>
                )}
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
  header: { textAlign: 'center', marginBottom: 16 },

  // Summary
  summaryCard: { marginBottom: 16, alignItems: 'center' },
  summaryBar: {
    width: '100%',
    height: 16,
    backgroundColor: PIXEL_COLORS.windowOuter,
    borderWidth: 3,
    borderColor: PIXEL_COLORS.windowOuter,
    marginTop: 8,
    overflow: 'hidden',
  },
  summaryBarInner: {
    flex: 1,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 1,
    borderColor: PIXEL_COLORS.hudBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  summaryBarFill: {
    height: '100%',
    backgroundColor: PIXEL_COLORS.aiGold,
  },
  summaryBarShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: PIXEL_COLORS.starColor + '33',
  },

  // Achievement card
  achievementOuter: {
    borderWidth: 3,
    marginBottom: 12,
  },
  achievementInner: {
    borderWidth: 2,
  },
  achievementFill: {
    padding: 12,
    backgroundColor: PIXEL_COLORS.windowFill,
    position: 'relative',
    overflow: 'hidden',
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Progress bar
  progressOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressInner: {
    flex: 1,
    height: 10,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.hudBorder,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: PIXEL_COLORS.aiCyan,
  },

  // Reward
  rewardRow: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: PIXEL_COLORS.hudBorder + '44',
  },
});
