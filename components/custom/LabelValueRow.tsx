import { View, Text } from 'react-native';
import type { ReactNode } from 'react';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';

type Props = {
  label: ReactNode;
  value: ReactNode;
  /** Colore del valore (default t.colors.foreground) */
  valueColor?: string;
  /** Font size del valore (default sm) */
  valueSize?: number;
  /** Peso del valore (default '600') */
  valueWeight?: string;
  /** Colore dell'etichetta (default foregroundSecondary) */
  labelColor?: string;
  /** Peso dell'etichetta (default '400') */
  labelWeight?: string;
  /** Riga divisoria superiore (bordo top) */
  dividerTop?: boolean;
  /** Padding superiore quando dividerTop (default t.spacing[2]) */
  dividerGap?: number;
};

/**
 * Riga "etichetta → valore" allineata (space-between).
 * Pattern ripetuto in Scheda PG (risorse), riepiloghi wizard e righe di dettaglio.
 */
export default function LabelValueRow({
  label,
  value,
  valueColor,
  valueSize,
  valueWeight = '600',
  labelColor,
  labelWeight = '400',
  dividerTop,
  dividerGap,
}: Props) {
  const t = useTokens();
  return (
    <View
      style={[
        s.row,
        { justifyContent: 'space-between' },
        dividerTop && {
          borderTopWidth: 1,
          borderTopColor: t.colors.border,
          paddingTop: dividerGap ?? t.spacing[2],
        },
      ]}
    >
      <Text style={{ fontSize: t.typography.sm, fontWeight: labelWeight as any, color: labelColor ?? t.colors.foregroundSecondary }}>{label}</Text>
      <Text
        style={{
          fontSize: valueSize ?? t.typography.sm,
          fontWeight: valueWeight as any,
          color: valueColor ?? t.colors.foreground,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
