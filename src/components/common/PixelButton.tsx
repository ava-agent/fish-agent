import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { PIXEL_COLORS } from '../../theme/colors';

interface PixelButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
}

export function PixelButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
}: PixelButtonProps) {
  const bgColor =
    variant === 'primary'
      ? PIXEL_COLORS.uiHighlight
      : variant === 'danger'
      ? PIXEL_COLORS.uiDanger
      : PIXEL_COLORS.uiPanel;

  const textColor =
    variant === 'primary' ? PIXEL_COLORS.uiBg : PIXEL_COLORS.uiText;

  const paddingH = size === 'small' ? 12 : size === 'large' ? 24 : 16;
  const paddingV = size === 'small' ? 6 : size === 'large' ? 14 : 10;
  const fontSize = size === 'small' ? 11 : size === 'large' ? 16 : 13;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? PIXEL_COLORS.uiBorder : bgColor,
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
          borderColor: disabled ? PIXEL_COLORS.uiBorder : PIXEL_COLORS.uiBorder,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: disabled ? PIXEL_COLORS.uiTextDim : textColor,
            fontSize,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 3,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    // Pixel shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 3,
  },
  text: {
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
