import { Pressable, Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Card } from '../../ui/card';
import { getAbilityLabel, getAbilityModifier } from '../../../lib/rules/abilities';
import { s } from '../../../utils/style-helpers';
import BottomModal from '../BottomModal';
import type { Ability } from '../../../types';

/** Una scelta possibile nel picker valori (standard array o punto acquisto) */
export type ScoreOption = {
  value: number;
  cost: number;
  disabled: boolean;
};

type Props = {
  /** Abilità in modifica (null = modale chiuso) */
  ability: Ability | null;
  /** Opzioni disponibili (valore + costo + se acquistabile) */
  options: ScoreOption[];
  /** Metodo di generazione punteggi */
  method: 'standard' | 'point_buy';
  /** Punti rimanenti (solo punto acquisto) */
  pointsLeft: number;
  onSelect: (value: number) => void;
  onClose: () => void;
};

/** Modale per scegliere quale valore assegnare a un'abilità (standard array o punto acquisto) */
export default function ValuePickerModal({ ability, options, method, pointsLeft, onSelect, onClose }: Props) {
  const t = useTokens();

  return (
    <BottomModal visible={ability != null} onClose={onClose}>
      <Card style={{ padding: t.spacing[5] }}>
        <Text style={{ fontSize: t.typography.lg, fontWeight: t.typography.bold, color: t.colors.foreground }}>
          {ability ? getAbilityLabel(ability) : ''}
        </Text>
        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[1], marginBottom: t.spacing[3] }}>
          {method === 'point_buy'
            ? `Scegli un valore (costo in punti). Punti rimanenti: ${pointsLeft}.`
            : 'Scegli un valore da assegnare.'}
        </Text>
        <View style={[s.row, s.gap(t.spacing[2]), { flexWrap: 'wrap' }]}>
          {options.map((o) => (
            <Pressable
              key={o.value}
              disabled={o.disabled}
              onPress={() => onSelect(o.value)}
              style={{
                width: 72,
                paddingVertical: t.spacing[2],
                borderRadius: t.radius.md,
                borderWidth: 2,
                borderColor: t.colors.border,
                backgroundColor: o.disabled ? t.colors.backgroundTertiary : t.colors.input,
                opacity: o.disabled ? 0.5 : 1,
                ...s.center,
              }}
            >
              <Text style={{ fontSize: t.typography.lg, fontWeight: '800', color: o.disabled ? t.colors.foregroundTertiary : t.colors.foreground }}>
                {o.value}
              </Text>
              <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
                {getAbilityModifier(o.value) >= 0 ? '+' : ''}{getAbilityModifier(o.value)}
              </Text>
              {method === 'point_buy' && (
                <Text style={{ fontSize: t.typography.xs, color: o.disabled ? t.colors.foregroundTertiary : t.colors.accent }}>
                  {o.cost} pt
                </Text>
              )}
            </Pressable>
          ))}
        </View>
        <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: t.spacing[3] }}>
          Tocca fuori per annullare.
        </Text>
      </Card>
    </BottomModal>
  );
}
