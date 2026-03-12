import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PIXEL_COLORS } from '../../../src/theme/colors';
import { PixelText } from '../../../src/components/common/PixelText';
import { PixelCard } from '../../../src/components/common/PixelCard';
import { PixelButton } from '../../../src/components/common/PixelButton';
import { COMMUNITIES } from '../../../src/data/communities';

const TYPE_ICONS: Record<string, string> = {
  forum: 'forum',
  app: 'cellphone',
  wechat: 'wechat',
  website: 'web',
};

const TYPE_LABELS: Record<string, string> = {
  forum: '论坛',
  app: 'APP',
  wechat: '公众号',
  website: '网站',
};

const TYPE_TAG_COLORS: Record<string, string> = {
  forum: PIXEL_COLORS.rarityUncommon,
  app: PIXEL_COLORS.rarityRare,
  wechat: PIXEL_COLORS.uiSuccess,
  website: PIXEL_COLORS.rarityLegendary,
};

export default function CommunityScreen() {
  const handleOpenLink = (url?: string) => {
    if (url) Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header banner */}
      <PixelCard variant="highlight" style={styles.introCard}>
        <View style={styles.introHeader}>
          <PixelText variant="pixel" color={PIXEL_COLORS.hudActive}>
            {'◆ 钓友圈子 ◆'}
          </PixelText>
        </View>
        <View style={styles.introSeparator} />
        <PixelText variant="body" style={{ marginTop: 8 }}>
          加入这些钓鱼社区，和钓友们交流经验、分享钓获！
        </PixelText>
      </PixelCard>

      {COMMUNITIES.map((community) => {
        const tagColor = TYPE_TAG_COLORS[community.type] || PIXEL_COLORS.uiInfo;

        return (
          <PixelCard key={community.id} style={styles.communityCard}>
            <View style={styles.communityHeader}>
              <View style={styles.iconFrame}>
                <MaterialCommunityIcons
                  name={TYPE_ICONS[community.type] as any}
                  size={22}
                  color={PIXEL_COLORS.hudActive}
                />
              </View>
              <View style={{ marginLeft: 10, flex: 1 }}>
                <PixelText variant="subtitle">{community.name}</PixelText>
                <View style={[styles.typeBadge, { borderColor: tagColor + '88' }]}>
                  <PixelText variant="caption" color={tagColor} style={{ fontSize: 10, letterSpacing: 1 }}>
                    {'['}{TYPE_LABELS[community.type]}{']'}
                  </PixelText>
                </View>
              </View>
            </View>

            <PixelText variant="body" style={{ marginTop: 8 }}>
              {community.description}
            </PixelText>

            <View style={styles.featureTags}>
              {community.features.map((feature, i) => (
                <View key={i} style={styles.featureTag}>
                  <PixelText variant="caption" color={PIXEL_COLORS.rarityUncommon} style={{ fontSize: 10, letterSpacing: 1 }}>
                    {'◇ '}{feature}
                  </PixelText>
                </View>
              ))}
            </View>

            {community.url && (
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => handleOpenLink(community.url)}
              >
                <View style={styles.linkInner}>
                  <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 11 }}>
                    {'▸ '}前往访问
                  </PixelText>
                  <MaterialCommunityIcons name="open-in-new" size={12} color={PIXEL_COLORS.hudActive} />
                </View>
              </TouchableOpacity>
            )}
          </PixelCard>
        );
      })}

      {/* Fishing spots link */}
      <PixelButton
        title="查看钓点推荐"
        icon="◈"
        onPress={() => router.push('/community/spots' as any)}
        size="large"
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIXEL_COLORS.uiBg },
  content: { padding: 16, paddingBottom: 32 },
  introCard: { marginBottom: 16 },
  introHeader: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  introSeparator: {
    height: 2,
    backgroundColor: PIXEL_COLORS.hudActive + '44',
    marginHorizontal: 20,
  },
  communityCard: { marginBottom: 12 },
  communityHeader: { flexDirection: 'row', alignItems: 'center' },
  iconFrame: {
    width: 40,
    height: 40,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.hudBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 3,
    alignSelf: 'flex-start',
    backgroundColor: PIXEL_COLORS.windowOuter,
    borderWidth: 1,
  },
  featureTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  featureTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 1,
    borderColor: PIXEL_COLORS.hudBorder,
  },
  linkBtn: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: PIXEL_COLORS.windowOuter,
  },
  linkInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 1,
    borderColor: PIXEL_COLORS.hudBorder,
  },
});
