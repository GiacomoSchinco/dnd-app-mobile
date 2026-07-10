import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { s } from '../../../utils/style-helpers';
import type { DiceType, RollResult } from '../../../types';
import { DICE_COLORS, executeRoll } from '../../../utils/dice';
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

  // ── Helper per iniettare il risultato a fine animazione ─────────
  const handleRollCompletion = (result: RollResult) => {
    setLastResult(result);
    setRolling(false);

    // Fa rimbalzare il dado appena si ferma e mostra il risultato
    scaleValue.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 200, easing: Easing.bounce })
    );

    glowOpacity.value = withSequence(
      withTiming(0.4, { duration: 100 }),
      withTiming(0, { duration: 300 })
    );

    resultScale.value = withSequence(
      withTiming(1.5, { duration: 200, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 200, easing: Easing.in(Easing.quad) })
    );
  };

  // ── Roll logic ───────────────────────────────────────────────────
  const roll = useCallback(() => {
    if (rolling) return;

    setRolling(true);
    setLastResult(null);

    // Reset immediato dei valori animati
    rotateValue.value = 0;
    shakeX.value = 0;
    shakeY.value = 0;
    scaleValue.value = 1;
    glowOpacity.value = 0;
    resultScale.value = 0;

    // Anticipazione del lancio (si ingrandisce leggermente)
    scaleValue.value = withTiming(1.1, { duration: 150, easing: Easing.out(Easing.quad) });

    const rotations = 3 + Math.floor(Math.random() * 2);
    const animationDuration = 600 + Math.random() * 200;

    // Calcoliamo subito il risultato matematico
    const result = executeRoll({ type: diceType, quantity, mode: 'normal', modifier });

    // Rotazione principale del dado
    rotateValue.value = withDelay(
      100,
      withTiming(rotations * 360, {
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
      }, (finished) => {
        if (finished) {
          // Usiamo runOnJS per sincronizzare in modo sicuro il thread UI con lo stato React
          runOnJS(handleRollCompletion)(result);
        }
      })
    );

    // Shaking ad alta frequenza
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

    // Effetto bagliore intermittente durante il roll
    glowOpacity.value = withSequence(
      withTiming(0.3, { duration: 200 }),
      withTiming(0, { duration: 100 }),
      withTiming(0.2, { duration: 200 }),
      withTiming(0, { duration: 100 })
    );
  }, [diceType, quantity, modifier, rolling]);

  // ── Quantity controls ────────────────────────────────────────────
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

  // ── Helper per il cambio dado ───────────────────────────────────
  const updateDiceType = (newType: DiceType) => {
    setDiceType(newType);
    scaleValue.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withTiming(1, { duration: 150, easing: Easing.bounce })
    );
  };

  // ── Dice type change ─────────────────────────────────────────────
  const diceTypeChanged = useCallback(
    (newType: DiceType) => {
      if (newType === diceType) return;

      setLastResult(null);
      setQuantity(1);
      setModifier(0);
      resultScale.value = 0;

      // Il vecchio dado scompare rimpicciolendosi...
      scaleValue.value = withTiming(0, { duration: 150, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) {
          // ...e il nuovo entra con un rimbalzo
          runOnJS(updateDiceType)(newType);
        }
      });
    },
    [diceType]
  );

  const selectedColor = DICE_COLORS[diceType];

  return (
    <View style={[s.center, { gap: 16, padding: 16 }]}>
      <DiceTypeGrid selected={diceType} onSelect={diceTypeChanged} />

      <View style={[s.row, { gap: 16, justifyContent: 'center' }]}>
        <StepperControl
          label="Quantità"
          value={quantity}
          onChange={changeQuantity}
          canDecrement={quantity > 1}
          canIncrement={quantity < 99}
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