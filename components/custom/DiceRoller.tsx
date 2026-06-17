import { useState, useCallback, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { spacing } from '../../utils/styles';
import {
  DiceType,
  DICE_COLORS,
  executeRoll,
  RollResult,
} from '../../utils/dice';
import DiceTypeGrid from './DiceTypeGrid';
import StepperControl from './StepperControl';
import RollButton from './RollButton';
import ResultBreakdown from './ResultBreakdown';

type Props = {
  initialType?: DiceType;
  initialQuantity?: number;
};

export default function DiceRoller({ initialType = 'd20', initialQuantity = 1 }: Props) {
  // ── Configuration state ──────────────────────────────────────────
  const [diceType, setDiceType] = useState<DiceType>(initialType);
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [modifier, setModifier] = useState<number>(0);

  // ── Roll state ───────────────────────────────────────────────────
  const [lastResult, setLastResult] = useState<RollResult | null>(null);
  const [rolling, setRolling] = useState(false);

  // ── Animation shared values ──────────────────────────────────────
  const rotateValue = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const resultScale = useSharedValue(0);

  // ── Animated style ───────────────────────────────────────────────
  const diceAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotateValue.value}deg` },
      { translateX: shakeX.value },
      { translateY: shakeY.value },
      { scale: scaleValue.value },
    ],
  }));

  // ── Animate result number when it appears ────────────────────────
  useEffect(() => {
    if (lastResult && !rolling) {
      resultScale.value = withSequence(
        withTiming(1.5, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 200, easing: Easing.in(Easing.quad) })
      );
    }
  }, [lastResult, rolling]);

  // ── Roll logic ───────────────────────────────────────────────────
  const roll = useCallback(() => {
    if (rolling) return;

    setRolling(true);
    setLastResult(null);

    rotateValue.value = 0;
    shakeX.value = 0;
    shakeY.value = 0;
    scaleValue.value = 1;
    glowOpacity.value = 0;
    resultScale.value = 0;

    scaleValue.value = withTiming(1.1, { duration: 150, easing: Easing.out(Easing.quad) });

    const rotations = 3 + Math.floor(Math.random() * 2);
    rotateValue.value = withDelay(
      100,
      withTiming(rotations * 360, {
        duration: 600 + Math.random() * 200,
        easing: Easing.out(Easing.cubic),
      })
    );

    const shakeIntensity = 8 + Math.random() * 4;
    shakeX.value = withSequence(
      withTiming(shakeIntensity, { duration: 50 }),
      withTiming(-shakeIntensity, { duration: 50 }),
      withTiming(shakeIntensity * 0.7, { duration: 50 }),
      withTiming(-shakeIntensity * 0.7, { duration: 50 }),
      withTiming(shakeIntensity * 0.3, { duration: 50 }),
      withTiming(-shakeIntensity * 0.3, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );

    glowOpacity.value = withSequence(
      withTiming(0.3, { duration: 200 }),
      withTiming(0, { duration: 100 }),
      withTiming(0.2, { duration: 200 }),
      withTiming(0, { duration: 100 })
    );

    const result = executeRoll({ type: diceType, quantity, mode: 'normal', modifier });

    setTimeout(() => {
      setLastResult(result);
      setRolling(false);

      scaleValue.value = withSequence(
        withTiming(1.2, { duration: 100 }),
        withTiming(1, { duration: 200, easing: Easing.bounce })
      );

      glowOpacity.value = withSequence(
        withTiming(0.4, { duration: 100 }),
        withTiming(0, { duration: 300 })
      );
    }, 800);
  }, [diceType, quantity, modifier, rolling, rotateValue, shakeX, shakeY, scaleValue, glowOpacity, resultScale]);

  // ── Quantity controls ────────────────────────────────────────────
  const canDecreaseQuantity = quantity > 1;
  const canIncreaseQuantity = quantity < 99;

  const changeQuantity = useCallback((delta: number) => {
    setQuantity((q) => Math.max(1, Math.min(99, q + delta)));
  }, []);

  // ── Modifier controls ────────────────────────────────────────────
  const changeModifier = useCallback((delta: number) => {
    setModifier((m) => Math.max(-99, Math.min(99, m + delta)));
  }, []);

  // ── Reset ────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setLastResult(null);
    setQuantity(1);
    setModifier(0);
  }, []);

  // ── Dice type change ─────────────────────────────────────────────
  const diceTypeChanged = useCallback(
    (newType: DiceType) => {
      if (newType === diceType) return;

      scaleValue.value = withSequence(
        withTiming(0.8, { duration: 150 }),
        withTiming(0, { duration: 150 })
      );

      setTimeout(() => {
        setDiceType(newType);
        scaleValue.value = withSequence(
          withTiming(1.2, { duration: 150 }),
          withTiming(1, { duration: 150, easing: Easing.bounce })
        );
      }, 300);
    },
    [diceType, scaleValue]
  );

  // ── Style helpers ────────────────────────────────────────────────
  const selectedColor = DICE_COLORS[diceType];

  return (
    <View style={{ alignItems: 'center', gap: spacing[4], padding: spacing[4] }}>
      <DiceTypeGrid selected={diceType} onSelect={diceTypeChanged} />

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing[4] }}>
        <StepperControl
          label="Quantità"
          value={quantity}
          onChange={changeQuantity}
          canDecrement={canDecreaseQuantity}
          canIncrement={canIncreaseQuantity}
        />
        <StepperControl
          label="Modificatore"
          value={modifier}
          onChange={changeModifier}
          formatValue={(v) => (v > 0 ? `+${v}` : String(v))}
        />
      </View>

      <RollButton
        onPress={roll}
        disabled={rolling}
        rolling={rolling}
        diceType={diceType}
        animatedStyle={diceAnimatedStyle}
        selectedColor={selectedColor}
      />

      {lastResult && !rolling && (
        <ResultBreakdown
          result={lastResult}
          selectedColor={selectedColor}
          onReset={reset}
        />
      )}
    </View>
  );
}
