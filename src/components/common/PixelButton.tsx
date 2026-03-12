import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { PIXEL_COLORS } from '../../theme/colors';

interface PixelButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  icon?: string;
}

export function PixelButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  icon,
}: PixelButtonProps) {
  const bgColor =
    variant === 'primary'
      ? PIXEL_COLORS.uiHighlight
      : variant === 'danger'
      ? PIXEL_COLORS.uiDanger
      : PIXEL_COLORS.uiPanel;

  const textColor =
    variant === 'primary' ? PIXEL_COLORS.windowOuter : PIXEL_COLORS.uiText;

  const borderColor =
    variant === 'primary' ? '#B8960A'
    : variant === 'danger' ? '#AA2222'
    : PIXEL_COLORS.uiBorder;

  const paddingH = size === 'small' ? 12 : size === 'large' ? 28 : 20;
  const paddingV = size === 'small' ? 6 : size === 'large' ? 14 : 10;
  const fontSize = size === 'small' ? 11 : size === 'large' ? 15 : 13;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[style]}
    >
      {/* Outer border (shadow) */}
      <View
        style={[
          styles.outer,
          {
            backgroundColor: disabled ? PIXEL_COLORS.hudInactive : '#0D0A14',
          },
        ]}
      >
        {/* Inner button */}
        <View
          style={[
            styles.inner,
            {
              backgroundColor: disabled ? PIXEL_COLORS.uiBorder : bgColor,
              borderColor: disabled ? PIXEL_COLORS.hudInactive : borderColor,
              paddingHorizontal: paddingH,
              paddingVertical: paddingV,
            },
          ]}
        >
          {/* Top shine line */}
          <View style={[
            styles.shineLine,
            { backgroundColor: variant === 'primary' ? '#FFE85A' : PIXEL_COLORS.windowShine + '33' },
          ]} />
          <Text
            style={[
              styles.text,
              {
                color: disabled ? PIXEL_COLORS.uiTextDim : textColor,
                fontSize,
              },
            ]}
          >
            {icon ? `${icon} ` : ''}{title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    padding: 3,
  },
  inner: {
    borderWidth: 2,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  shineLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  text: {
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: '#00000066',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});
