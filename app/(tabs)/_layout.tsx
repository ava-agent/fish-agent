import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PIXEL_COLORS } from '../../src/theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: PIXEL_COLORS.tabActive,
        tabBarInactiveTintColor: PIXEL_COLORS.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '钓鱼',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <MaterialCommunityIcons name="fish" size={24} color={color} />
              {focused && <View style={styles.iconGlow} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="encyclopedia"
        options={{
          title: '百科',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <MaterialCommunityIcons name="book-open-variant" size={24} color={color} />
              {focused && <View style={styles.iconGlow} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: '社区',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <MaterialCommunityIcons name="account-group" size={24} color={color} />
              {focused && <View style={styles.iconGlow} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: '记录',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <MaterialCommunityIcons name="notebook" size={24} color={color} />
              {focused && <View style={styles.iconGlow} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: PIXEL_COLORS.tabBg,
    borderTopWidth: 3,
    borderTopColor: PIXEL_COLORS.hudBorder,
    height: 70,
    paddingBottom: 8,
    paddingTop: 4,
    // Double top border effect via shadow
    boxShadow: `0px -2px 0px ${PIXEL_COLORS.windowInner}44, inset 0px 2px 0px ${PIXEL_COLORS.windowInner}22`,
  },
  tabLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '600',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  tabItem: {
    paddingTop: 4,
  },
  activeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 0,
    backgroundColor: PIXEL_COLORS.hudGlow,
    top: -6,
    zIndex: -1,
  },
});
