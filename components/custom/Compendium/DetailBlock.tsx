import { View, Text } from 'react-native';
import type { ReactNode } from 'react';
import { useTokens } from '../../ui/prism-provider';
import { s } from '../../../utils/style-helpers';

type Props = {
  /** Titolo in grassetto (opzionale) */
  title?: string;
  children: ReactNode;
};

/**
 * Blocco di dettaglio riutilizzabile nei modali del Compendio:
 * sfondo `backgroundSecondary`, raggio, padding e titolo opzionale.
 */
export default function DetailBlock({ title, children }: Props) {
  const t = useTokens();

  return (
    <View
      style={[
        s.mb(t.spacing[2]),
        { backgroundColor: t.colors.backgroundSecondary, borderRadius: t.radius.md, padding: t.spacing[3] },
      ]}
    >
      {title && (
        <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>{title}</Text>
      )}
      {children}
    </View>
  );
}
