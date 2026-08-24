import { Pressable, Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import StepperButton from '../StepperButton';
import {
  STANDARD_ARRAY,
  POINT_BUY_TOTAL,
  POINT_BUY_COST,
  POINT_BUY_MIN,
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
  abilityMethod: 'standard' | 'point_buy';
  onMethodChange: (m: 'standard' | 'point_buy') => void;
  /** Distribuzione automatica consigliata in base alla classe */
  onSuggest: () => void;
  /** Stepper −/+ per il punto acquisto (delta +1/−1) */
  onAdjust: (ability: Ability, delta: 1 | -1) => void;
  pointsLeft: number;
  showBoosts: boolean;
  allowedAbilities: Ability[];
  plusTwoPlusOne: boolean;
  picks: (Ability | null)[];
  onTogglePick: (ability: Ability) => void;
  finalResult: AbilityAssignmentResult | null;
  /** Prerequisiti multiclasse mancanti (13+ nelle caratteristiche primarie) */
  multiclassPrereqMissing: string[];
};

/** Step 6 — Punteggi di caratteristica (standard array / punto acquisto + boost background + ASI) */
export default function AbilitiesStep({
  assigned,
  onEditAbility,
  onClear,
  abilityMethod,
  onMethodChange,
  onSuggest,
  onAdjust,
  pointsLeft,
  showBoosts,
  allowedAbilities,
  plusTwoPlusOne,
  picks,
  onTogglePick,
  finalResult,
  multiclassPrereqMissing,
}: Props) {
  const t = useTokens();

  return (
    <View style={[s.gap(t.spacing[4])]}>
      <StepLabel>PUNTEGGI DI CARATTERISTICA</StepLabel>

      {/* Prerequisiti multiclasse (13+ nelle caratteristiche primarie) */}
      {multiclassPrereqMissing.length > 0 && (
        <View
          style={{
            borderWidth: 1,
            borderColor: t.colors.danger,
            borderRadius: t.radius.md,
            padding: t.spacing[3],
            backgroundColor: t.colors.danger + '0F',
            gap: t.spacing[1],
          }}
        >
          <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.danger }}>
            ⚠️ Prerequisiti multiclasse non soddisfatti
          </Text>
          {multiclassPrereqMissing.map((m) => (
            <Text key={m} style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
              {m}
            </Text>
          ))}
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
            Il multiclasse richiede almeno 13 nelle caratteristiche primarie di ogni classe.
          </Text>
        </View>
      )}

      {/* Metodo di generazione punteggi */}
      <View style={[s.row, s.gap(t.spacing[2]), { flexWrap: 'wrap' }]}>
        <Chip
          label={`Standard Array (${STANDARD_ARRAY.join(', ')})`}
          selected={abilityMethod === 'standard'}
          onPress={() => onMethodChange('standard')}
        />
        <Chip
          label="Punto Acquisto (27)"
          selected={abilityMethod === 'point_buy'}
          onPress={() => onMethodChange('point_buy')}
        />
      </View>

      {/* Suggerimento automatico in base alla classe */}
      <View style={[s.row, s.gap(t.spacing[2]), { alignItems: 'center' }]}>
        <Text style={[s.flex, { fontSize: t.typography.sm, color: t.colors.foregroundSecondary }]}>
          Distribuzione automatica consigliata in base alla classe (massimo
          sull'abilità principale).
        </Text>
        <Button variant="outline" size="sm" onPress={onSuggest}>✨ Suggerisci</Button>
      </View>

      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginBottom: t.spacing[1] }}>
        {abilityMethod === 'point_buy'
          ? `Hai ${POINT_BUY_TOTAL} punti da spendere: usa i tasti −/+ per alzare o abbassare i punteggi (min 8, max 15), oppure tocca un'abilità per un valore preciso. Punti rimanenti: ${pointsLeft}.`
          : `Distribuisci lo standard array (${STANDARD_ARRAY.join(', ')}): tocca un'abilità per assegnarle un valore, oppure la × per liberarlo.`}
      </Text>

      {/* Abilità (tocca una riga per aprire la scelta del valore) */}
      <View>
        <StepLabel>ABILITÀ</StepLabel>
        <View style={[s.gap(t.spacing[2])]}>
          {ABILITY_ORDER.map((a) => {
            const value = assigned[a];
            const isPointBuy = abilityMethod === 'point_buy';
            // Nel punto acquisto ogni abilità ha sempre un valore (min 8) e si
            // regola coi tasti −/+; nello standard array resta vuota finché non
            // assegnata.
            const displayValue = value != null ? value : POINT_BUY_MIN;
            const filled = value != null;
            const rowFilled = isPointBuy || filled;
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
                  borderColor: rowFilled ? t.colors.accent : t.colors.border,
                  backgroundColor: rowFilled ? t.colors.accent + '10' : t.colors.card,
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
                      backgroundColor: rowFilled ? t.colors.accent : t.colors.accentSubtle,
                      ...s.center,
                      marginRight: t.spacing[3],
                    }}
                  >
                    <Text style={{ fontSize: t.typography.base, fontWeight: '800', color: rowFilled ? t.colors.accentForeground : t.colors.accent }}>
                      {getAbilityAbbreviation(a)}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: t.typography.md, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
                      {getAbilityLabel(a)}
                    </Text>
                    <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
                      {isPointBuy
                        ? value != null ? 'Assegnato' : '8 (0 pt)'
                        : filled ? 'Assegnato' : 'Tocca per assegnare'}
                    </Text>
                  </View>
                </Pressable>
                {isPointBuy ? (
                  <View style={[s.row, s.gap(t.spacing[2]), { alignItems: 'center' }]}>
                    <StepperButton onPress={() => onAdjust(a, -1)}>−</StepperButton>
                    <View style={{ alignItems: 'center', minWidth: 36 }}>
                      <Text style={{ fontSize: t.typography.lg, fontWeight: '800', color: t.colors.accent }}>{displayValue}</Text>
                      <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
                        {POINT_BUY_COST[displayValue]} pt
                      </Text>
                    </View>
                    <StepperButton onPress={() => onAdjust(a, 1)}>+</StepperButton>
                  </View>
                ) : filled ? (
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
