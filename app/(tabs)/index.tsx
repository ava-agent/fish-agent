import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PIXEL_COLORS } from '../../src/theme/colors';
import { PixelText } from '../../src/components/common/PixelText';
import { PixelButton } from '../../src/components/common/PixelButton';
import { PixelCard } from '../../src/components/common/PixelCard';
import { useGameStore } from '../../src/stores/useGameStore';
import { useFishDexStore } from '../../src/stores/useFishDexStore';
import { FISH_SPECIES } from '../../src/data/fish-species';
import { BAITS } from '../../src/data/baits';
import { FishSpecies } from '../../src/game/types';

const TUTORIAL_SHOWN_KEY = '@fishing_tutorial_shown';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_HEIGHT = SCREEN_HEIGHT - 140;

function PixelSprite({
  data,
  colors,
  pixelSize = 4,
}: {
  data: number[][];
  colors: string[];
  pixelSize?: number;
}) {
  return (
    <View>
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

function WaterWaves() {
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const waves = Array.from({ length: 8 }, (_, i) => {
    const translateX = waveAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [i % 2 === 0 ? -20 : 0, i % 2 === 0 ? 0 : -20],
    });

    return (
      <Animated.View
        key={i}
        style={[
          styles.waveLine,
          {
            top: i * 6,
            opacity: 1 - i * 0.1,
            backgroundColor:
              i < 3 ? PIXEL_COLORS.waterSurface : i < 6 ? PIXEL_COLORS.waterLight : PIXEL_COLORS.waterMid,
            transform: [{ translateX }],
          },
        ]}
      />
    );
  });

  return <View style={styles.waveContainer}>{waves}</View>;
}

