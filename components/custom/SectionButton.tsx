import { View, Text, Pressable } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';

type Props = {
  /** Emoji o icona (testo) mostrata nel riquadro */
  icon: string;
  label: string;
  description?: string;
  onPress: () => void;
  /** Variante rossa per azioni delicate (es. Elimina personaggio) */
  danger?: boolean;
};

/**
 * Pulsante "sezione" stile Scheda PG / Altro: riquadro icona + etichetta +
 * descrizione + freccia. Variante `danger` per azioni di eliminazione.
 */
export default function SectionButton({ icon, label, description, onPress, danger = false }: Props) {
  const t = useTokens();
  const accent = danger ? t.colors.danger : t.colors.accent;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        padding: t.spacing[4],
        backgroundColor: pressed ? accent + '20' : t.colors.backgroundSecondary,
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
      })}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: t.radius.md,
          backgroundColor: accent + '18',
          ...s.center,
          marginRight: t.spacing[4],
        }}
      >
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={s.flex}>
        <Text style={{ fontSize: t.typography.base, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
          {label}
        </Text>
        {description && (
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[0.5] }}>
            {description}
          </Text>
        )}
      </View>
      <Text style={{ color: t.colors.foregroundTertiary, fontSize: 20 }}>›</Text>
    </Pressable>
  );
}
