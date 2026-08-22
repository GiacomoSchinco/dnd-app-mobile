import { View, Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';

type Props = {
  label: string;
  value: string;
};

/**
 * Statistica derivata dell'header — quadrato con etichetta + valore.
 * Promosso da componente locale della Scheda PG (CA, PB, Velocità, Iniz.).
 */
export default function StatTile({ label, value }: Props) {
  const t = useTokens();
  return (
    <View
      style={{
        flex: 1,
        aspectRatio: 1,
        backgroundColor: t.colors.card,
        borderRadius: t.radius.md,
        borderWidth: 1,
        borderColor: t.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        gap: t.spacing[1],
      }}
    >
      <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>{label}</Text>
      <Text style={{ fontSize: t.typography.base, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
        {value}
      </Text>
    </View>
  );
}
