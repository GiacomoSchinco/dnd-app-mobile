import type { ReactNode } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useTokens } from '../ui/prism-provider';

type Props = {
  label: ReactNode;
  active?: boolean;
  onPress?: () => void;
  /** Sfondo quando attivo (default: accent) */
  activeBg?: string;
  /** Colore testo quando attivo (default: accentForeground) */
  activeFg?: string;
  /** Bordo quando attivo (default: trasparente) */
  activeBorder?: string;
  /** 'xs' = filtri compatti (top bar), 'sm' = chips più grandi (modali) */
  size?: 'xs' | 'sm';
};

/**
 * Chip/pill filtro selezionabile, stile condiviso tra SpellFilters e ItemFilters.
 * Attivo = sfondo accent (o custom) + testo bold, inattivo = sfondo secondario + bordo.
 */
export default function FilterChip({
  label,
  active = false,
  onPress,
  activeBg,
  activeFg,
  activeBorder,
  size = 'xs',
}: Props) {
  const t = useTokens();
  const isSm = size === 'sm';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: t.spacing[isSm ? 3 : 2.5],
        paddingVertical: t.spacing[isSm ? 2 : 1],
        borderRadius: t.radius.full,
        backgroundColor: active
          ? (activeBg ?? t.colors.accent)
          : t.colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: active ? (activeBorder ?? 'transparent') : t.colors.border,
      }}
    >
      <Text
        style={{
          fontSize: isSm ? t.typography.sm : t.typography.xs,
          fontWeight: active ? '600' : '400',
          color: active ? (activeFg ?? t.colors.accentForeground) : t.colors.foregroundSecondary,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
