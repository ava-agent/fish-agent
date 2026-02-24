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

export default function CommunityScreen() {
  const handleOpenLink = (url?: string) => {
    if (url) Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PixelCard style={styles.introCard}>
        <PixelText variant="subtitle" color={PIXEL_COLORS.uiHighlight}>
          钓友圈子
        </PixelText>
        <PixelText variant="body" style={{ marginTop: 4 }}>
          加入这些钓鱼社区，和钓友们交流经验、分享钓获！
        </PixelText>
      </PixelCard>

      {COMMUNITIES.map((community) => (
        <PixelCard key={community.id} style={styles.communityCard}>
          <View style={styles.communityHeader}>
            <MaterialCommunityIcons
              name={TYPE_ICONS[community.type] as any}
              size={24}
              color={PIXEL_COLORS.uiHighlight}
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <PixelText variant="subtitle">{community.name}</PixelText>
              <View style={styles.typeBadge}>
                <PixelText variant="caption" color={PIXEL_COLORS.uiInfo} style={{ fontSize: 10 }}>
                  {TYPE_LABELS[community.type]}
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
                <PixelText variant="caption" style={{ fontSize: 10 }}>
                  {feature}
                </PixelText>
              </View>
            ))}
          </View>

          {community.url && (
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => handleOpenLink(community.url)}
            >
              <MaterialCommunityIcons name="open-in-new" size={14} color={PIXEL_COLORS.uiInfo} />
              <PixelText variant="caption" color={PIXEL_COLORS.uiInfo} style={{ marginLeft: 4 }}>
                前往访问
              </PixelText>
            </TouchableOpacity>
          )}
        </PixelCard>
      ))}

      {/* Fishing spots link */}
      <PixelButton
        title="查看钓点推荐"
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
  communityCard: { marginBottom: 12 },
  communityHeader: { flexDirection: 'row', alignItems: 'center' },
  typeBadge: {
    paddingHorizontal: 6, paddingVertical: 1, marginTop: 2,
    backgroundColor: PIXEL_COLORS.uiInfo + '20', alignSelf: 'flex-start',
    borderWidth: 1, borderColor: PIXEL_COLORS.uiInfo + '44',
  },
  featureTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  featureTag: {
    paddingHorizontal: 8, paddingVertical: 2,
    backgroundColor: PIXEL_COLORS.uiBg, borderWidth: 1, borderColor: PIXEL_COLORS.uiBorder,
  },
  linkBtn: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 8, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: PIXEL_COLORS.uiBorder + '44',
  },
});
