import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PIXEL_COLORS } from '../../src/theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: PIXEL_COLORS.tabBg,
          borderTopColor: PIXEL_COLORS.uiBorder,
          borderTopWidth: 3,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: PIXEL_COLORS.tabActive,
        tabBarInactiveTintColor: PIXEL_COLORS.tabInactive,
        tabBarLabelStyle: {
          fontFamily: 'SpaceMono',
          fontSize: 10,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '钓鱼',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="fish" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="encyclopedia"
        options={{
          title: '百科',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-variant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: '社区',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: '记录',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="notebook" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
