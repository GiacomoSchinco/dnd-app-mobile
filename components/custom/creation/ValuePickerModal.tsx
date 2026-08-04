import { Pressable, Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { getAbilityLabel, getAbilityModifier } from '../../../lib/rules/abilities';
import { s } from '../../../utils/style-helpers';
import BottomModal from '../BottomModal';
import type { Ability } from '../../../types';

type Props = {
  /** Abilità in modifica (null = modale chiuso) */
  ability: Ability | null;
  /** Valori ancora disponibili (pool) */
  pool: number[];
  onSelect: (value: number) => void;
  onClose: () => void;
};

/** Modale per scegliere quale valore (dal pool) assegnare a un'abilità */
export default function ValuePickerModal({ ability, pool, onSelect, onClose }: Props) {
  const t = useTokens();

  return (
    <BottomModal visible={ability != null} onClose={onClose}>
      <View
        style={{
          backgroundColor: t.colors.card,
          borderRadius: t.radius.lg,
          borderWidth: 1,
          borderColor: t.colors.cardBorder,
          padding: t.spacing[5],
        }}
      >
        <Text style={{ fontSize: t.typography.lg, fontWeight: t.typography.bold, color: t.colors.foreground }}>
          {ability ? getAbilityLabel(ability) : ''}
        </Text>
        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[1], marginBottom: t.spacing[3] }}>
          Scegli un valore da assegnare.
        </Text>
        <View style={[s.row, s.gap(t.spacing[2]), { flexWrap: 'wrap' }]}>
          {pool.map((v) => (
            <Pressable
              key={v}
              onPress={() => onSelect(v)}
              style={{
                width: 72,
                paddingVertical: t.spacing[2],
                borderRadius: t.radius.md,
                borderWidth: 2,
                borderColor: t.colors.border,
                backgroundColor: t.colors.input,
                ...s.center,
              }}
            >
              <Text style={{ fontSize: t.typography.lg, fontWeight: '800', color: t.colors.foreground }}>{v}</Text>
              <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
                {getAbilityModifier(v) >= 0 ? '+' : ''}{getAbilityModifier(v)}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: t.spacing[3] }}>
          Tocca fuori per annullare.
        </Text>
      </View>
    </BottomModal>
  );
}
