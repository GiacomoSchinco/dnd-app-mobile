import { View, Text, Pressable } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';
import DndIcon, { type IconName } from './DndIcon';

type Props = {
  /** Emoji o icona (testo) mostrata nel riquadro — alternativa a `dndIcon` */
  icon?: string;
  /** Icona DndIcon (SVG) mostrata nel riquadro — alternativa a `icon` */
  dndIcon?: IconName;
  label: string;
  description?: string;
  onPress: () => void;
  /** Variante rossa per azioni delicate (es. Elimina personaggio) */
  danger?: boolean;
  /** Disabilita il pulsante (es. Livello massimo): feedback attenuato */
  disabled?: boolean;
};

/**
 * Pulsante "sezione" stile Scheda PG / Altro: riquadro icona + etichetta +
 * descrizione + freccia. Variante `danger` per azioni di eliminazione,
 * `disabled` per funzioni non disponibili (colori attenuati, niente press).
 */
export default function SectionButton({ icon, dndIcon, label, description, onPress, danger = false, disabled = false }: Props) {
  const t = useTokens();
  const accent = danger ? t.colors.danger : t.colors.accent;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        padding: t.spacing[4],
        backgroundColor: !disabled && pressed ? accent + '20' : t.colors.backgroundSecondary,
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        opacity: disabled ? 0.55 : 1,
      })}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: t.radius.md,
          backgroundColor: disabled ? t.colors.backgroundTertiary : accent + '18',
          ...s.center,
          marginRight: t.spacing[4],
        }}
      >
        {dndIcon ? (
          <DndIcon name={dndIcon} size={22} color={accent} />
        ) : (
          <Text style={{ fontSize: Math.round(22 * (t.scale ?? 1)) }}>{icon}</Text>
        )}
      </View>
      <View style={s.flex}>
        <Text style={{ fontSize: t.typography.base, fontWeight: t.typography.semibold, color: disabled ? t.colors.foregroundTertiary : t.colors.foreground }}>
          {label}
        </Text>
        {description && (
          <Text style={{ fontSize: t.typography.sm, color: disabled ? t.colors.foregroundTertiary : t.colors.foregroundSecondary, marginTop: t.spacing[0.5] }}>
            {description}
          </Text>
        )}
      </View>
      <Text style={{ color: t.colors.foregroundTertiary, fontSize: Math.round(20 * (t.scale ?? 1)) }}>›</Text>
    </Pressable>
  );
}
