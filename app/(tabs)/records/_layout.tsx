import { Stack } from 'expo-router';
import { PIXEL_COLORS } from '../../../src/theme/colors';

export default function RecordsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: PIXEL_COLORS.tabBg },
        headerTintColor: PIXEL_COLORS.uiText,
        headerTitleStyle: { fontFamily: 'SpaceMono', fontSize: 16 },
      }}
    >
      <Stack.Screen name="index" options={{ title: '钓鱼日记' }} />
      <Stack.Screen name="new" options={{ title: '新建记录' }} />
      <Stack.Screen name="stats" options={{ title: '数据统计' }} />
    </Stack>
  );
}
