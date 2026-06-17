import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { spacing, radius, fontSizes } from '../../utils/styles';

type Props = {
  label: string;
  value: number;
  onChange: (delta: number) => void;
  canDecrement?: boolean;
  canIncrement?: boolean;
  formatValue?: (value: number) => string;
};

export default function StepperControl({
  label,
  value,
  onChange,
  canDecrement = true,
  canIncrement = true,
  formatValue,
}: Props) {
  const t = useTokens();
  const display = formatValue ? formatValue(value) : String(value);

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: t.colors.foregroundTertiary }]}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => onChange(-1)}
          disabled={!canDecrement}
          style={[styles.btn, !canDecrement && styles.btnDisabled]}
        >
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Text style={[styles.value, { color: t.colors.foreground }]}>{display}</Text>
        <Pressable
          onPress={() => onChange(1)}
          disabled={!canIncrement}
          style={[styles.btn, !canIncrement && styles.btnDisabled]}
        >
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    alignItems: 'center',
    gap: spacing[1.5],
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.3,
  },
  btnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  value: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    minWidth: spacing[6],
    textAlign: 'center',
  },
});
