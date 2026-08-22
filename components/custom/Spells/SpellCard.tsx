import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { useTokens } from '../../ui/prism-provider';
import { s } from '../../../utils/style-helpers';
import type { Spell, ClassName } from '../../../types';
import { SCHOOL_LABELS, CLASS_LABELS, SCHOOL_MAP, FAVORITE_COLOR } from './types';
import type { SpellSourceBadge } from './spellSourceBadges';
import DndIcon, { type IconName } from '../DndIcon';

type Props = {
  spell: Spell;
  isPrepared: boolean;
  isFavorite: boolean;
  hasActiveCharacter: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
  onTogglePrepared: () => void;
  /** Badge col regola particolare della magia (gratis 1/gg da bg/talento/razza) */
  badge?: SpellSourceBadge | null;
};

export default function SpellCard({
  spell,
  isPrepared,
  isFavorite,
  hasActiveCharacter,
  onPress,
  onToggleFavorite,
  onTogglePrepared,
  badge,
}: Props) {
  const t = useTokens();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      <Card
        variant={isPrepared ? 'elevated' : 'default'}
        style={{
          marginBottom: t.spacing[3],
          ...(isPrepared ? { borderColor: t.colors.accent } : {}),
        }}
      >
        <View style={[s.row, s.gap(t.spacing[3])]}>
          {/* School Icon */}
          <View style={[s.box(52, t.radius.xl), { backgroundColor: SCHOOL_MAP[spell.school]?.color + '20' || t.colors.backgroundSecondary }]}>
            <DndIcon name={spell.school as IconName} size={28} color={SCHOOL_MAP[spell.school]?.color || '#fff'} />
          </View>

          <View style={s.flex}>
            <Text style={{ fontSize: t.typography.md, fontWeight: '600', color: t.colors.foreground }}>
              {spell.name}
            </Text>
            <View style={[s.rowWrap, s.gap(t.spacing[1.5]), s.mt(t.spacing[1])]}>
              <Badge variant="solid" size="sm" color={SCHOOL_MAP[spell.school]?.color || '#888'}>
                {SCHOOL_LABELS[spell.school] || spell.school}
              </Badge>
              <Badge variant="subtle" size="sm" color={SCHOOL_MAP[spell.school]?.color || '#888'}>
                {spell.level === 0 ? 'Trucchetto' : `${spell.level}°`}
              </Badge>
              {badge && (
                <Badge variant="subtle" size="sm" color={badge.color}>{badge.label}</Badge>
              )}
            </View>
            <View style={[s.rowWrap, s.gap(t.spacing[1]), s.mt(t.spacing[0.5])]}>
              <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary }}>
                {spell.classes.map((cls) => CLASS_LABELS[cls as ClassName] || cls).join(' · ')}
              </Text>
            </View>
          </View>

          {hasActiveCharacter && (
            <View style={[s.row, s.gap(t.spacing[1])]}>
              <TouchableOpacity
                onPress={onToggleFavorite}
                style={[s.box(32, 16), { backgroundColor: isFavorite ? FAVORITE_COLOR : t.colors.backgroundSecondary }]}
              >
                <Text style={{ fontSize: 16, color: isFavorite ? t.colors.accentForeground : FAVORITE_COLOR }}>{isFavorite ? '★' : '☆'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onTogglePrepared}
                style={[s.box(32, 16), { backgroundColor: isPrepared ? t.colors.accent : t.colors.backgroundSecondary }]}
              >
                <Text style={{ fontSize: 14, color: isPrepared ? t.colors.accentForeground : t.colors.foregroundTertiary }}>
                  {isPrepared ? '✓' : '+'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
}
