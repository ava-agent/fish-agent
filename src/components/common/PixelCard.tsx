import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { PIXEL_COLORS } from '../../theme/colors';

interface PixelCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'highlight' | 'dark';
  title?: string;
}

export function PixelCard({ children, style, variant = 'default' }: PixelCardProps) {
  const innerBorderColor =
    variant === 'highlight'
      ? PIXEL_COLORS.uiHighlight + '66'
      : variant === 'dark'
      ? PIXEL_COLORS.hudInactive
      : PIXEL_COLORS.windowInner + '55';

  const fillColor =
    variant === 'highlight'
      ? PIXEL_COLORS.uiHighlight + '12'
      : variant === 'dark'
      ? PIXEL_COLORS.uiBg
      : PIXEL_COLORS.windowFill;

  return (
    <View style={[styles.outerBorder, style]}>
      <View style={[styles.innerBorder, { borderColor: innerBorderColor }]}>
        <View style={[styles.fill, { backgroundColor: fillColor }]}>
          {/* Top shine line */}
          <View style={styles.shineTop} />
          {children}
        </View>
      </View>
      {/* Corner decorations */}
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} />
      <View style={[styles.corner, styles.cornerBR]} />
    </View>
  );
}

const styles = StyleSheet.create({
  outerBorder: {
    borderWidth: 3,
    borderColor: PIXEL_COLORS.windowOuter,
    borderRadius: 0,
    position: 'relative',
  },
  innerBorder: {
    borderWidth: 2,
    borderRadius: 0,
  },
  fill: {
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  shineTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: PIXEL_COLORS.windowShine + '22',
  },
  corner: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: PIXEL_COLORS.windowInner,
  },
  cornerTL: { top: -1, left: -1 },
  cornerTR: { top: -1, right: -1 },
  cornerBL: { bottom: -1, left: -1 },
  cornerBR: { bottom: -1, right: -1 },
});
