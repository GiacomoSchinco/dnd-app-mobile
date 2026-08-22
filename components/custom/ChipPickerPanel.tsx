import { View, Text } from 'react-native';
import type { ReactNode } from 'react';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';

type Props = {
  /** Titolo uppercase del pannello (es. 'Filtra per classe') */
  title: string;
  children: ReactNode;
  /** Margine inferiore (default t.spacing[3]) */
  marginBottom?: number;
};

/**
 * Pannello inline espandibile per picker di chip: card con bordo +
 * label uppercase + riga di FilterChip. Niente modale nativo (evita la
 * "striscia bianca" della barra su Android/Expo Go).
 * Pattern duplicato tra il filtro classe e il filtro scuola delle magie.
 */
export default function ChipPickerPanel({ title, children, marginBottom }: Props) {
  const t = useTokens();
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: t.colors.border,
        borderRadius: t.radius.lg,
        backgroundColor: t.colors.backgroundSecondary,
        padding: t.spacing[3],
        gap: t.spacing[2.5],
        marginBottom: marginBottom ?? t.spacing[3],
      }}
    >
      <Text
        style={{
          fontSize: t.typography.xs,
          fontWeight: '600',
          color: t.colors.foregroundTertiary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Text>
      <View style={[s.rowWrap, s.gap(t.spacing[2])]}>{children}</View>
    </View>
  );
}
