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
import { PixelSprite } from '../../src/components/common/PixelSprite';
import { useGameStore } from '../../src/stores/useGameStore';
import { useFishDexStore } from '../../src/stores/useFishDexStore';
import { FISH_SPECIES } from '../../src/data/fish-species';
import { BAITS } from '../../src/data/baits';
import { FishSpecies } from '../../src/game/types';

const TUTORIAL_SHOWN_KEY = '@fishing_tutorial_shown';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_HEIGHT = SCREEN_HEIGHT - 140;

// Pixel star positions for sky decoration
const STARS = Array.from({ length: 12 }, () => ({
  x: Math.random() * SCREEN_WIDTH,
  y: Math.random() * (GAME_HEIGHT * 0.25),
  size: Math.random() > 0.7 ? 3 : 2,
  opacity: 0.3 + Math.random() * 0.7,
}));

function PixelStar({ x, y, size, opacity }: { x: number; y: number; size: number; opacity: number }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        backgroundColor: PIXEL_COLORS.starColor,
        opacity,
      }}
    />
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

  const waves = Array.from({ length: 10 }, (_, i) => {
    const translateX = waveAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [i % 2 === 0 ? -24 : 0, i % 2 === 0 ? 0 : -24],
    });

    const color =
      i < 2 ? PIXEL_COLORS.waterFoam
      : i < 4 ? PIXEL_COLORS.waterSurface
      : i < 7 ? PIXEL_COLORS.waterLight
      : PIXEL_COLORS.waterMid;

    return (
      <Animated.View
        key={i}
        style={[
          styles.waveLine,
          {
            top: i * 5,
            opacity: i < 2 ? 0.4 : 1 - i * 0.08,
            backgroundColor: color,
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
      <View style={styles.bobberTop} />
      <View style={styles.bobberMid} />
      <View style={styles.bobberBottom} />
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
    tension < 0.15 ? '!! 要跑了 !!'
    : tension < 0.3 ? '- 太松 -'
    : tension < 0.7 ? '>>> 完美 <<<'
    : tension < 0.85 ? '! 危险 !'
    : '!!! 快断 !!!';

  return (
    <View style={styles.tensionContainer}>
      <View style={styles.meterHeader}>
        <PixelText variant="pixel" color={PIXEL_COLORS.uiText}>线张力</PixelText>
        <PixelText variant="pixel" color={color}>{label}</PixelText>
      </View>
      <View style={styles.tensionBar}>
        <View style={[styles.tensionZone, styles.tensionZoneSlack]} />
        <View style={[styles.tensionZone, styles.tensionZoneSweet]} />
        <View style={[styles.tensionFill, { width: `${tension * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function StaminaBar({ stamina }: { stamina: number }) {
  return (
    <View style={styles.staminaContainer}>
      <View style={styles.meterHeader}>
        <PixelText variant="pixel" color={PIXEL_COLORS.uiText}>鱼体力</PixelText>
        <PixelText variant="pixel" color={stamina > 0.5 ? PIXEL_COLORS.uiSuccess : PIXEL_COLORS.uiDanger}>
          {Math.round(stamina * 100)}%
        </PixelText>
      </View>
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
    </View>
  );
}

function BaitSelector({ selectedBait, onSelect }: { selectedBait: string; onSelect: (id: string) => void }) {
  return (
    <View style={styles.baitSelector}>
      <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight} style={{ marginBottom: 8 }}>
        [ 选择鱼饵 ]
      </PixelText>
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
            {selectedBait === bait.id && (
              <View style={styles.baitArrow}>
                <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight} style={{ fontSize: 8 }}>
                  {'▼'}
                </PixelText>
              </View>
            )}
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
    common: PIXEL_COLORS.rarityCommon,
    uncommon: PIXEL_COLORS.rarityUncommon,
    rare: PIXEL_COLORS.rarityRare,
    legendary: PIXEL_COLORS.rarityLegendary,
  };
  const rarityLabel: Record<string, string> = {
    common: '普通', uncommon: '少见', rare: '珍稀', legendary: '传说',
  };

  return (
    <View style={styles.overlay}>
      <PixelCard style={styles.catchCard}>
        {isNewDiscovery && (
          <View style={styles.newBadge}>
            <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight}>
              {'★★★ 新发现！★★★'}
            </PixelText>
          </View>
        )}
        <PixelText variant="title" color={PIXEL_COLORS.uiHighlight} style={{ textAlign: 'center', marginBottom: 12 }}>
          - 钓到了！-
        </PixelText>
        <View style={styles.catchFishDisplay}>
          <PixelSprite data={fish.pixelArt} colors={fish.pixelColors} pixelSize={8} />
        </View>
        <PixelText variant="subtitle" style={{ textAlign: 'center', marginTop: 12 }}>{fish.nameCn}</PixelText>
        <PixelText variant="caption" color={rarityColor[fish.rarity]} style={{ textAlign: 'center', marginTop: 2 }}>
          [{rarityLabel[fish.rarity]}]
        </PixelText>
        <View style={styles.catchStats}>
          <View style={styles.catchStat}>
            <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim}>重量</PixelText>
            <PixelText variant="subtitle" color={PIXEL_COLORS.uiHighlight}>{weight.toFixed(1)} kg</PixelText>
          </View>
          <View style={styles.catchStatDivider} />
          <View style={styles.catchStat}>
            <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim}>难度</PixelText>
            <PixelText variant="subtitle" color={PIXEL_COLORS.uiHighlight}>{'★'.repeat(fish.difficulty)}</PixelText>
          </View>
        </View>
        <View style={styles.tipBox}>
          <PixelText variant="pixel" color={PIXEL_COLORS.uiInfo}>实钓小贴士:</PixelText>
          <PixelText variant="caption" style={{ marginTop: 4 }}>{fish.tip}</PixelText>
        </View>
        <PixelButton title="继续钓鱼" onPress={onContinue} style={{ marginTop: 12 }} icon="▸" />
      </PixelCard>
    </View>
  );
}

function EscapeOverlay({ onContinue }: { onContinue: () => void }) {
  return (
    <View style={styles.overlay}>
      <PixelCard style={styles.escapeCard}>
        <PixelText variant="title" color={PIXEL_COLORS.uiDanger} style={{ textAlign: 'center' }}>
          - 跑鱼了 -
        </PixelText>
        <PixelText variant="body" style={{ textAlign: 'center', marginVertical: 12 }}>
          鱼挣脱了鱼钩逃走了！{'\n'}下次注意控制张力哦
        </PixelText>
        <PixelButton title="再来一次" onPress={onContinue} variant="secondary" icon="▸" />
      </PixelCard>
    </View>
  );
}

function PowerMeter({ power, active }: { power: number; active: boolean }) {
  if (!active) return null;

  const color =
    power < 0.3 ? PIXEL_COLORS.uiInfo
    : power < 0.7 ? PIXEL_COLORS.uiSuccess
    : PIXEL_COLORS.uiHighlight;

  return (
    <View style={styles.powerMeter}>
      <View style={styles.meterHeader}>
        <PixelText variant="pixel" color={PIXEL_COLORS.uiText}>蓄力</PixelText>
        <PixelText variant="pixel" color={color}>{Math.round(power * 100)}%</PixelText>
      </View>
      <View style={styles.powerBarH}>
        <View style={[styles.powerFillH, { width: `${power * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function TutorialOverlay({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.tutorialOverlay}>
      <PixelCard style={styles.tutorialCard}>
        <PixelText variant="title" color={PIXEL_COLORS.uiHighlight} style={{ textAlign: 'center', marginBottom: 16 }}>
          {'=== 钓鱼指南 ==='}
        </PixelText>

        <View style={styles.tutorialStep}>
          <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight}>{'[1]'} 选饵</PixelText>
          <PixelText variant="body">点击底部鱼饵按钮选择适合的鱼饵</PixelText>
        </View>

        <View style={styles.tutorialStep}>
          <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight}>{'[2]'} 抛竿</PixelText>
          <PixelText variant="body">按住蓄力按钮，松开抛出</PixelText>
        </View>

        <View style={styles.tutorialStep}>
          <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight}>{'[3]'} 上钩</PixelText>
          <PixelText variant="body">浮漂剧烈晃动时，点击屏幕提竿</PixelText>
        </View>

        <View style={styles.tutorialStep}>
          <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight}>{'[4]'} 遛鱼</PixelText>
          <PixelText variant="body">在圆圈内画圈收线，保持张力在绿色区域</PixelText>
          <PixelText variant="caption" color={PIXEL_COLORS.uiDanger}>太松鱼会跑，太紧线会断！</PixelText>
        </View>

        <PixelButton title="开始钓鱼" onPress={onClose} style={{ marginTop: 16 }} icon="▸" />
      </PixelCard>
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

      const fishPull = fish.fightStrength * state.fishStamina * (0.3 + Math.random() * 0.7);
      const reelPull = state.reelSpeed * 0.8;
      const tensionDelta = (reelPull - fishPull * 0.4) * 0.15;
      const slackDecay = -state.lineTension * 0.03;
      const newTension = Math.max(0, Math.min(1, state.lineTension + tensionDelta + slackDecay));
      updateTension(newTension);

      let staminaDrain = 0;
      if (newTension >= 0.3 && newTension <= 0.7) {
        staminaDrain = 0.02 * (1 + fish.difficulty * 0.1);
      } else if (newTension > 0.7 && newTension < 0.85) {
        staminaDrain = 0.01;
      }

      updateFishStamina(state.fishStamina - staminaDrain);

      if (state.fishStamina - staminaDrain <= 0) {
        if (gameLoop.current) clearInterval(gameLoop.current);
        const weight = fish.minWeight + Math.random() * (fish.maxWeight - fish.minWeight);
        setCaughtWeight(Math.round(weight * 10) / 10);
        setIsNewDiscovery(!isDiscovered(fish.id));
        discoverFish(fish.id, weight);
        catchFish();
      } else if (newTension >= 1) {
        if (gameLoop.current) clearInterval(gameLoop.current);
        fishEscaped();
      } else if (newTension <= 0.1 && state.reelSpeed < 0.1) {
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
        {/* Sky with gradient layers */}
        <View style={styles.sky}>
          <View style={styles.skyGradTop} />
          <View style={styles.skyGradMid} />
          <View style={styles.skyGradBot} />
          {/* Stars */}
          {STARS.map((star, i) => (
            <PixelStar key={i} {...star} />
          ))}
          {/* Sun */}
          <View style={styles.sun}>
            <View style={styles.sunCore} />
            <View style={styles.sunGlow} />
          </View>
          {/* Clouds */}
          <View style={[styles.cloud, { top: 25, left: 30 }]}>
            <View style={styles.cloudBlock} />
            <View style={[styles.cloudBlock, { width: 28, marginTop: -6, marginLeft: 8 }]} />
          </View>
          <View style={[styles.cloud, { top: 45, left: SCREEN_WIDTH - 110 }]}>
            <View style={[styles.cloudBlock, { width: 24 }]} />
            <View style={[styles.cloudBlock, { width: 32, marginTop: -6, marginLeft: 4 }]} />
          </View>
        </View>

        {/* Shore with layered grass */}
        <View style={styles.shore}>
          <View style={styles.grassTop} />
          <View style={styles.grassBody}>
            {Array.from({ length: 7 }, (_, i) => (
              <View key={i} style={[styles.tree, { left: i * 60 + 5 }]}>
                <View style={styles.treeCanopy}>
                  <View style={styles.treeCanopyTop} />
                  <View style={styles.treeCanopyMid} />
                </View>
                <View style={styles.treeTrunk} />
              </View>
            ))}
          </View>
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
                opacity: 0.5,
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
          <View style={styles.rodTip} />
          <View style={styles.rodBody} />
          <View style={styles.rodHandle} />
        </View>
      </View>

      {/* HUD Overlay */}
      <SafeAreaView style={styles.uiOverlay}>
        {/* Score HUD - top bar */}
        <View style={styles.scoreBar}>
          <View style={styles.scoreItem}>
            <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim}>得分</PixelText>
            <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight}>{score}</PixelText>
          </View>
          <View style={styles.scoreItem}>
            <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim}>钓获</PixelText>
            <PixelText variant="pixel" color={PIXEL_COLORS.uiText}>{totalCatches}</PixelText>
          </View>
        </View>

        {phase === 'idle' && (
          <View style={styles.bottomUI}>
            <BaitSelector selectedBait={selectedBait} onSelect={selectBait} />
            <PixelButton title="按此蓄力抛竿" onPress={startCasting} size="large" style={{ marginTop: 8 }} icon="▸" />
          </View>
        )}

        {phase === 'casting' && (
          <View style={styles.bottomUI}>
            <PowerMeter power={castPower} active={isCasting} />
            <PixelButton title="松手抛竿！" onPress={releaseCast} variant="secondary" size="large" style={{ marginTop: 8 }} icon="▸" />
          </View>
        )}

        {phase === 'waiting' && (
          <View style={styles.centerMessage}>
            <PixelText variant="pixel" color={PIXEL_COLORS.uiText}>等待鱼上钩 ...</PixelText>
            <PixelText variant="caption" style={{ marginTop: 4 }}>耐心等待浮漂信号</PixelText>
          </View>
        )}

        {phase === 'no_bite' && (
          <View style={styles.centerMessage}>
            <PixelText variant="pixel" color={PIXEL_COLORS.uiTextDim}>没有鱼上钩...</PixelText>
            <PixelText variant="caption" style={{ marginTop: 4 }}>换个鱼饵试试？</PixelText>
          </View>
        )}

        {phase === 'bite' && (
          <TouchableOpacity style={styles.biteOverlay} onPress={handleHookSet} activeOpacity={0.8}>
            <View style={styles.biteAlert}>
              <PixelText variant="title" color={PIXEL_COLORS.uiHighlight} style={{ fontSize: 28, textAlign: 'center' }}>
                ！上钩了！
              </PixelText>
              <PixelText variant="pixel" color={PIXEL_COLORS.uiDanger} style={{ textAlign: 'center', marginTop: 8 }}>
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
                <View style={styles.reelInner}>
                  <PixelText variant="pixel" color={PIXEL_COLORS.uiHighlight}>收线</PixelText>
                </View>
              </View>
            </View>
          </View>
        )}

        {phase === 'caught' && currentFish && (
          <CatchResultOverlay fish={currentFish} weight={caughtWeight} isNewDiscovery={isNewDiscovery} onContinue={handleContinue} />
        )}
        {phase === 'escaped' && <EscapeOverlay onContinue={handleContinue} />}

        {showTutorial && <TutorialOverlay onClose={closeTutorial} />}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIXEL_COLORS.skyTop },
  gameScene: { flex: 1 },

  // Sky - layered gradient
  sky: { height: '30%', position: 'relative', overflow: 'hidden' },
  skyGradTop: { flex: 1, backgroundColor: PIXEL_COLORS.skyTop },
  skyGradMid: { flex: 1, backgroundColor: PIXEL_COLORS.skyMid },
  skyGradBot: { flex: 1, backgroundColor: PIXEL_COLORS.skyBottom },
  sun: { position: 'absolute', right: 40, top: 20 },
  sunCore: { width: 32, height: 32, backgroundColor: PIXEL_COLORS.sunGlow },
  sunGlow: {
    position: 'absolute', top: -8, left: -8, width: 48, height: 48,
    backgroundColor: PIXEL_COLORS.sunGlow + '33',
  },
  cloud: { position: 'absolute' },
  cloudBlock: { width: 20, height: 12, backgroundColor: '#FFFFFF55' },

  // Shore - layered grass
  shore: { height: 55, overflow: 'hidden' },
  grassTop: { height: 4, backgroundColor: PIXEL_COLORS.envGrassLight },
  grassBody: {
    flex: 1, backgroundColor: PIXEL_COLORS.envGrass,
    flexDirection: 'row', overflow: 'hidden',
    borderBottomWidth: 3, borderBottomColor: PIXEL_COLORS.envDirt,
  },
  tree: { position: 'absolute', alignItems: 'center', bottom: 0 },
  treeCanopy: { alignItems: 'center' },
  treeCanopyTop: { width: 16, height: 10, backgroundColor: PIXEL_COLORS.envGrassDark },
  treeCanopyMid: { width: 24, height: 12, backgroundColor: PIXEL_COLORS.envGrass, marginTop: -2 },
  treeTrunk: { width: 6, height: 14, backgroundColor: PIXEL_COLORS.envWoodDark },

  // Water
  water: { flex: 1, backgroundColor: PIXEL_COLORS.waterDeep, position: 'relative', overflow: 'hidden' },
  waveContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: 55 },
  waveLine: { position: 'absolute', left: -24, width: SCREEN_WIDTH + 48, height: 3 },

  // Bobber
  bobberArea: { position: 'absolute', top: 20, left: '60%' },
  bobber: { alignItems: 'center' },
  bobberTop: { width: 8, height: 10, backgroundColor: '#FF2222' },
  bobberMid: { width: 10, height: 3, backgroundColor: '#FFFFFF' },
  bobberBottom: { width: 8, height: 8, backgroundColor: '#EEEEEE' },
  bobberLine: { width: 2, height: 30, backgroundColor: '#FFFFFF33' },

  // Rod
  rod: { position: 'absolute', right: 16, top: '22%', alignItems: 'flex-end' },
  rodTip: { width: 2, height: 8, backgroundColor: '#FF4444', marginRight: 1 },
  rodBody: { width: 4, height: 120, backgroundColor: PIXEL_COLORS.envWood, transform: [{ rotate: '-30deg' }] },
  rodHandle: { width: 8, height: 22, backgroundColor: '#222', marginTop: -4, borderWidth: 1, borderColor: '#444' },
  rodLine: { position: 'absolute', width: 1, height: 160, backgroundColor: '#FFFFFF33', right: 2, top: -20, transform: [{ rotate: '15deg' }] },

  // HUD
  uiOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  scoreBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingTop: Platform.OS === 'ios' ? 50 : 12, paddingBottom: 6,
    backgroundColor: PIXEL_COLORS.hudBg + 'BB',
    borderBottomWidth: 2, borderBottomColor: PIXEL_COLORS.hudBorder + '66',
  },
  scoreItem: { flexDirection: 'row', gap: 6, alignItems: 'center' },

  // Bottom UI
  bottomUI: { position: 'absolute', bottom: 80, left: 12, right: 12 },
  baitSelector: {
    backgroundColor: PIXEL_COLORS.hudBg + 'EE', padding: 12,
    borderWidth: 3, borderColor: PIXEL_COLORS.windowOuter,
  },
  baitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  baitItem: {
    alignItems: 'center', padding: 8, minWidth: 48,
    borderWidth: 2, borderColor: PIXEL_COLORS.hudInactive,
    backgroundColor: PIXEL_COLORS.uiPanel + '88',
  },
  baitSelected: {
    borderColor: PIXEL_COLORS.uiHighlight,
    backgroundColor: PIXEL_COLORS.uiHighlight + '18',
  },
  baitArrow: { position: 'absolute', top: -10 },

  // Power meter
  powerMeter: {
    backgroundColor: PIXEL_COLORS.hudBg + 'EE', padding: 12,
    borderWidth: 3, borderColor: PIXEL_COLORS.windowOuter,
  },
  meterHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  powerBarH: {
    width: '100%', height: 16,
    backgroundColor: PIXEL_COLORS.hudBg, borderWidth: 2, borderColor: PIXEL_COLORS.hudBorder,
    overflow: 'hidden',
  },
  powerFillH: { height: '100%' },

  // Center messages
  centerMessage: {
    position: 'absolute', top: '40%', left: 0, right: 0, alignItems: 'center',
    backgroundColor: PIXEL_COLORS.hudBg + 'CC', padding: 16, marginHorizontal: 40,
    borderWidth: 3, borderColor: PIXEL_COLORS.windowOuter,
  },

  // Bite
  biteOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  biteAlert: {
    backgroundColor: PIXEL_COLORS.hudBg + 'EE', padding: 32,
    borderWidth: 4, borderColor: PIXEL_COLORS.uiHighlight,
    boxShadow: `0px 0px 20px ${PIXEL_COLORS.uiHighlight}66`,
  },

  // Fight UI
  fightUI: {
    position: 'absolute', bottom: 80, left: 12, right: 12,
    backgroundColor: PIXEL_COLORS.hudBg + 'EE', padding: 12,
    borderWidth: 3, borderColor: PIXEL_COLORS.windowOuter,
  },
  tensionContainer: { marginBottom: 8 },
  tensionBar: {
    width: '100%', height: 16,
    backgroundColor: PIXEL_COLORS.hudBg, borderWidth: 2, borderColor: PIXEL_COLORS.hudBorder,
    marginVertical: 4, overflow: 'hidden', position: 'relative',
  },
  tensionFill: { height: '100%' },
  tensionZone: { position: 'absolute', height: '100%' },
  tensionZoneSlack: {
    left: 0, width: '15%',
    backgroundColor: PIXEL_COLORS.uiInfo + '33',
    borderRightWidth: 1, borderColor: PIXEL_COLORS.uiInfo,
  },
  tensionZoneSweet: {
    left: '30%', width: '40%',
    backgroundColor: PIXEL_COLORS.uiSuccess + '22',
    borderLeftWidth: 2, borderRightWidth: 2, borderColor: PIXEL_COLORS.uiSuccess,
  },

  staminaContainer: { marginBottom: 4 },
  staminaBar: {
    width: '100%', height: 12,
    backgroundColor: PIXEL_COLORS.hudBg, borderWidth: 2, borderColor: PIXEL_COLORS.hudBorder,
    marginVertical: 4, overflow: 'hidden',
  },
  staminaFill: { height: '100%' },

  reelArea: { marginTop: 12, alignItems: 'center' },
  reelCircle: {
    width: 84, height: 84,
    borderWidth: 3, borderColor: PIXEL_COLORS.uiHighlight,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  reelInner: {
    width: 60, height: 60,
    borderWidth: 2, borderColor: PIXEL_COLORS.hudBorder,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: PIXEL_COLORS.uiHighlight + '11',
  },

  // Overlays
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#000000AA', padding: 20,
  },
  catchCard: { width: '100%', maxWidth: 340 },
  escapeCard: { width: '100%', maxWidth: 300, alignItems: 'center' },
  catchFishDisplay: {
    alignItems: 'center', justifyContent: 'center', height: 100,
    backgroundColor: PIXEL_COLORS.waterDeep + '44', marginTop: 8,
    borderWidth: 2, borderColor: PIXEL_COLORS.hudBorder,
  },
  newBadge: { alignItems: 'center', marginBottom: 8 },
  catchStats: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    marginTop: 12, paddingVertical: 8,
    borderTopWidth: 2, borderTopColor: PIXEL_COLORS.hudBorder,
  },
  catchStat: { alignItems: 'center' },
  catchStatDivider: { width: 2, height: 30, backgroundColor: PIXEL_COLORS.hudBorder },
  tipBox: {
    marginTop: 8, padding: 8,
    backgroundColor: PIXEL_COLORS.hudBg,
    borderWidth: 2, borderColor: PIXEL_COLORS.uiInfo + '44',
  },

  // Tutorial
  tutorialOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#000000CC', padding: 20,
  },
  tutorialCard: { width: '100%', maxWidth: 340 },
  tutorialStep: {
    marginBottom: 12, paddingLeft: 10,
    borderLeftWidth: 3, borderLeftColor: PIXEL_COLORS.uiHighlight,
  },
});
