import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { PIXEL_COLORS } from '../../theme/colors';

interface PixelCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'highlight' | 'dark';
}

export function PixelCard({ children, style, variant = 'default' }: PixelCardProps) {
  const bgColor =
    variant === 'highlight'
      ? PIXEL_COLORS.uiHighlight + '20'
      : variant === 'dark'
      ? PIXEL_COLORS.uiBg
      : PIXEL_COLORS.uiPanel;

  return (
    <View style={[styles.card, { backgroundColor: bgColor }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 3,
    borderColor: PIXEL_COLORS.uiBorder,
    borderRadius: 0,
    padding: 12,
    boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.3)',
    elevation: 2,
  },
});
