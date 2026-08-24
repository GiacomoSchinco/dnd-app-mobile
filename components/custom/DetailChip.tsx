import { View, Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import type { PrismTheme } from '../ui/prism-provider';

type Props = {
  label: string;
  value: string;
  color?: string;
  /** Tokens del tema — opzionale (se assente usa il contesto) */
  t?: PrismTheme;
};

/** Chip "etichetta → valore" usato nei modali di dettaglio (oggetti, incantesimi, ...) */
export default function DetailChip({ label, value, color, t }: Props) {
  const contextTokens = useTokens();
  const tokens = t || contextTokens;

  return (
    <View
      style={{
        backgroundColor: tokens.colors.backgroundSecondary,
        borderRadius: tokens.radius.sm,
        paddingHorizontal: tokens.spacing[2],
        paddingVertical: tokens.spacing[1],
      }}
    >
      <Text style={{ fontSize: tokens.typography.xs, color: tokens.colors.foregroundTertiary, fontWeight: '600', textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text style={{ fontSize: tokens.typography.sm, color: color || tokens.colors.foreground, fontWeight: '500' }}>
        {value}
      </Text>
    </View>
  );
}
