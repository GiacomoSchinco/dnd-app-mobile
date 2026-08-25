import { View, Text, Pressable } from 'react-native';
import type { ReactNode } from 'react';
import { useTokens } from '../ui/prism-provider';
import { Card } from '../ui/card';
import { s } from '../../utils/style-helpers';

type Props = {
  title: string;
  onPress: () => void;
  /** Contenuto dell'icona (emoji, DndIcon, Image...) */
  icon?: ReactNode;
  /** Colore di sfondo della box icona (card: accent+18; menu boxed: accent+20) */
  iconBg?: string;
  /** Se false la icona è renderizzata nuda (senza box colorata) con margine destro — card e menu */
  iconBoxed?: boolean;
  /** Variante card: badge/sottotitoli sotto il titolo */
  badges?: ReactNode;
  /** Variante menu: testo descrittivo sotto il titolo */
  description?: string;
  /** 'card' = Card elevata (liste); 'menu' = riga con bordo trasparente (menu) */
  variant?: 'card' | 'menu';
  /** Variante menu: colore del bordo sinistro */
  accent?: string;
};

/**
 * Riga riutilizzabile: [icona] [titolo (+ badge/descrizione)] ›
 * - variant "card": Card elevata, usata nelle liste del Compendio
 * - variant "menu": riga con bordo, usata nei menu (Altro, Compendio)
 */
export default function ListItem({
  title,
  onPress,
  icon,
  iconBg,
  iconBoxed = false,
  badges,
  description,
  variant = 'card',
  accent,
}: Props) {
  const t = useTokens();

  if (variant === 'menu') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => ({
          ...s.row,
          gap: t.spacing[4],
          padding: t.spacing[4],
          backgroundColor: pressed ? t.colors.backgroundSecondary : 'transparent',
          borderRadius: t.radius.lg,
          borderWidth: 1,
          borderColor: t.colors.backgroundSecondary,
          ...(accent ? { borderLeftWidth: 4, borderLeftColor: accent } : {}),
        })}
      >
        {icon !== undefined &&
          (iconBoxed ? (
            <View style={[s.box(48, t.radius.md), { backgroundColor: (iconBg || t.colors.accent) + '20' }]}>
              {icon}
            </View>
          ) : (
            icon
          ))}
        <View style={s.flex}>
          <Text style={{ fontSize: t.typography.base, fontWeight: '600', color: t.colors.foreground }}>{title}</Text>
          {description && (
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: 2 }}>
              {description}
            </Text>
          )}
        </View>
        <Text style={{ color: t.colors.foregroundSecondary, fontSize: t.typography.md }}>›</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <Card variant="elevated" style={{ marginBottom: t.spacing[3] }}>
        <View style={s.row}>
          {icon !== undefined &&
            (iconBoxed ? (
              <View
                style={[
                  s.box(52, 26),
                  { backgroundColor: iconBg || t.colors.accent + '18', marginRight: t.spacing[3], overflow: 'hidden' },
                ]}
              >
                {icon}
              </View>
            ) : (
              <View style={{ marginRight: t.spacing[3] }}>{icon}</View>
            ))}
          <View style={s.flex}>
            <Text style={{ fontSize: t.typography.md, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
              {title}
            </Text>
            {badges && <View style={[s.row, s.gap(t.spacing[1.5]), s.mt(t.spacing[0.5])]}>{badges}</View>}
          </View>
          <Text style={{ color: t.colors.foregroundTertiary, fontSize: t.typography.lg }}>›</Text>
        </View>
      </Card>
    </Pressable>
  );
}
