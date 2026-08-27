import { View, Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import FilterChip from './FilterChip';
import StepperButton from './StepperButton';
import BottomModal from './BottomModal';
import { s } from '../../utils/style-helpers';

export type ChipOption = {
  key: string;
  label: string;
  active: boolean;
  onPress: () => void;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Titolo del modale (es. 'Aggiungi modificatore') */
  title: string;
  /** Etichetta della sezione target (es. 'Abilità' | 'Skill') */
  targetLabel: string;
  /** Chip selezionabili (una o più) — la prima è tipicamente "Tutte" */
  chips: ChipOption[];
  /** Etichetta libera facoltativa */
  labelValue: string;
  onLabelChange: (v: string) => void;
  /** Valore del modificatore (stepper) */
  value: number;
  onValueChange: (v: number) => void;
  minValue: number;
  maxValue: number;
  /** Disabilita il pulsante "Aggiungi" (es. nessun target scelto) */
  addDisabled: boolean;
  onAdd: () => void;
  placeholder?: string;
};

/**
 * Modale condiviso "Aggiungi modificatore" per abilità E skill:
 * chip target (una o più o "Tutte") + etichetta facoltativa + valore stepper.
 */
export default function AddModifierModal({
  visible,
  onClose,
  title,
  targetLabel,
  chips,
  labelValue,
  onLabelChange,
  value,
  onValueChange,
  minValue,
  maxValue,
  addDisabled,
  onAdd,
  placeholder,
}: Props) {
  const t = useTokens();
  return (
    <BottomModal visible={visible} onClose={onClose} showCloseButton>
      <View style={{ gap: t.spacing[4] }}>
        <Text style={{ fontSize: t.typography.xl, fontWeight: '700', color: t.colors.foreground }}>
          {title}
        </Text>

        {/* Target (abilità / skill) */}
        <View style={{ gap: t.spacing[1.5] }}>
          <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.foregroundTertiary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {targetLabel}
          </Text>
          <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
            {chips.map((c) => (
              <FilterChip key={c.key} size="sm" label={c.label} active={c.active} onPress={c.onPress} />
            ))}
          </View>
        </View>

        {/* Etichetta */}
        <View style={{ gap: t.spacing[1.5] }}>
          <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.foregroundTertiary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Etichetta (facoltativa)
          </Text>
          <Input value={labelValue} onChangeText={onLabelChange} placeholder={placeholder ?? 'es. Correzione DM, Talento…'} />
        </View>

        {/* Valore */}
        <View style={{ gap: t.spacing[1.5] }}>
          <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.foregroundTertiary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Valore ({minValue}…{maxValue})
          </Text>
          <View style={[s.row, s.gap(t.spacing[3]), { justifyContent: 'center' }]}>
            <StepperButton onPress={() => onValueChange(Math.max(minValue, value - 1))}>−</StepperButton>
            <Text
              style={{
                minWidth: 40,
                textAlign: 'center',
                fontSize: t.typography.lg,
                fontWeight: '700',
                color: value >= 0 ? t.colors.accent : t.colors.danger,
              }}
            >
              {value > 0 ? `+${value}` : value}
            </Text>
            <StepperButton onPress={() => onValueChange(Math.min(maxValue, value + 1))}>+</StepperButton>
          </View>
        </View>

        <Button variant="solid" fullWidth onPress={onAdd} disabled={addDisabled}>
          Aggiungi
        </Button>
      </View>
    </BottomModal>
  );
}
