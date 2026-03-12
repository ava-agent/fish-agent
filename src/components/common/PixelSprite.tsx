import React from 'react';
import { View, ViewStyle } from 'react-native';

interface PixelSpriteProps {
  data: number[][];
  colors: string[];
  pixelSize?: number;
  style?: ViewStyle;
}

export function PixelSprite({ data, colors, pixelSize = 4, style }: PixelSpriteProps) {
  return (
    <View style={style}>
      {data.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((colorIdx, c) => (
            <View
              key={c}
              style={{
                width: pixelSize,
                height: pixelSize,
                backgroundColor: colorIdx > 0 ? colors[colorIdx] : 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
