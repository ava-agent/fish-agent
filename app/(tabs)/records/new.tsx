import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { PIXEL_COLORS } from '../../../src/theme/colors';
import { PixelText } from '../../../src/components/common/PixelText';
import { PixelCard } from '../../../src/components/common/PixelCard';
import { PixelButton } from '../../../src/components/common/PixelButton';
import { useRecordStore } from '../../../src/stores/useRecordStore';
import { FISH_SPECIES } from '../../../src/data/fish-species';
import { Weather, CatchEntry } from '../../../src/game/types';

const WEATHERS: { key: Weather; label: string; icon: string }[] = [
  { key: 'sunny', label: '晴', icon: '☀' },
  { key: 'cloudy', label: '云', icon: '☁' },
  { key: 'rainy', label: '雨', icon: '🌧' },
  { key: 'windy', label: '风', icon: '💨' },
];

export default function NewRecordScreen() {
  const { addRecord } = useRecordStore();

  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState<Weather>('sunny');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [catches, setCatches] = useState<CatchEntry[]>([]);

  // Add catch form state
  const [selectedFish, setSelectedFish] = useState(FISH_SPECIES[0].id);
  const [catchWeight, setCatchWeight] = useState('');

  const addCatch = () => {
    const fish = FISH_SPECIES.find((f) => f.id === selectedFish);
    if (!fish || !catchWeight) return;

    setCatches([
      ...catches,
      {
        fishId: fish.id,
        fishName: fish.nameCn,
        weight: parseFloat(catchWeight) || 0,
        technique: '',
        bait: '',
        time: new Date().toTimeString().slice(0, 5),
      },
    ]);
    setCatchWeight('');
  };

  const removeCatch = (index: number) => {
    setCatches(catches.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!location.trim()) {
      Alert.alert('提示', '请输入钓鱼地点');
      return;
    }

    addRecord({
      date: new Date().toISOString(),
      location: location.trim(),
      weather,
      duration: parseInt(duration) || 60,
      catches,
      notes: notes.trim(),
    });

    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Location */}
      <PixelCard style={styles.section}>
        <PixelText variant="subtitle" style={{ marginBottom: 8 }}>钓鱼地点</PixelText>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="例如：XX水库、XX河段..."
          placeholderTextColor={PIXEL_COLORS.uiTextDim}
        />
      </PixelCard>

      {/* Weather */}
      <PixelCard style={styles.section}>
        <PixelText variant="subtitle" style={{ marginBottom: 8 }}>天气</PixelText>
        <View style={styles.weatherRow}>
          {WEATHERS.map((w) => (
            <TouchableOpacity
              key={w.key}
              onPress={() => setWeather(w.key)}
              style={[styles.weatherBtn, weather === w.key && styles.weatherActive]}
            >
              <PixelText variant="body" style={{ fontSize: 20 }}>{w.icon}</PixelText>
              <PixelText
                variant="caption"
                color={weather === w.key ? PIXEL_COLORS.uiHighlight : PIXEL_COLORS.uiTextDim}
              >
                {w.label}
              </PixelText>
            </TouchableOpacity>
          ))}
        </View>
      </PixelCard>

      {/* Duration */}
      <PixelCard style={styles.section}>
        <PixelText variant="subtitle" style={{ marginBottom: 8 }}>钓鱼时长（分钟）</PixelText>
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          placeholder="60"
          placeholderTextColor={PIXEL_COLORS.uiTextDim}
        />
      </PixelCard>

      {/* Catches */}
      <PixelCard style={styles.section}>
        <PixelText variant="subtitle" style={{ marginBottom: 8 }}>钓获记录</PixelText>

        {catches.map((c, i) => (
          <View key={i} style={styles.catchItem}>
            <PixelText variant="caption">{c.fishName} - {c.weight}kg</PixelText>
            <TouchableOpacity onPress={() => removeCatch(i)}>
              <PixelText variant="caption" color={PIXEL_COLORS.uiDanger}>删除</PixelText>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.addCatchRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fishPicker}>
            {FISH_SPECIES.map((fish) => (
              <TouchableOpacity
                key={fish.id}
                onPress={() => setSelectedFish(fish.id)}
                style={[styles.fishOption, selectedFish === fish.id && styles.fishOptionActive]}
              >
                <PixelText
                  variant="caption"
                  style={{ fontSize: 10 }}
                  color={selectedFish === fish.id ? PIXEL_COLORS.uiHighlight : PIXEL_COLORS.uiTextDim}
                >
                  {fish.nameCn}
                </PixelText>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.addCatchInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={catchWeight}
              onChangeText={setCatchWeight}
              keyboardType="decimal-pad"
              placeholder="重量(kg)"
              placeholderTextColor={PIXEL_COLORS.uiTextDim}
            />
            <PixelButton
              title="添加"
              onPress={addCatch}
              size="small"
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>
      </PixelCard>

      {/* Notes */}
      <PixelCard style={styles.section}>
        <PixelText variant="subtitle" style={{ marginBottom: 8 }}>备注</PixelText>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="记录一些心得体会..."
          placeholderTextColor={PIXEL_COLORS.uiTextDim}
          multiline
          numberOfLines={4}
        />
      </PixelCard>

      {/* Save */}
      <PixelButton title="保存记录" onPress={handleSave} size="large" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIXEL_COLORS.uiBg },
  content: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 12 },
  input: {
    borderWidth: 2, borderColor: PIXEL_COLORS.uiBorder,
    backgroundColor: PIXEL_COLORS.uiBg, color: PIXEL_COLORS.uiText,
    fontFamily: 'SpaceMono', fontSize: 13,
    padding: 10,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  weatherRow: { flexDirection: 'row', gap: 12 },
  weatherBtn: {
    alignItems: 'center', padding: 8,
    borderWidth: 2, borderColor: 'transparent', flex: 1,
  },
  weatherActive: {
    borderColor: PIXEL_COLORS.uiHighlight,
    backgroundColor: PIXEL_COLORS.uiHighlight + '20',
  },
  catchItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: PIXEL_COLORS.uiBorder + '44',
  },
  addCatchRow: { marginTop: 8 },
  fishPicker: { maxHeight: 36, marginBottom: 8 },
  fishOption: { paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, borderWidth: 1, borderColor: PIXEL_COLORS.uiBorder },
  fishOptionActive: { borderColor: PIXEL_COLORS.uiHighlight, backgroundColor: PIXEL_COLORS.uiHighlight + '20' },
  addCatchInputRow: { flexDirection: 'row', alignItems: 'center' },
});
