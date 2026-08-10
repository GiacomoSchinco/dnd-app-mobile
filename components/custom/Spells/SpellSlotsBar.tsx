import { View, Text, Pressable } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { s } from '../../../utils/style-helpers';
import type { SpellSlot } from '../../../types';

type Props = {
  /** Slot per livello (Record<livello, { max, current }>) — current = disponibili */
  spellSlots?: Record<number, SpellSlot>;
  /** Consuma uno slot del livello dato */
  onUseSlot: (level: number) => void;
  /** Recupera uno slot del livello dato */
  onRecoverSlot: (level: number) => void;
  /** Ripristina TUTTI gli slot */
  onRestoreAll: () => void;
};

/**
 * Barra "Slot incantesimi" della tab Magie: una riga per ogni livello con slot
 * (pallini). Pallino PIENO = disponibile (tap → consuma), pallino VUOTO = usato
 * (tap → recupera quel singolo slot). "Ripristina tutti" azzera tutto.
 */
export default function SpellSlotsBar({ spellSlots, onUseSlot, onRecoverSlot, onRestoreAll }: Props) {
  const t = useTokens();

  const levels = Object.entries(spellSlots ?? {})
    .map(([lvl, slot]) => ({ level: Number(lvl), ...slot }))
    .filter((s) => s.max > 0)
    .sort((a, b) => a.level - b.level);

  if (levels.length === 0) return null;

  return (
    <View
      style={{
        marginBottom: t.spacing[3],
        backgroundColor: t.colors.backgroundSecondary,
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        padding: t.spacing[3],
        gap: t.spacing[2],
      }}
    >
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
          Slot incantesimi
        </Text>
        <Pressable onPress={onRestoreAll} hitSlop={8}>
          <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.accent }}>
            Ripristina tutti
          </Text>
        </Pressable>
      </View>

      {levels.map(({ level, max, current }) => (
        <View key={level} style={[s.row, { justifyContent: 'space-between' }]}>
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, width: 64 }}>
            Livello {level}
          </Text>
          <View style={[s.row, s.gap(t.spacing[1])]}>
            {Array.from({ length: max }).map((_, i) => {
              const available = i < current;
              return (
                <Pressable
                  key={i}
                  onPress={() => (available ? onUseSlot(level) : onRecoverSlot(level))}
                  hitSlop={4}
                  style={[
                    {
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: available ? t.colors.accent : t.colors.background,
                      borderWidth: 2,
                      borderColor: t.colors.accent,
                    },
                    s.center,
                  ]}
                >
                  {!available && (
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.colors.accent }} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
