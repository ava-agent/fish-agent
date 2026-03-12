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
        <View style={styles.sectionHeader}>
          <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 10 }}>
            {'▣ '}
          </PixelText>
          <PixelText variant="subtitle">钓鱼地点</PixelText>
        </View>
        <View style={styles.inputFrame}>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="例如：XX水库、XX河段..."
            placeholderTextColor={PIXEL_COLORS.hudInactive}
          />
        </View>
      </PixelCard>

      {/* Weather */}
      <PixelCard style={styles.section}>
        <View style={styles.sectionHeader}>
          <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 10 }}>
            {'▣ '}
          </PixelText>
          <PixelText variant="subtitle">天气</PixelText>
        </View>
        <View style={styles.weatherRow}>
          {WEATHERS.map((w) => (
            <TouchableOpacity
              key={w.key}
              onPress={() => setWeather(w.key)}
              style={[styles.weatherBtn, weather === w.key && styles.weatherActive]}
            >
              {weather === w.key && <View style={styles.weatherShine} />}
              <PixelText variant="body" style={{ fontSize: 20 }}>{w.icon}</PixelText>
              <PixelText
                variant="pixel"
                color={weather === w.key ? PIXEL_COLORS.hudActive : PIXEL_COLORS.hudInactive}
                style={{ fontSize: 10, marginTop: 2 }}
              >
                {w.label}
              </PixelText>
            </TouchableOpacity>
          ))}
        </View>
      </PixelCard>

      {/* Duration */}
      <PixelCard style={styles.section}>
        <View style={styles.sectionHeader}>
          <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 10 }}>
            {'▣ '}
          </PixelText>
          <PixelText variant="subtitle">钓鱼时长（分钟）</PixelText>
        </View>
        <View style={styles.inputFrame}>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="60"
            placeholderTextColor={PIXEL_COLORS.hudInactive}
          />
        </View>
      </PixelCard>

      {/* Catches */}
      <PixelCard style={styles.section}>
        <View style={styles.sectionHeader}>
          <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 10 }}>
            {'▣ '}
          </PixelText>
          <PixelText variant="subtitle">钓获记录</PixelText>
        </View>

        {catches.map((c, i) => (
          <View key={i} style={styles.catchItem}>
            <PixelText variant="caption" color={PIXEL_COLORS.rarityUncommon} style={{ fontSize: 11 }}>
              {'◆ '}{c.fishName} - {c.weight}kg
            </PixelText>
            <TouchableOpacity onPress={() => removeCatch(i)} style={styles.catchDeleteBtn}>
              <PixelText variant="pixel" color={PIXEL_COLORS.uiDanger} style={{ fontSize: 9 }}>
                {'✕'}
              </PixelText>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.addCatchRow}>
          <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim} style={{ fontSize: 9, marginBottom: 6 }}>
            {'═══ 选择鱼种 ═══'}
          </PixelText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fishPicker}>
            {FISH_SPECIES.map((fish) => (
              <TouchableOpacity
                key={fish.id}
                onPress={() => setSelectedFish(fish.id)}
                style={[styles.fishOption, selectedFish === fish.id && styles.fishOptionActive]}
              >
                {selectedFish === fish.id && <View style={styles.fishOptionShine} />}
                <PixelText
                  variant="caption"
                  style={{ fontSize: 10, letterSpacing: 1 }}
                  color={selectedFish === fish.id ? PIXEL_COLORS.hudActive : PIXEL_COLORS.uiTextDim}
                >
                  {fish.nameCn}
                </PixelText>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.addCatchInputRow}>
            <View style={[styles.inputFrame, { flex: 1 }]}>
              <TextInput
                style={styles.input}
                value={catchWeight}
                onChangeText={setCatchWeight}
                keyboardType="decimal-pad"
                placeholder="重量(kg)"
                placeholderTextColor={PIXEL_COLORS.hudInactive}
              />
            </View>
            <PixelButton
              title="添加"
              icon="+"
              onPress={addCatch}
              size="small"
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>
      </PixelCard>

      {/* Notes */}
      <PixelCard style={styles.section}>
        <View style={styles.sectionHeader}>
          <PixelText variant="pixel" color={PIXEL_COLORS.hudActive} style={{ fontSize: 10 }}>
            {'▣ '}
          </PixelText>
          <PixelText variant="subtitle">备注</PixelText>
        </View>
        <View style={styles.inputFrame}>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="记录一些心得体会..."
            placeholderTextColor={PIXEL_COLORS.hudInactive}
            multiline
            numberOfLines={4}
          />
        </View>
      </PixelCard>

      {/* Save */}
      <PixelButton title="保存记录" icon="◈" onPress={handleSave} size="large" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIXEL_COLORS.uiBg },
  content: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: PIXEL_COLORS.windowOuter,
  },
  inputFrame: {
    padding: 3,
    backgroundColor: PIXEL_COLORS.windowOuter,
  },
  input: {
    borderWidth: 2,
    borderColor: PIXEL_COLORS.hudBorder,
    backgroundColor: PIXEL_COLORS.hudBg,
    color: PIXEL_COLORS.uiText,
    fontFamily: 'SpaceMono',
    fontSize: 13,
    padding: 10,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  weatherRow: { flexDirection: 'row', gap: 8 },
  weatherBtn: {
    alignItems: 'center',
    padding: 10,
    flex: 1,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.hudBorder,
    backgroundColor: PIXEL_COLORS.hudBg,
    position: 'relative',
    overflow: 'hidden',
  },
  weatherActive: {
    borderColor: PIXEL_COLORS.hudActive,
    backgroundColor: PIXEL_COLORS.hudActive + '15',
  },
  weatherShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: PIXEL_COLORS.hudActive + '66',
  },
  catchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 4,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 1,
    borderColor: PIXEL_COLORS.hudBorder,
  },
  catchDeleteBtn: {
    padding: 4,
    backgroundColor: PIXEL_COLORS.uiDanger + '22',
    borderWidth: 1,
    borderColor: PIXEL_COLORS.uiDanger + '44',
  },
  addCatchRow: { marginTop: 8 },
  fishPicker: { maxHeight: 40, marginBottom: 10 },
  fishOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    borderWidth: 2,
    borderColor: PIXEL_COLORS.hudBorder,
    backgroundColor: PIXEL_COLORS.hudBg,
    position: 'relative',
    overflow: 'hidden',
  },
  fishOptionActive: {
    borderColor: PIXEL_COLORS.hudActive,
    backgroundColor: PIXEL_COLORS.hudActive + '15',
  },
  fishOptionShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: PIXEL_COLORS.hudActive + '66',
  },
  addCatchInputRow: { flexDirection: 'row', alignItems: 'center' },
});
