import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { useTokens } from '../../ui/prism-provider';
import { spacing, fontSizes, radius } from '../../../utils/styles';
import type { Spell, ClassName } from '../../../types';
import { SCHOOL_LABELS, CLASS_LABELS, SCHOOL_MAP } from './types';
import DndIcon from '../DndIcon';

type Props = {
  spell: Spell;
  isPrepared: boolean;
  isFavorite: boolean;
  hasActiveCharacter: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
  onTogglePrepared: () => void;
};

export default function SpellCard({
  spell,
  isPrepared,
  isFavorite,
  hasActiveCharacter,
  onPress,
  onToggleFavorite,
  onTogglePrepared,
}: Props) {
  const t = useTokens();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      <Card
        variant={isPrepared ? 'elevated' : 'default'}
        style={{
          marginBottom: spacing[3],
          ...(isPrepared ? { borderColor: t.colors.accent } : {}),
        }}
      >
        <View style={{ flexDirection: 'row', gap: spacing[3], alignItems: 'center' }}>
          {/* School Icon */}
          <View style={{
            backgroundColor: SCHOOL_MAP[spell.school]?.color + '20' || t.colors.backgroundSecondary,
            borderRadius: radius.xl,
            width: 52,
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <DndIcon name={spell.school} size={28} color={SCHOOL_MAP[spell.school]?.color || '#fff'} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fontSizes.md, fontWeight: '600', color: t.colors.foreground }}>
              {spell.name}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing[1.5], flexWrap: 'wrap', alignItems: 'center', marginTop: spacing[1] }}>
              <Badge variant="solid" size="sm" color={SCHOOL_MAP[spell.school]?.color || '#888'}>
                {SCHOOL_LABELS[spell.school] || spell.school}
              </Badge>
              <Badge variant="subtle" size="sm" color={SCHOOL_MAP[spell.school]?.color || '#888'}>
                {spell.level === 0 ? 'Trucchetto' : `${spell.level}°`}
              </Badge>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing[1], flexWrap: 'wrap', alignItems: 'center', marginTop: spacing[0.5] }}>
              <Text style={{ fontSize: fontSizes.xs, color: t.colors.foregroundSecondary }}>
                {spell.classes.map((cls) => CLASS_LABELS[cls as ClassName] || cls).join(' · ')}
              </Text>
            </View>
          </View>

          {hasActiveCharacter && (
            <View style={{ flexDirection: 'row', gap: spacing[1] }}>
              <TouchableOpacity
                onPress={onToggleFavorite}
                style={{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: isFavorite ? '#F59E0B' : t.colors.backgroundSecondary,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16 }}>{isFavorite ? '★' : '☆'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onTogglePrepared}
                style={{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: isPrepared ? t.colors.accent : t.colors.backgroundSecondary,
                  alignItems: 'center', justifyContent: 'center',
                }}
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
