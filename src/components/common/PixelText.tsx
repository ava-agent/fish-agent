import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { PIXEL_COLORS } from '../../theme/colors';

interface PixelTextProps {
  children: React.ReactNode;
  variant?: 'title' | 'subtitle' | 'body' | 'caption' | 'pixel';
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
}

export function PixelText({
  children,
  variant = 'body',
  color,
  style,
  numberOfLines,
}: PixelTextProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        styles.base,
        styles[variant],
        color ? { color } : undefined,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'SpaceMono',
    color: PIXEL_COLORS.uiText,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
  },
  caption: {
    fontSize: 11,
    color: PIXEL_COLORS.uiTextDim,
  },
  pixel: {
    fontSize: 12,
    letterSpacing: 2,
  },
});
