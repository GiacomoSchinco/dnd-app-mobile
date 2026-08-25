import { View, Text, Pressable } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { s } from '../../../utils/style-helpers';
import CardBox from '../CardBox';
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
    <CardBox radius={t.radius.lg} padding={t.spacing[3]} gap={t.spacing[2]} marginBottom={t.spacing[3]}>
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
        <View key={level} style={[s.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
          <View style={[s.row, { alignItems: 'center', gap: t.spacing[2] }]}>
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
              Livello {level}
            </Text>
            <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
              {current}/{max}
            </Text>
          </View>
          <View style={[s.row, s.gap(t.spacing[1])]}>
            {Array.from({ length: max }).map((_, i) => {
              const available = i < current;
              return (
                <Pressable
                  key={i}
                  onPress={() => (available ? onUseSlot(level) : onRecoverSlot(level))}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={available ? `Consuma uno slot di livello ${level}` : `Recupera uno slot di livello ${level}`}
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

      {/* Legenda disponibile/usato */}
      <View style={[s.row, s.gap(t.spacing[4]), { marginTop: t.spacing[1] }]}>
        <View style={[s.row, { alignItems: 'center', gap: t.spacing[1] }]}>
          <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: t.colors.accent }} />
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>disponibile</Text>
        </View>
        <View style={[s.row, { alignItems: 'center', gap: t.spacing[1] }]}>
          <View
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              borderWidth: 2,
              borderColor: t.colors.accent,
              backgroundColor: t.colors.background,
            }}
          />
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>usato</Text>
        </View>
      </View>
    </CardBox>
  );
}
