import { Text, Pressable, StyleSheet } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { spacing, radius, fontSizes } from '../../../utils/styles';
import DndIcon from '../DndIcon';
import { DiceType } from '../../../utils/dice';

type Props = {
  onPress: () => void;
  disabled: boolean;
  rolling: boolean;
  diceType: DiceType;
  animatedStyle: AnimatedStyle;
  selectedColor: string;
};

export default function RollButton({
  onPress,
  disabled,
  rolling,
  diceType,
  animatedStyle,
  selectedColor,
}: Props) {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: selectedColor + '20',
            borderColor: selectedColor,
          },
          rolling && styles.buttonRolling,
        ]}
      >
        <Animated.View style={animatedStyle}>
          <DndIcon name={diceType} size={28} color={selectedColor} />
        </Animated.View>
        <Text style={[styles.text, { color: selectedColor }]}>
          {rolling ? 'Lanciando...' : 'Lancia'}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 2,
  },
  buttonRolling: {
    opacity: 0.7,
  },
  text: {
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
});
