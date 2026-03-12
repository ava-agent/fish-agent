import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { PIXEL_COLORS } from '../src/theme/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '页面不存在' }} />
      <View style={styles.container}>
        <Text style={styles.title}>{'< 页面不存在 >'}</Text>
        <Text style={styles.subtitle}>{'ERROR 404'}</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>{'▸ 返回首页'}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: PIXEL_COLORS.hudBg,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PIXEL_COLORS.uiText,
    fontFamily: 'SpaceMono',
    letterSpacing: 2,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  subtitle: {
    fontSize: 12,
    color: PIXEL_COLORS.uiDanger,
    fontFamily: 'SpaceMono',
    letterSpacing: 3,
    marginTop: 8,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  link: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 3,
    borderColor: PIXEL_COLORS.windowOuter,
    backgroundColor: PIXEL_COLORS.uiPanel,
  },
  linkText: {
    fontSize: 14,
    color: PIXEL_COLORS.uiHighlight,
    fontFamily: 'SpaceMono',
    letterSpacing: 1,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});
