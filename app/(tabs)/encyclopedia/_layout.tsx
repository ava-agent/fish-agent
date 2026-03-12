import React from 'react';
import { Text } from 'react-native';
import { Stack } from 'expo-router';
import { PIXEL_COLORS } from '../../../src/theme/colors';

function HeaderTitle({ children }: { children: string }) {
  return (
    <Text style={{
      fontFamily: 'SpaceMono',
      fontSize: 15,
      fontWeight: '600',
      color: PIXEL_COLORS.uiText,
      letterSpacing: 2,
      textShadowColor: '#000000',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 0,
    }}>
      {children}
    </Text>
  );
}

export default function EncyclopediaLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: PIXEL_COLORS.windowTitle },
        headerTintColor: PIXEL_COLORS.uiHighlight,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerTitle: () => <HeaderTitle>{'< 钓鱼百科 >'}</HeaderTitle> }}
      />
      <Stack.Screen
        name="[fishId]"
        options={{ headerTitle: () => <HeaderTitle>{'< 鱼种详情 >'}</HeaderTitle> }}
      />
      <Stack.Screen
        name="gear"
        options={{ headerTitle: () => <HeaderTitle>{'< 钓具大全 >'}</HeaderTitle> }}
      />
      <Stack.Screen
        name="techniques"
        options={{ headerTitle: () => <HeaderTitle>{'< 钓法教程 >'}</HeaderTitle> }}
      />
    </Stack>
  );
}
