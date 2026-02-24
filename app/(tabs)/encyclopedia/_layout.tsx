import { Stack } from 'expo-router';
import { PIXEL_COLORS } from '../../../src/theme/colors';

export default function EncyclopediaLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: PIXEL_COLORS.tabBg },
        headerTintColor: PIXEL_COLORS.uiText,
        headerTitleStyle: { fontFamily: 'SpaceMono', fontSize: 16 },
      }}
    >
      <Stack.Screen name="index" options={{ title: '钓鱼百科' }} />
      <Stack.Screen name="[fishId]" options={{ title: '鱼种详情' }} />
      <Stack.Screen name="gear" options={{ title: '钓具大全' }} />
      <Stack.Screen name="techniques" options={{ title: '钓法教程' }} />
    </Stack>
  );
}
