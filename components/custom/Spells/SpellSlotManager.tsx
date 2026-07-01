import { View, Text, TouchableOpacity } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { useActiveCharacter } from '../../../store/useActiveCharacter';
import { spacing, fontSizes, radius } from '../../../utils/styles';
import { LEVEL_LABELS } from './types';

// ── Colori per ogni livello incantesimo (dal 1° al 9°) ─────
const LEVEL_COLORS: Record<number, string> = {
  1: '#60A5FA',
  2: '#34D399',
  3: '#FBBF24',
  4: '#F87171',
  5: '#A78BFA',
  6: '#FB923C',
  7: '#818CF8',
  8: '#F472B6',
  9: '#9CA3AF',
};

type Props = {
  characterId: string;
};

export default function SpellSlotManager({ characterId }: Props) {
  const t = useTokens();
  const { activeChar, useSpellSlot, restoreSpellSlots } = useActiveCharacter();

  if (!activeChar) return null;

  const slots = activeChar.spellSlots;
  const maxLevel = Math.max(
    ...Object.keys(slots)
      .map(Number)
      .filter((lvl) => slots[lvl].max > 0),
    0,
  );

  if (maxLevel === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: spacing[10] }}>
        <Text style={{ fontSize: fontSizes['2xl'], marginBottom: spacing[3] }}>🔮</Text>
        <Text style={{ fontSize: fontSizes.base, color: t.colors.foregroundSecondary, textAlign: 'center' }}>
          Questo personaggio non ha slot incantesimi.{'\n'}Forse è di livello troppo basso.
        </Text>
      </View>
    );
  }

  const allSlotsFull = Object.values(slots).every((s) => s.current === s.max);

  return (
    <View style={{ gap: spacing[2] }}>
      {/* Header */}
      <Text style={{ fontSize: fontSizes.xs, color: t.colors.foregroundTertiary, marginBottom: spacing[1] }}>
        Tocca per usare/ripristinare
      </Text>

      {/* Card unica con tutte le righe + footer long rest */}
      <View
        style={{
          backgroundColor: t.colors.card,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: t.colors.cardBorder,
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: maxLevel }, (_, i) => i + 1).map((level) => {
          const slot = slots[level];
          if (!slot || slot.max === 0) return null;

          const color = LEVEL_COLORS[level] || t.colors.accent;

          return (
            <View
              key={level}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: spacing[3],
                paddingHorizontal: spacing[4],
                borderBottomWidth: 1,
                borderBottomColor: t.colors.cardBorder,
              }}
            >
              {/* Badge livello */}
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: radius.full,
                  backgroundColor: color + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing[3],
                }}
              >
                <Text style={{ fontSize: fontSizes.sm, fontWeight: '800', color }}>{level}</Text>
              </View>

              {/* Label */}
              <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: t.colors.foreground, width: 38 }}>
                {LEVEL_LABELS[level]}
              </Text>

              {/* Pallini interattivi */}
              <View style={{ flex: 1, flexDirection: 'row', gap: spacing[1.5] }}>
                {Array.from({ length: slot.max }, (_, i) => {
                  const filled = i < slot.current;
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => (filled ? useSpellSlot(level) : restoreSpellSlots(level))}
                      activeOpacity={0.6}
                      hitSlop={4}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: filled ? color : 'transparent',
                        borderWidth: 2,
                        borderColor: filled ? color : t.colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {filled ? (
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />
                      ) : (
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.colors.border }} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Counter */}
              <Text
                style={{
                  fontSize: fontSizes.sm,
                  fontWeight: '700',
                  color: t.colors.foreground,
                  minWidth: 32,
                  textAlign: 'right',
                }}
              >
                <Text style={{ color }}>{slot.current}</Text>
                <Text style={{ color: t.colors.foregroundTertiary }}>/{slot.max}</Text>
              </Text>
            </View>
          );
        })}

        {/* Footer: Lungo riposo */}
        {!allSlotsFull && (
          <TouchableOpacity
            onPress={() => restoreSpellSlots()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[1.5],
              paddingVertical: spacing[3],
              backgroundColor: t.colors.backgroundSecondary,
            }}
          >
            <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: t.colors.accent }}>
              ⚡ Lungo riposo — ricarica tutti gli slot
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Warlock hint */}
      {activeChar.classes?.[0]?.className === 'warlock' && (
        <View
          style={{
            padding: spacing[3],
            borderRadius: radius.md,
            backgroundColor: t.colors.accentSubtle,
            borderWidth: 1,
            borderColor: t.colors.accent + '40',
          }}
        >
          <Text style={{ fontSize: fontSizes.xs, color: t.colors.accent, textAlign: 'center' }}>
            ⚡ I Warlock usano Pact Magic — tutti gli slot sono dello stesso livello e si recuperano con un riposo breve.
          </Text>
        </View>
      )}
    </View>
  );
}
