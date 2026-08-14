import { Pressable, Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Card } from '../../ui/card';
import {
  STANDARD_ARRAY,
  getAbilityLabel,
  getAbilityAbbreviation,
  getAbilityModifier,
} from '../../../lib/rules/abilities';
import type { AbilityAssignmentResult } from '../../../lib/rules/character-builder';
import { s } from '../../../utils/style-helpers';
import { ABILITY_ORDER } from './wizardSteps';
import StepLabel from './StepLabel';
import Chip from './Chip';
import type { Ability } from '../../../types';

type Props = {
  assigned: Partial<Record<Ability, number>>;
  onEditAbility: (ability: Ability) => void;
  onClear: (ability: Ability) => void;
  showBoosts: boolean;
  allowedAbilities: Ability[];
  plusTwoPlusOne: boolean;
  picks: (Ability | null)[];
  onTogglePick: (ability: Ability) => void;
  finalResult: AbilityAssignmentResult | null;
};

/** Step 6 — Punteggi di caratteristica (standard array + boost background + ASI) */
export default function AbilitiesStep({
  assigned,
  onEditAbility,
  onClear,
  showBoosts,
  allowedAbilities,
  plusTwoPlusOne,
  picks,
  onTogglePick,
  finalResult,
}: Props) {
  const t = useTokens();

  return (
    <View style={[s.gap(t.spacing[4])]}>
      <StepLabel>PUNTEGGI DI CARATTERISTICA</StepLabel>
      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginBottom: t.spacing[1] }}>
        Distribuisci lo standard array ({STANDARD_ARRAY.join(', ')}): tocca un'abilità per assegnarle un valore, oppure la × per liberarlo.
      </Text>

      {/* Abilità (tocca una riga per aprire la scelta del valore) */}
      <View>
        <StepLabel>ABILITÀ</StepLabel>
        <View style={[s.gap(t.spacing[2])]}>
          {ABILITY_ORDER.map((a) => {
            const value = assigned[a];
            const filled = value != null;
            return (
              <View
                key={a}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: t.spacing[2],
                  paddingHorizontal: t.spacing[3],
                  borderRadius: t.radius.md,
                  borderWidth: 1,
                  borderColor: filled ? t.colors.accent : t.colors.border,
                  backgroundColor: filled ? t.colors.accent + '10' : t.colors.card,
                }}
              >
                <Pressable
                  onPress={() => onEditAbility(a)}
                  style={[s.flex, s.row, { alignItems: 'center' }]}
                >
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: t.radius.sm,
                      backgroundColor: filled ? t.colors.accent : t.colors.accentSubtle,
                      ...s.center,
                      marginRight: t.spacing[3],
                    }}
                  >
                    <Text style={{ fontSize: t.typography.base, fontWeight: '800', color: filled ? t.colors.accentForeground : t.colors.accent }}>
                      {getAbilityAbbreviation(a)}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: t.typography.md, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
                      {getAbilityLabel(a)}
                    </Text>
                    <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
                      {filled ? 'Assegnato' : 'Tocca per assegnare'}
                    </Text>
                  </View>
                </Pressable>
                {filled ? (
                  <View style={[s.row, s.gap(t.spacing[2]), { alignItems: 'center' }]}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: t.typography.lg, fontWeight: '800', color: t.colors.accent }}>{value}</Text>
                      <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
                        {getAbilityModifier(value) >= 0 ? '+' : ''}{getAbilityModifier(value)}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => onClear(a)}
                      style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: t.colors.backgroundTertiary, ...s.center }}
                    >
                      <Text style={{ color: t.colors.foregroundSecondary, fontSize: t.typography.sm }}>×</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text style={{ fontSize: t.typography.lg, color: t.colors.foregroundTertiary }}>—</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Boost da background */}
      {showBoosts && allowedAbilities.length > 0 && (
        <View>
          <StepLabel>BOOST DA BACKGROUND ({plusTwoPlusOne ? '+2 / +1' : '+1 / +1 / +1'})</StepLabel>
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginBottom: t.spacing[1] }}>
            Consentite: {allowedAbilities.map((a) => getAbilityAbbreviation(a)).join(', ')}
          </Text>
          <View style={[s.row, s.gap(t.spacing[2]), { flexWrap: 'wrap' }]}>
            {allowedAbilities.map((ab) => {
              const slotIdx = picks.findIndex((p) => p === ab);
              const isPicked = slotIdx >= 0;
              const bonus = plusTwoPlusOne ? (slotIdx === 0 ? 2 : 1) : 1;
              return (
                <Chip
                  key={ab}
                  label={getAbilityAbbreviation(ab)}
                  selected={isPicked}
                  selectedSuffix={isPicked ? ` +${bonus}` : undefined}
                  onPress={() => onTogglePick(ab)}
                />
              );
            })}
          </View>
        </View>
      )}

      {/* ASI (5.5e) spostati nello step Talenti: lì scegli ASI o talento per livello */}
      <View>
        <StepLabel>AUMENTI DEI PUNTEGGI (ASI)</StepLabel>
        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
          Gli ASI (livelli 4/8/12/16) si assegnano nello step Talenti, dove per ogni livello scegli
          ASI o talento generale.
        </Text>
      </View>

      {/* Anteprima punteggi finali */}
      {finalResult && finalResult.success && (
        <Card variant="outlined">
          <Card.Title>Punteggi finali</Card.Title>
          <View style={[s.gap(t.spacing[1])]}>
            {ABILITY_ORDER.map((a) => {
              const sc = finalResult.scores[a];
              return (
                <View key={a} style={s.row}>
                  <Text style={[s.flex, { fontSize: t.typography.sm, color: t.colors.foregroundSecondary }]}>
                    {getAbilityLabel(a)}
                  </Text>
                  <Text style={{ fontSize: t.typography.sm, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
                    {sc} ({getAbilityModifier(sc) >= 0 ? '+' : ''}{getAbilityModifier(sc)})
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      )}
      {finalResult && !finalResult.success && (
        <Text style={{ fontSize: t.typography.sm, color: t.colors.danger }}>{finalResult.error}</Text>
      )}
    </View>
  );
}
