import { Stack } from 'expo-router';
import { PIXEL_COLORS } from '../../../src/theme/colors';

export default function CommunityLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: PIXEL_COLORS.tabBg },
        headerTintColor: PIXEL_COLORS.uiText,
        headerTitleStyle: { fontFamily: 'SpaceMono', fontSize: 16 },
      }}
    >
      <Stack.Screen name="index" options={{ title: '钓鱼社区' }} />
      <Stack.Screen name="spots" options={{ title: '钓点推荐' }} />
    </Stack>
  );
}
