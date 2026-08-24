import { View, Text, type TextStyle } from 'react-native';
import type { ReactNode } from 'react';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';
import StepperButton from './StepperButton';

type Props = {
  label: ReactNode;
  value: ReactNode;
  onDecrement: () => void;
  onIncrement: () => void;
  /** Larghezza minima del valore centrale (default 40) */
  minWidth?: number;
  /** Font size del valore (default base) */
  valueSize?: number;
  /** Peso del valore (default '600') */
  valueWeight?: TextStyle['fontWeight'];
  /** Colore del valore (default foreground) */
  valueColor?: string;
  /** Font size dell'etichetta (default sm) */
  labelSize?: number;
  /** Colore dell'etichetta (default foregroundSecondary) */
  labelColor?: string;
};

/**
 * Riga con stepper −/+ e valore centrale.
 * Pattern ripetuto per PF (Attuali/Temporanei), denaro (mo/ma/mr) e punti del wizard.
 */
export default function StepperRow({
  label,
  value,
  onDecrement,
  onIncrement,
  minWidth = 40,
  valueSize,
  valueWeight = '600',
  valueColor,
  labelSize,
  labelColor,
}: Props) {
  const t = useTokens();
  return (
    <View style={[s.row, { justifyContent: 'space-between' }]}>
      <Text
        style={{
          fontSize: labelSize ?? t.typography.sm,
          color: labelColor ?? t.colors.foregroundSecondary,
        }}
      >
        {label}
      </Text>
      <View style={[s.row, s.gap(t.spacing[3])]}>
        <StepperButton onPress={onDecrement}>−</StepperButton>
        <Text
          style={{
            minWidth,
            textAlign: 'center',
            fontSize: valueSize ?? t.typography.base,
            fontWeight: valueWeight,
            color: valueColor ?? t.colors.foreground,
          }}
        >
          {value}
        </Text>
        <StepperButton onPress={onIncrement}>+</StepperButton>
      </View>
    </View>
  );
}
