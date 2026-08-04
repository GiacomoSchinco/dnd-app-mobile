import { Pressable, Text } from 'react-native';
import { useTokens } from '../../ui/prism-provider';

type Props = {
  /** Testo del chip (es. 'Acrobazia', 'FOR', '+2 a una caratteristica') */
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  /** Testo aggiunto quando selezionato (es. ' +2') */
  selectedSuffix?: string;
  /** Più basso (padding verticale ridotto, usato per i toggle delle modalità) */
  compact?: boolean;
};

/**
 * Chip selezionabile (pill) riutilizzabile: competenze, sottorazze, boost,
 * modalità ASI. Stile unico accent/border per tutto il wizard.
 */
export default function Chip({
  label,
  selected = false,
  disabled = false,
  onPress,
  selectedSuffix,
  compact = false,
}: Props) {
  const t = useTokens();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        paddingHorizontal: t.spacing[3],
        paddingVertical: compact ? t.spacing[1] : t.spacing[1.5],
        borderRadius: t.radius.full,
        borderWidth: 1,
        borderColor: selected ? t.colors.accent : t.colors.border,
        backgroundColor: selected ? t.colors.accent : t.colors.card,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text
        style={{
          fontSize: t.typography.sm,
          fontWeight: t.typography.medium,
          color: selected ? t.colors.accentForeground : t.colors.foreground,
        }}
      >
        {label}
        {selected && selectedSuffix ? selectedSuffix : ''}
      </Text>
    </Pressable>
  );
}
