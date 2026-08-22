import { View, type ViewStyle, type StyleProp } from 'react-native';
import type { ReactNode } from 'react';
import { useTokens } from '../ui/prism-provider';

type Props = {
  children: ReactNode;
  /** Padding interno (default t.spacing[4]) */
  padding?: number;
  /** Gap verticale tra i figli (default 0) */
  gap?: number;
  /** Margine inferiore (default nessuno) */
  marginBottom?: number;
  /** Raggio angoli (default md) */
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Card contenitore con `backgroundSecondary` + bordo + raggio.
 * Il pattern "box con bordo" era re-implementato inline in molte schermate
 * (Scheda PG, denaro, slot, riepiloghi wizard) — qui centralizzato.
 */
export default function CardBox({
  children,
  padding,
  gap,
  marginBottom,
  radius,
  style,
}: Props) {
  const t = useTokens();
  return (
    <View
      style={[
        {
          backgroundColor: t.colors.backgroundSecondary,
          borderRadius: radius ?? t.radius.md,
          borderWidth: 1,
          borderColor: t.colors.border,
          padding: padding ?? t.spacing[4],
          gap: gap ?? 0,
        },
        marginBottom != null && { marginBottom },
        style,
      ]}
    >
      {children}
    </View>
  );
}
