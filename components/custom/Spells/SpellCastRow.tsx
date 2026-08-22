import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Badge } from '../../ui/badge';
import DndIcon, { type IconName } from '../DndIcon';
import { s } from '../../../utils/style-helpers';
import type { Spell } from '../../../types';
import { SCHOOL_LABELS, SCHOOL_MAP } from './types';
import type { SpellSourceBadge } from './spellSourceBadges';

type Props = {
  spell: Spell;
  t: ReturnType<typeof useTokens>;
  /** "Lancia": consuma lo slot del livello (i trucchetti non ne consumano) */
  onCast: (spell: Spell) => void;
  /** Apre il dettaglio della magia */
  onInfo: (spell: Spell) => void;
  /** Se false (PG senza slot incantesimo) nasconde il tasto "Lancia" */
  canCast?: boolean;
  /** Badge col regola particolare della magia (gratis 1/gg da bg/talento/razza) */
  badge?: SpellSourceBadge | null;
};

/** Riga di una magia assegnata al PG: testo → dettaglio, chip "Lancia" → consuma lo slot */
export default function SpellCastRow({ spell, t, onCast, onInfo, canCast = true, badge }: Props) {
  const color = SCHOOL_MAP[spell.school]?.color || '#888';
  return (
    <Pressable
      onPress={() => onInfo(spell)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing[3],
        marginBottom: t.spacing[2.5],
        padding: t.spacing[3],
        borderRadius: t.radius.lg,
        backgroundColor: t.colors.card,
        borderWidth: 1,
        borderColor: t.colors.border,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={[s.box(44, t.radius.lg), { backgroundColor: color + '20' }]}>
        <DndIcon name={spell.school as IconName} size={24} color={color} />
      </View>
      <View style={s.flex}>
        <Text style={{ fontSize: t.typography.md, fontWeight: '600', color: t.colors.foreground }}>
          {spell.name}
        </Text>
        <View style={[s.rowWrap, s.gap(t.spacing[1.5]), s.mt(t.spacing[0.5])]}>
          <Badge variant="subtle" size="sm">{spell.level === 0 ? 'Trucchetto' : `${spell.level}°`}</Badge>
          <Badge variant="subtle" size="sm" color={color}>{SCHOOL_LABELS[spell.school] || spell.school}</Badge>
          {badge && (
            <Badge variant="subtle" size="sm" color={badge.color}>{badge.label}</Badge>
          )}
        </View>
      </View>
      {spell.level === 0 ? (
        <Badge variant="subtle" size="sm" color={t.colors.accent}>∞</Badge>
      ) : canCast ? (
        <TouchableOpacity
          onPress={() => onCast(spell)}
          style={{
            paddingHorizontal: t.spacing[3],
            paddingVertical: t.spacing[1.5],
            borderRadius: t.radius.md,
            backgroundColor: t.colors.accent,
          }}
        >
          <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.accentForeground }}>Lancia</Text>
        </TouchableOpacity>
      ) : null}
    </Pressable>
  );
}
