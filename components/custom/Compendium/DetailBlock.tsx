import { View, Text } from 'react-native';
import type { ReactNode } from 'react';
import { useTokens } from '../../ui/prism-provider';
import { s } from '../../../utils/style-helpers';

type Props = {
  /** Titolo in grassetto (opzionale) */
  title?: string;
  /** Badge opzionale accanto al titolo (es. livello) */
  badge?: string;
  children: ReactNode;
};

/**
 * Blocco di dettaglio riutilizzabile nei modali del Compendio:
 * sfondo `backgroundSecondary`, raggio, padding, titolo/badge opzionali.
 */
export default function DetailBlock({ title, badge, children }: Props) {
  const t = useTokens();

  return (
    <View
      style={[
        s.mb(t.spacing[2]),
        { backgroundColor: t.colors.backgroundSecondary, borderRadius: t.radius.md, padding: t.spacing[3] },
      ]}
    >
      {(title || badge) && (
        <View style={[s.row, s.gap(t.spacing[2]), { alignItems: 'center', marginBottom: t.spacing[1] }]}>
          {badge ? (
            <View
              style={{
                backgroundColor: t.colors.accentSubtle,
                borderRadius: t.radius.sm,
                paddingHorizontal: t.spacing[1.5],
                paddingVertical: t.spacing[0.25],
              }}
            >
              <Text style={{ fontSize: t.typography.xs, fontWeight: '700', color: t.colors.accent }}>{badge}</Text>
            </View>
          ) : null}
          {title ? (
            <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground, flex: 1 }}>
              {title}
            </Text>
          ) : null}
        </View>
      )}
      {children}
    </View>
  );
}