function Bobber({ visible, bite }: { visible: boolean; bite: boolean }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const biteAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && !bite) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -6, duration: 1000, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(bounceAnim, { toValue: 6, duration: 1000, useNativeDriver: Platform.OS !== 'web' }),
        ])
      );
      loop.start();
      return () => {
        loop.stop();
        bounceAnim.setValue(0);
      };
    } else {
      bounceAnim.setValue(0);
    }
  }, [visible, bite]);

  useEffect(() => {
    if (bite) {
      Animated.sequence([
        Animated.timing(biteAnim, { toValue: 20, duration: 150, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(biteAnim, { toValue: 5, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(biteAnim, { toValue: 18, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    } else {
      biteAnim.setValue(0);
    }
  }, [bite]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.bobber,
        { transform: [{ translateY: Animated.add(bounceAnim, biteAnim) }] },
      ]}
    >
      <View style={[styles.bobberTop, { backgroundColor: '#FF4444' }]} />
      <View style={[styles.bobberBottom, { backgroundColor: '#FFFFFF' }]} />
      <View style={styles.bobberLine} />
    </Animated.View>
  );
}

function TensionMeter({ tension }: { tension: number }) {
  const color =
    tension < 0.3 ? PIXEL_COLORS.uiInfo
    : tension < 0.7 ? PIXEL_COLORS.uiSuccess
    : tension < 0.85 ? PIXEL_COLORS.uiHighlight
    : PIXEL_COLORS.uiDanger;

  const label =
    tension < 0.15 ? '要跑了！'
    : tension < 0.3 ? '太松'
    : tension < 0.7 ? '完美！'
    : tension < 0.85 ? '危险！'
    : '快断！';

  return (
    <View style={styles.tensionContainer}>
      <PixelText variant="caption" color={PIXEL_COLORS.uiText}>线张力</PixelText>
      <View style={styles.tensionBar}>
        {/* Danger zone - too slack */}
        <View style={[styles.tensionZone, styles.tensionZoneSlack]} />
        {/* Sweet spot zone */}
        <View style={[styles.tensionZone, styles.tensionZoneSweet]} />
        {/* Tension fill */}
        <View style={[styles.tensionFill, { width: `${tension * 100}%`, backgroundColor: color }]} />
      </View>
      <PixelText variant="caption" color={color}>{label}</PixelText>
    </View>
  );
}

function StaminaBar({ stamina }: { stamina: number }) {
  return (
    <View style={styles.staminaContainer}>
      <PixelText variant="caption" color={PIXEL_COLORS.uiText}>鱼体力</PixelText>
      <View style={styles.staminaBar}>
        <View
          style={[
            styles.staminaFill,
            {
              width: `${stamina * 100}%`,
              backgroundColor: stamina > 0.5 ? PIXEL_COLORS.uiSuccess : PIXEL_COLORS.uiDanger,
            },
          ]}
        />
      </View>
      <PixelText variant="caption">{Math.round(stamina * 100)}%</PixelText>
    </View>
  );
}

function BaitSelector({ selectedBait, onSelect }: { selectedBait: string; onSelect: (id: string) => void }) {
  return (
    <View style={styles.baitSelector}>
      <PixelText variant="caption" style={{ marginBottom: 6 }}>选择鱼饵:</PixelText>
      <View style={styles.baitRow}>
        {BAITS.map((bait) => (
          <TouchableOpacity
            key={bait.id}
            onPress={() => onSelect(bait.id)}
            style={[styles.baitItem, selectedBait === bait.id && styles.baitSelected]}
          >
            <PixelSprite data={bait.pixelArt} colors={bait.pixelColors} pixelSize={5} />
            <PixelText
              variant="caption"
              style={{ marginTop: 4, fontSize: 9 }}
              color={selectedBait === bait.id ? PIXEL_COLORS.uiHighlight : PIXEL_COLORS.uiTextDim}
            >
              {bait.nameCn}
            </PixelText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function CatchResultOverlay({
  fish, weight, isNewDiscovery, onContinue,
}: {
  fish: FishSpecies; weight: number; isNewDiscovery: boolean; onContinue: () => void;
}) {
  const rarityColor: Record<string, string> = {
    common: PIXEL_COLORS.uiText,
    uncommon: PIXEL_COLORS.uiInfo,
    rare: PIXEL_COLORS.fishPurple,
    legendary: PIXEL_COLORS.uiHighlight,
  };
  const rarityLabel: Record<string, string> = {
    common: '普通', uncommon: '少见', rare: '珍稀', legendary: '传说',
  };

  return (
    <View style={styles.overlay}>
      <PixelCard style={styles.catchCard}>
        {isNewDiscovery && (
          <View style={styles.newBadge}>
            <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight}>{'★ 新发现！★'}</PixelText>
          </View>
        )}
        <PixelText variant="title" style={{ textAlign: 'center', marginBottom: 12 }}>钓到了！</PixelText>
        <View style={styles.catchFishDisplay}>
          <PixelSprite data={fish.pixelArt} colors={fish.pixelColors} pixelSize={8} />
        </View>
        <PixelText variant="subtitle" style={{ textAlign: 'center', marginTop: 12 }}>{fish.nameCn}</PixelText>
        <PixelText variant="caption" color={rarityColor[fish.rarity]} style={{ textAlign: 'center' }}>
          {rarityLabel[fish.rarity]}
        </PixelText>
        <View style={styles.catchStats}>
          <View style={styles.catchStat}>
            <PixelText variant="caption">重量</PixelText>
            <PixelText variant="subtitle" color={PIXEL_COLORS.uiHighlight}>{weight.toFixed(1)} kg</PixelText>
          </View>
          <View style={styles.catchStat}>
            <PixelText variant="caption">难度</PixelText>
            <PixelText variant="subtitle" color={PIXEL_COLORS.uiHighlight}>{'★'.repeat(fish.difficulty)}</PixelText>
          </View>
        </View>
        <View style={styles.tipBox}>
          <PixelText variant="caption" color={PIXEL_COLORS.uiInfo}>实钓小贴士:</PixelText>
          <PixelText variant="caption" style={{ marginTop: 4 }}>{fish.tip}</PixelText>
        </View>
        <PixelButton title="继续钓鱼" onPress={onContinue} style={{ marginTop: 12 }} />
      </PixelCard>
    </View>
  );
}

function EscapeOverlay({ onContinue }: { onContinue: () => void }) {
  return (
    <View style={styles.overlay}>
      <PixelCard style={styles.escapeCard}>
        <PixelText variant="title" style={{ textAlign: 'center' }}>跑鱼了...</PixelText>
        <PixelText variant="body" style={{ textAlign: 'center', marginVertical: 12 }}>
          鱼挣脱了鱼钩逃走了！{'\n'}下次注意控制张力哦～
        </PixelText>
        <PixelButton title="再来一次" onPress={onContinue} />
      </PixelCard>
    </View>
  );
}

function PowerMeter({ power, active }: { power: number; active: boolean }) {
  if (!active) return null;
  return (
    <View style={styles.powerMeter}>
      <PixelText variant="caption" style={{ marginBottom: 4 }}>力度: {Math.round(power * 100)}%</PixelText>
      <View style={styles.powerBarH}>
        <View
          style={[
            styles.powerFillH,
            {
              width: `${power * 100}%`,
              backgroundColor:
                power < 0.3 ? PIXEL_COLORS.uiInfo
                : power < 0.7 ? PIXEL_COLORS.uiSuccess
                : PIXEL_COLORS.uiHighlight,
            },
          ]}
        />
      </View>
    </View>
  );
}

function TutorialOverlay({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.tutorialOverlay}>
      <View style={styles.tutorialCard}>
        <PixelText variant="title" style={{ marginBottom: 12 }}>钓鱼指南</PixelText>

        <View style={styles.tutorialStep}>
          <PixelText variant="subtitle" color={PIXEL_COLORS.uiHighlight}>1. 选饵</PixelText>
          <PixelText variant="body">点击底部鱼饵按钮选择适合的鱼饵</PixelText>
        </View>

        <View style={styles.tutorialStep}>
          <PixelText variant="subtitle" color={PIXEL_COLORS.uiHighlight}>2. 抛竿</PixelText>
          <PixelText variant="body">按住"按此蓄力抛竿"按钮蓄力，松开抛出</PixelText>
        </View>

        <View style={styles.tutorialStep}>
          <PixelText variant="subtitle" color={PIXEL_COLORS.uiHighlight}>3. 上钩</PixelText>
          <PixelText variant="body">浮漂剧烈晃动时，点击"设钩！"提竿</PixelText>
        </View>

        <View style={styles.tutorialStep}>
          <PixelText variant="subtitle" color={PIXEL_COLORS.uiHighlight}>4. 遛鱼</PixelText>
          <PixelText variant="body">在圆圈内画圈收线，保持张力在绿色区域</PixelText>
          <PixelText variant="caption" color={PIXEL_COLORS.uiTextDim}>太松鱼会跑，太紧线会断！</PixelText>
        </View>

        <PixelButton title="开始钓鱼" onPress={onClose} style={{ marginTop: 16 }} />
      </View>
    </View>
  );
}

export default function FishingScreen() {
  const {
    phase, selectedBait, currentFish, lineTension, fishStamina,
    score, totalCatches, setPhase, selectBait, setCurrentFish,
    updateTension, updateFishStamina, catchFish, fishEscaped, reset, cast,
  } = useGameStore();

  const { discoverFish, isDiscovered } = useFishDexStore();

  const [castPower, setCastPower] = useState(0);
  const [isCasting, setIsCasting] = useState(false);
  const [caughtWeight, setCaughtWeight] = useState(0);
  const [isNewDiscovery, setIsNewDiscovery] = useState(false);
  const [swimmingFish, setSwimmingFish] = useState<
    { fish: FishSpecies; x: number; y: number; dx: number }[]
  >([]);
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if tutorial should be shown
  useEffect(() => {
    AsyncStorage.getItem(TUTORIAL_SHOWN_KEY).then((shown) => {
      if (!shown) {
        setShowTutorial(true);
      }
    });
  }, []);

  const closeTutorial = useCallback(() => {
    setShowTutorial(false);
    AsyncStorage.setItem(TUTORIAL_SHOWN_KEY, 'true');
  }, []);

  const powerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameLoop = useRef<ReturnType<typeof setInterval> | null>(null);
  const biteTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hookTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const powerDir = useRef(1);
  const castPowerRef = useRef(0);

  useEffect(() => {
    // Show all 12 fish species swimming in the water
    const fish = FISH_SPECIES.map((f) => ({
      fish: f,
      x: Math.random() * (SCREEN_WIDTH - 60),
      y: GAME_HEIGHT * 0.55 + Math.random() * (GAME_HEIGHT * 0.35),
      dx: (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.4),
    }));
    setSwimmingFish(fish);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSwimmingFish((prev) =>
        prev.map((sf) => {
          let newX = sf.x + sf.dx;
          let newDx = sf.dx;
          if (newX < -40 || newX > SCREEN_WIDTH + 10) {
            newDx = -newDx;
            newX = sf.x + newDx;
          }
          return { ...sf, x: newX, dx: newDx };
        })
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const startCasting = useCallback(() => {
    setIsCasting(true);
    setPhase('casting');
    setCastPower(0);
    castPowerRef.current = 0;
    powerDir.current = 1;
    powerInterval.current = setInterval(() => {
      setCastPower((prev) => {
        let next = prev + powerDir.current * 0.02;
        if (next >= 1) { next = 1; powerDir.current = -1; }
        else if (next <= 0) { next = 0; powerDir.current = 1; }
        castPowerRef.current = next;
        return next;
      });
    }, 16);
  }, [setPhase]);

  const releaseCast = useCallback(() => {
    if (powerInterval.current) { clearInterval(powerInterval.current); powerInterval.current = null; }
    setIsCasting(false);
    const power = castPowerRef.current;
    cast(power);

    const baitObj = BAITS.find((b) => b.id === selectedBait);
    const baseWait = 3000 + Math.random() * 5000;

    biteTimeout.current = setTimeout(() => {
      const candidates = FISH_SPECIES.filter((fish) => {
        const effectiveness = baitObj?.effectiveness[fish.id] ?? 0.1;
        return Math.random() < effectiveness;
      });

      if (candidates.length > 0) {
        const fish = candidates[Math.floor(Math.random() * candidates.length)];
        setCurrentFish(fish);
        setPhase('bite');
        hookTimeout.current = setTimeout(() => {
          if (useGameStore.getState().phase === 'bite') fishEscaped();
        }, 2500);
      } else {
        // No fish attracted - show feedback then reset
        setPhase('no_bite');
        setTimeout(() => {
          if (useGameStore.getState().phase === 'no_bite') {
            setPhase('idle');
          }
        }, 2000);
      }
    }, baseWait * 0.8);
  }, [selectedBait, cast, setPhase, setCurrentFish, fishEscaped]);

  const handleHookSet = useCallback(() => {
    if (phase !== 'bite') return;
    if (hookTimeout.current) { clearTimeout(hookTimeout.current); hookTimeout.current = null; }
    setPhase('fighting');

    gameLoop.current = setInterval(() => {
      const state = useGameStore.getState();
      if (state.phase !== 'fighting') {
        if (gameLoop.current) clearInterval(gameLoop.current);
        return;
      }
      const fish = state.currentFish;
      if (!fish) return;

      // Fish pulls based on strength and remaining stamina (random bursts)
      const fishPull = fish.fightStrength * state.fishStamina * (0.3 + Math.random() * 0.7);
      const reelPull = state.reelSpeed * 0.8;

      // Tension increases with reeling, decreases from fish pulling and natural slack
      // Without reeling: tension drops (line goes slack → fish escapes)
      // With reeling: tension rises (too much → line breaks)
      const tensionDelta = (reelPull - fishPull * 0.4) * 0.15;
      // Natural decay toward 0 (slack) — must actively reel to maintain tension
      const slackDecay = -state.lineTension * 0.03;
      const newTension = Math.max(0, Math.min(1, state.lineTension + tensionDelta + slackDecay));
      updateTension(newTension);

      // Stamina drains only when tension is in the sweet spot (0.3-0.7)
      let staminaDrain = 0;
      if (newTension >= 0.3 && newTension <= 0.7) {
        // Perfect zone: maximum drain
        staminaDrain = 0.02 * (1 + fish.difficulty * 0.1);
      } else if (newTension > 0.7 && newTension < 0.85) {
        // High tension: some drain but risky
        staminaDrain = 0.01;
      }
      // Below 0.3 or above 0.85: no stamina drain (fish rests or line about to break)

      updateFishStamina(state.fishStamina - staminaDrain);

      if (state.fishStamina - staminaDrain <= 0) {
        if (gameLoop.current) clearInterval(gameLoop.current);
        const weight = fish.minWeight + Math.random() * (fish.maxWeight - fish.minWeight);
        setCaughtWeight(Math.round(weight * 10) / 10);
        setIsNewDiscovery(!isDiscovered(fish.id));
        discoverFish(fish.id, weight);
        catchFish();
      } else if (newTension >= 1) {
        // Line breaks!
        if (gameLoop.current) clearInterval(gameLoop.current);
        fishEscaped();
      } else if (newTension <= 0.1 && state.reelSpeed < 0.1) {
        // Line too slack and not reeling — fish unhooks
        if (gameLoop.current) clearInterval(gameLoop.current);
        fishEscaped();
      }
    }, 100);
  }, [phase, setPhase, updateTension, updateFishStamina, catchFish, fishEscaped, discoverFish, isDiscovered]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (useGameStore.getState().phase === 'fighting') {
          useGameStore.setState({ reelSpeed: 0.4 });
        }
      },
      onPanResponderMove: (_, gesture) => {
        if (useGameStore.getState().phase === 'fighting') {
          // Speed based on finger movement velocity — faster swipes = faster reeling
          const speed = Math.min(1, Math.sqrt(gesture.vx ** 2 + gesture.vy ** 2) * 0.4 + 0.2);
          useGameStore.setState({ reelSpeed: speed });
        }
      },
      onPanResponderRelease: () => {
        useGameStore.setState({ reelSpeed: 0 });
      },
      onPanResponderTerminate: () => {
        useGameStore.setState({ reelSpeed: 0 });
      },
    })
  ).current;

  useEffect(() => {
    return () => {
      if (powerInterval.current) clearInterval(powerInterval.current);
      if (gameLoop.current) clearInterval(gameLoop.current);
      if (biteTimeout.current) clearTimeout(biteTimeout.current);
      if (hookTimeout.current) clearTimeout(hookTimeout.current);
    };
  }, []);

  const handleContinue = useCallback(() => {
    if (biteTimeout.current) clearTimeout(biteTimeout.current);
    if (hookTimeout.current) clearTimeout(hookTimeout.current);
    if (gameLoop.current) clearInterval(gameLoop.current);
    reset();
  }, [reset]);

  return (
    <View style={styles.container}>
      <View style={styles.gameScene}>
        {/* Sky */}
        <View style={styles.sky}>
          <View style={styles.sun} />
          <View style={[styles.cloud, { top: 30, left: 40 }]} />
          <View style={[styles.cloud, { top: 50, left: SCREEN_WIDTH - 100 }]} />
        </View>

        {/* Shore */}
        <View style={styles.shore}>
          {Array.from({ length: 6 }, (_, i) => (
            <View key={i} style={[styles.tree, { left: i * 70 + 10 }]}>
              <View style={styles.treeTop} />
              <View style={styles.treeTrunk} />
            </View>
          ))}
        </View>

        {/* Water */}
        <View style={styles.water}>
          <WaterWaves />
          {swimmingFish.map((sf, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: sf.x,
                top: sf.y - GAME_HEIGHT * 0.45,
                opacity: 0.6,
                transform: [{ scaleX: sf.dx > 0 ? 1 : -1 }],
              }}
            >
              <PixelSprite data={sf.fish.pixelArt} colors={sf.fish.pixelColors} pixelSize={3} />
            </View>
          ))}
          <View style={styles.bobberArea}>
            <Bobber visible={phase === 'waiting' || phase === 'bite'} bite={phase === 'bite'} />
          </View>
        </View>

        {/* Rod */}
        <View style={styles.rod}>
          <View style={styles.rodLine} />
          <View style={styles.rodBody} />
          <View style={styles.rodHandle} />
        </View>
      </View>

      {/* UI */}
      <SafeAreaView style={styles.uiOverlay}>
        <View style={styles.scoreBar}>
          <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight}>得分: {score}</PixelText>
          <PixelText variant="pixel" color={PIXEL_COLORS.uiText}>钓获: {totalCatches}</PixelText>
        </View>

        {phase === 'idle' && (
          <View style={styles.bottomUI}>
            <BaitSelector selectedBait={selectedBait} onSelect={selectBait} />
            <PixelButton title="按此蓄力抛竿" onPress={startCasting} size="large" style={{ marginTop: 8 }} />
          </View>
        )}

        {phase === 'casting' && (
          <View style={styles.bottomUI}>
            <PowerMeter power={castPower} active={isCasting} />
            <PixelButton title="松手抛竿！" onPress={releaseCast} variant="secondary" size="large" style={{ marginTop: 8 }} />
          </View>
        )}

        {phase === 'waiting' && (
          <View style={styles.centerMessage}>
            <PixelText variant="subtitle" color={PIXEL_COLORS.uiText}>等待鱼上钩...</PixelText>
            <PixelText variant="caption" style={{ marginTop: 4 }}>耐心等待浮漂信号</PixelText>
          </View>
        )}

        {phase === 'no_bite' && (
          <View style={styles.centerMessage}>
            <PixelText variant="subtitle" color={PIXEL_COLORS.uiTextDim}>没有鱼上钩...</PixelText>
            <PixelText variant="caption" style={{ marginTop: 4 }}>换个鱼饵试试？</PixelText>
          </View>
        )}

        {phase === 'bite' && (
          <TouchableOpacity style={styles.biteOverlay} onPress={handleHookSet} activeOpacity={0.8}>
            <View style={styles.biteAlert}>
              <PixelText variant="title" color={PIXEL_COLORS.uiHighlight} style={{ fontSize: 28, textAlign: 'center' }}>
                ！上钩了！
              </PixelText>
              <PixelText variant="subtitle" color={PIXEL_COLORS.uiDanger} style={{ textAlign: 'center', marginTop: 8 }}>
                快点击屏幕提竿！
              </PixelText>
            </View>
          </TouchableOpacity>
        )}

        {phase === 'fighting' && (
          <View style={styles.fightUI} {...panResponder.panHandlers}>
            <TensionMeter tension={lineTension} />
            <StaminaBar stamina={fishStamina} />
            {currentFish && (
              <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight} style={{ textAlign: 'center', marginTop: 4 }}>
                正在遛: {currentFish.nameCn}
              </PixelText>
            )}
            <View style={styles.reelArea}>
              <PixelText variant="caption" style={{ textAlign: 'center' }}>在此区域滑动手指收线</PixelText>
              <View style={styles.reelCircle}>
                <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight}>收线</PixelText>
              </View>
            </View>
          </View>
        )}

        {phase === 'caught' && currentFish && (
          <CatchResultOverlay fish={currentFish} weight={caughtWeight} isNewDiscovery={isNewDiscovery} onContinue={handleContinue} />
        )}
        {phase === 'escaped' && <EscapeOverlay onContinue={handleContinue} />}

        {/* Tutorial overlay for new players */}
        {showTutorial && <TutorialOverlay onClose={closeTutorial} />}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIXEL_COLORS.skyTop },
  gameScene: { flex: 1 },
  sky: { height: '30%', backgroundColor: PIXEL_COLORS.skyBottom },
  sun: {
    position: 'absolute', right: 50, top: 30, width: 40, height: 40,
    backgroundColor: PIXEL_COLORS.sunGlow,
    boxShadow: `0px 0px 20px ${PIXEL_COLORS.sunGlow}CC`,
  },
  cloud: { position: 'absolute', width: 60, height: 20, backgroundColor: '#FFFFFF88' },
  shore: { height: 50, backgroundColor: PIXEL_COLORS.envGrass, flexDirection: 'row', overflow: 'hidden' },
  tree: { position: 'absolute', alignItems: 'center', bottom: 0 },
  treeTop: { width: 24, height: 24, backgroundColor: PIXEL_COLORS.envGrass, borderWidth: 2, borderColor: '#3A6A1E' },
  treeTrunk: { width: 6, height: 16, backgroundColor: PIXEL_COLORS.envWood },
  water: { flex: 1, backgroundColor: PIXEL_COLORS.waterDeep, position: 'relative', overflow: 'hidden' },
  waveContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: 50 },
  waveLine: { position: 'absolute', left: -20, width: SCREEN_WIDTH + 40, height: 4 },
  bobberArea: { position: 'absolute', top: 20, left: '60%' },
  bobber: { alignItems: 'center' },
  bobberTop: { width: 8, height: 12 },
  bobberBottom: { width: 8, height: 8 },
  bobberLine: { width: 2, height: 30, backgroundColor: '#FFFFFF44' },
  rod: { position: 'absolute', right: 20, top: '25%', alignItems: 'flex-end' },
  rodBody: { width: 4, height: 120, backgroundColor: PIXEL_COLORS.envWood, transform: [{ rotate: '-30deg' }] },
  rodHandle: { width: 8, height: 20, backgroundColor: '#333', marginTop: -4 },
  rodLine: { position: 'absolute', width: 1, height: 160, backgroundColor: '#FFFFFF44', right: 2, top: -20, transform: [{ rotate: '15deg' }] },
  uiOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  scoreBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 16, paddingBottom: 8 },
  bottomUI: { position: 'absolute', bottom: 80, left: 16, right: 16 },
  baitSelector: { backgroundColor: PIXEL_COLORS.uiBg + 'DD', padding: 12, borderWidth: 2, borderColor: PIXEL_COLORS.uiBorder },
  baitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  baitItem: { alignItems: 'center', padding: 8, minWidth: 50, borderWidth: 2, borderColor: 'transparent' },
  baitSelected: { borderColor: PIXEL_COLORS.uiHighlight, backgroundColor: PIXEL_COLORS.uiHighlight + '20' },
  powerMeter: { alignItems: 'center', backgroundColor: PIXEL_COLORS.uiBg + 'DD', padding: 12, borderWidth: 2, borderColor: PIXEL_COLORS.uiBorder },
  powerBarH: { width: '100%', height: 20, backgroundColor: PIXEL_COLORS.uiBg, borderWidth: 2, borderColor: PIXEL_COLORS.uiBorder, overflow: 'hidden' },
  powerFillH: { height: '100%' },
  centerMessage: { position: 'absolute', top: '40%', left: 0, right: 0, alignItems: 'center', backgroundColor: PIXEL_COLORS.uiBg + 'AA', padding: 16, marginHorizontal: 40, borderWidth: 2, borderColor: PIXEL_COLORS.uiBorder },
  biteOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  biteAlert: { backgroundColor: PIXEL_COLORS.uiBg + 'EE', padding: 32, borderWidth: 4, borderColor: PIXEL_COLORS.uiHighlight },
  fightUI: { position: 'absolute', bottom: 80, left: 16, right: 16, backgroundColor: PIXEL_COLORS.uiBg + 'DD', padding: 12, borderWidth: 2, borderColor: PIXEL_COLORS.uiBorder },
  tensionContainer: { marginBottom: 8 },
  tensionBar: { width: '100%', height: 16, backgroundColor: PIXEL_COLORS.uiBg, borderWidth: 2, borderColor: PIXEL_COLORS.uiBorder, marginVertical: 4, overflow: 'hidden', position: 'relative' },
  tensionFill: { height: '100%' },
  tensionZone: {
    position: 'absolute',
    height: '100%',
  },
  tensionZoneSlack: {
    left: 0,
    width: '15%',
    backgroundColor: PIXEL_COLORS.uiInfo + '33',
    borderRightWidth: 1,
    borderColor: PIXEL_COLORS.uiInfo,
  },
  tensionZoneSweet: {
    left: '30%',
    width: '40%',
    backgroundColor: PIXEL_COLORS.uiSuccess + '22',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: PIXEL_COLORS.uiSuccess,
  },
  staminaContainer: { marginBottom: 4 },
  staminaBar: { width: '100%', height: 12, backgroundColor: PIXEL_COLORS.uiBg, borderWidth: 2, borderColor: PIXEL_COLORS.uiBorder, marginVertical: 4, overflow: 'hidden' },
  staminaFill: { height: '100%' },
  reelArea: { marginTop: 12, alignItems: 'center' },
  reelCircle: { width: 80, height: 80, borderWidth: 3, borderColor: PIXEL_COLORS.uiHighlight, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088', padding: 20 },
  catchCard: { width: '100%', maxWidth: 340, backgroundColor: PIXEL_COLORS.uiPanel },
  escapeCard: { width: '100%', maxWidth: 300, backgroundColor: PIXEL_COLORS.uiPanel, alignItems: 'center', padding: 24 },
  catchFishDisplay: { alignItems: 'center', justifyContent: 'center', height: 100, backgroundColor: PIXEL_COLORS.waterDeep + '44', marginTop: 8 },
  newBadge: { alignItems: 'center', marginBottom: 8 },
  catchStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, paddingVertical: 8, borderTopWidth: 2, borderTopColor: PIXEL_COLORS.uiBorder },
  catchStat: { alignItems: 'center' },
  tipBox: { marginTop: 8, padding: 8, backgroundColor: PIXEL_COLORS.uiBg, borderWidth: 1, borderColor: PIXEL_COLORS.uiInfo + '44' },
  tutorialOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000AA', padding: 20 },
  tutorialCard: { width: '100%', maxWidth: 340, backgroundColor: PIXEL_COLORS.uiPanel, padding: 20, borderWidth: 4, borderColor: PIXEL_COLORS.uiHighlight },
  tutorialStep: { marginBottom: 12, paddingLeft: 8, borderLeftWidth: 3, borderLeftColor: PIXEL_COLORS.uiHighlight },
});
