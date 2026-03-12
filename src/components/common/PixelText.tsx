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
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowOffset: { width: 2, height: 2 },
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
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
    textTransform: 'uppercase',
  },
});
