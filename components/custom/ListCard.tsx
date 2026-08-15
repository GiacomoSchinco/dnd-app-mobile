import { View } from 'react-native';
import type { ReactNode } from 'react';
import { useTokens } from '../ui/prism-provider';

type Props = {
  children: ReactNode;
  /** Margine inferiore opzionale */
  marginBottom?: number;
};

/** Contenitore card per liste — bordo + sfondo secondario, angoli arrotondati, ritaglio. */
export default function ListCard({ children, marginBottom }: Props) {
  const t = useTokens();
  return (
    <View
      style={{
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        backgroundColor: t.colors.backgroundSecondary,
        overflow: 'hidden',
        ...(marginBottom != null ? { marginBottom } : null),
      }}
    >
      {children}
    </View>
  );
}
