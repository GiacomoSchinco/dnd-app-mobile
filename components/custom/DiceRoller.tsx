import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTokens } from '../ui/prism-provider';
import DndIcon from './DndIcon';

type Props = {
  name: string;
  sides: number;
};

const DICE_COLORS: Record<string, string> = {
  d4: '#EF4444',
  d6: '#22C55E',
  d8: '#3B82F6',
  d10: '#F59E0B',
  d12: '#8B5CF6',
  d20: '#EC4899',
};

export default function DiceRoller({ name, sides }: Props) {
  const t = useTokens();
  const [result, setResult] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const roll = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    setResult(null);

    rotate.value = 0;
    scale.value = 1;
    translateY.value = 0;

    const finalResult = Math.floor(Math.random() * sides) + 1;

    rotate.value = withSequence(
      ...Array.from({ length: 6 }).flatMap(() => [
        withTiming(-15, { duration: 60, easing: Easing.inOut(Easing.quad) }),
        withTiming(15, { duration: 60, easing: Easing.inOut(Easing.quad) }),
      ]),
      withTiming(360 * 2, { duration: 400, easing: Easing.out(Easing.back ) }),
      withSpring(0, { damping: 10, stiffness: 100 })
    );

    scale.value = withSequence(
      withTiming(0.85, { duration: 300 }),
      withSpring(1.15, { damping: 8, stiffness: 150 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );

    translateY.value = withSequence(
      withTiming(-20, { duration: 200 }),
      withTiming(0, { duration: 200 }),
    );

    setTimeout(() => {
      setResult(finalResult);
      setRolling(false);
    }, 1800);
  }, [sides, rolling]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const color = DICE_COLORS[name] || t.colors.accent;

  return (
    <Pressable onPress={roll} disabled={rolling}>
      <Animated.View
        style={[
          styles.dice,
          {
            backgroundColor: color + '20',
            borderColor: color,
            shadowColor: color,
          },
          animatedStyle,
        ]}
      >
        {result !== null && !rolling ? (
          <Text style={[styles.result, { color }]}>{result}</Text>
        ) : (
          <DndIcon name={name as any} size={44} color={color} />
        )}
        <Text style={[styles.label, { color: t.colors.foregroundTertiary }]}>
          {name}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dice: {
    width: 90,
    height: 90,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    position: 'absolute',
    bottom: 8,
  },
  result: {
    fontSize: 34,
    fontWeight: '800',
  },
});
