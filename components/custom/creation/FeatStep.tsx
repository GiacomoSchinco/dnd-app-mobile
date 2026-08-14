import { Pressable, Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { getFeatAsiOptions } from '../../../lib/rules/feats';
import { getAbilityAbbreviation } from '../../../lib/rules/abilities';
import { s } from '../../../utils/style-helpers';
import StepLabel from './StepLabel';
import Chip from './Chip';
import { ABILITY_ORDER, FEAT_MODE_PENDING, type AsiAssignment, type AsiMode } from './wizardSteps';
import type { Ability, AbilityScores, FeatRaw } from '../../../types';

type Props = {
  level: number;
  // Stile di combattimento (Fighter/Paladin/Ranger)
  hasFightingStyle: boolean;
  fightingStyleOptions: FeatRaw[];
  fightingStyleId: number | null;
  onSelectFightingStyle: (id: number | null) => void;
  // ASI per livello: a ogni livello ASI si sceglie O l'ASI O un talento generale
  asiLevels: number[];
  asiAssignments: Record<number, AsiAssignment>;
  onAsiModeChange: (level: number, mode: AsiMode) => void;
  onAsiToggleAbility: (level: number, ability: Ability) => void;
  featAtAsiLevel: Record<number, number | null>;
  onSetAsiLevelFeat: (lvl: number, featId: number | null) => void;
  generalFeatOptions: FeatRaw[];
  // ASI scelti per i talenti selezionati (chiave = feat id)
  featAsiPicks: Record<number, Ability[]>;
  onToggleFeatAsi: (featId: number, ability: Ability) => void;
  // Dono epico
  epicBoonUnlocked: boolean;
  epicBoonOptions: FeatRaw[];
  epicBoonId: number | null;
  onSelectEpicBoon: (id: number | null) => void;
  /** Errore di validazione dei punteggi (es. ASI oltre 20) */
  validationError?: string | null;
  finalScores: AbilityScores | null;
};

function SectionTitle({ text, note }: { text: string; note?: string }) {
  const t = useTokens();
  return (
    <View style={{ marginBottom: t.spacing[2] }}>
      <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>{text}</Text>
      {note ? (
        <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: t.spacing[0.5] }}>
          {note}
        </Text>
      ) : null}
    </View>
  );
}

function FeatRow({
  feat,
  selected,
  disabled = false,
  asiPicks,
  onToggle,
  onToggleAsi,
}: {
  feat: FeatRaw;
  selected: boolean;
  disabled?: boolean;
  asiPicks?: Ability[];
  onToggle: () => void;
  onToggleAsi?: (ability: Ability) => void;
}) {
  const t = useTokens();
  const asiOptions = getFeatAsiOptions(feat);
  // Con una sola opzione consentita la scelta è automatica (nessun picker).
  // Con più opzioni mostriamo i chip della caratteristica (+1).
  const showAsi = selected && onToggleAsi != null && asiOptions.length > 1;

  return (
    <View
      style={{
        borderRadius: t.radius.md,
        borderWidth: 1,
        borderColor: selected ? t.colors.accent : t.colors.border,
        backgroundColor: selected ? t.colors.accent + '0F' : t.colors.card,
        overflow: 'hidden',
      }}
    >
      <Pressable
        onPress={onToggle}
        disabled={disabled}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          padding: t.spacing[3],
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground, flex: 1 }}>
          {feat.name}
        </Text>
        <Text style={{ fontSize: t.typography.sm, color: selected ? t.colors.accent : t.colors.foregroundTertiary, marginLeft: t.spacing[2] }}>
          {selected ? '✓' : '+'}
        </Text>
      </Pressable>

      {selected && (
        <View style={{ paddingHorizontal: t.spacing[3], paddingBottom: t.spacing[3], gap: t.spacing[2] }}>
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, lineHeight: 17 }}>
            {feat.description}
          </Text>
          {showAsi && (
            <View style={{ gap: t.spacing[1] }}>
              <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
                Aumento caratteristica (+1):
              </Text>
              <View style={[s.row, s.gap(t.spacing[1.5]), { flexWrap: 'wrap' }]}>
                {asiOptions.map((a) => (
                  <Chip
                    key={a}
                    label={getAbilityAbbreviation(a)}
                    selected={(asiPicks ?? []).includes(a)}
                    compact
                    onPress={() => onToggleAsi?.(a)}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

/** Step Talenti — ASI oppure Talento per livello, stile di combattimento e dono epico */
export default function FeatStep({
  level,
  hasFightingStyle,
  fightingStyleOptions,
  fightingStyleId,
  onSelectFightingStyle,
  asiLevels,
  asiAssignments,
  onAsiModeChange,
  onAsiToggleAbility,
  featAtAsiLevel,
  onSetAsiLevelFeat,
  generalFeatOptions,
  featAsiPicks,
  onToggleFeatAsi,
  epicBoonUnlocked,
  epicBoonOptions,
  epicBoonId,
  onSelectEpicBoon,
  validationError,
  finalScores,
}: Props) {
  const t = useTokens();
  const chosenIds = Object.values(featAtAsiLevel).filter(
    (v): v is number => v != null && v !== FEAT_MODE_PENDING,
  );

  return (
    <View style={[s.gap(t.spacing[4])]}>
      <StepLabel>TALENTI</StepLabel>
      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
        A ogni livello ASI scegli O un ASI (+2 a una caratteristica o +1 a due) O un talento generale, non entrambi.
      </Text>

      {/* Stile di combattimento */}
      {hasFightingStyle && (
        <View>
          <SectionTitle
            text="STILE DI COMBATTIMENTO"
            note="Scegli uno stile per il tuo combattente."
          />
          <View style={[s.row, s.gap(t.spacing[1.5]), { flexWrap: 'wrap' }]}>
            {fightingStyleOptions.map((f) => (
              <Chip
                key={f.id}
                label={f.name}
                selected={fightingStyleId === f.id}
                onPress={() => onSelectFightingStyle(fightingStyleId === f.id ? null : f.id)}
              />
            ))}
          </View>
        </View>
      )}

      {/* ASI oppure Talento generale, per livello */}
      {asiLevels.length > 0 && (
        <View>
          <SectionTitle
            text="ASI O TALENTO GENERALE"
            note="Per ogni livello scegli una delle due opzioni."
          />
          <View style={{ gap: t.spacing[3] }}>
            {asiLevels.map((lvl) => {
              const chosenId = featAtAsiLevel[lvl] ?? null;
              const isFeat = chosenId != null;
              const sec = asiAssignments[lvl];
              // Talenti già scelti a un ALTRO livello (non riproponibili qui)
              const takenElsewhere = new Set(
                Object.entries(featAtAsiLevel)
                  .filter(([l, id]) => id != null && id !== FEAT_MODE_PENDING && Number(l) !== lvl)
                  .map(([, id]) => id as number),
              );
              const available = generalFeatOptions.filter((f) => !takenElsewhere.has(f.id));

              return (
                <View
                  key={lvl}
                  style={{
                    borderRadius: t.radius.md,
                    borderWidth: 1,
                    borderColor: t.colors.border,
                    backgroundColor: t.colors.backgroundSecondary,
                    padding: t.spacing[3],
                    gap: t.spacing[2],
                  }}
                >
                  <View style={[s.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
                    <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
                      Livello {lvl}
                    </Text>
                    <View style={[s.row, s.gap(t.spacing[1.5])]}>
                      <Chip
                        label="ASI"
                        selected={!isFeat}
                        compact
                        onPress={() => onSetAsiLevelFeat(lvl, null)}
                      />
                      <Chip
                        label="Talento"
                        selected={isFeat}
                        compact
                        onPress={() => {
                          // Passa alla modalità talento (se non ci sei già)
                          if (!isFeat) onSetAsiLevelFeat(lvl, FEAT_MODE_PENDING);
                        }}
                      />
                    </View>
                  </View>

                  {!isFeat ? (
                    <View style={{ gap: t.spacing[2] }}>
                      <View style={[s.row, s.gap(t.spacing[1.5]), { flexWrap: 'wrap' }]}>
                        <Chip
                          label="+2 a una caratteristica"
                          selected={sec?.mode === 'plus_two'}
                          compact
                          onPress={() => onAsiModeChange(lvl, 'plus_two')}
                        />
                        <Chip
                          label="+1 a due caratteristiche"
                          selected={sec?.mode !== 'plus_two'}
                          compact
                          onPress={() => onAsiModeChange(lvl, 'two_plus_ones')}
                        />
                      </View>
                      <View style={[s.row, s.gap(t.spacing[1.5]), { flexWrap: 'wrap' }]}>
                        {ABILITY_ORDER.map((a) => {
                          const picked = sec?.slots.includes(a) ?? false;
                          const bonus = sec?.mode === 'plus_two' ? 2 : 1;
                          return (
                            <Chip
                              key={a}
                              label={getAbilityAbbreviation(a)}
                              selected={picked}
                              selectedSuffix={picked ? ` +${bonus}` : undefined}
                              onPress={() => onAsiToggleAbility(lvl, a)}
                            />
                          );
                        })}
                      </View>
                      {!sec || !sec.slots.every((s) => s != null) ? (
                        <Text style={{ fontSize: t.typography.xs, color: t.colors.danger }}>
                          Completa l'ASI: tocca una caratteristica per continuare.
                        </Text>
                      ) : null}
                    </View>
                  ) : available.length === 0 ? (
                    <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
                      Nessun talento disponibile per questo livello.
                    </Text>
                  ) : (
                    <View style={{ gap: t.spacing[2] }}>
                      {available.map((f) => (
                        <FeatRow
                          key={f.id}
                          feat={f}
                          selected={chosenId === f.id}
                          asiPicks={chosenId === f.id ? featAsiPicks[f.id] : undefined}
                          onToggle={() =>
                            onSetAsiLevelFeat(lvl, chosenId === f.id ? FEAT_MODE_PENDING : f.id)
                          }
                          onToggleAsi={(a) => onToggleFeatAsi(f.id, a)}
                        />
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Dono epico */}
      {epicBoonUnlocked && (
        <View>
          <SectionTitle
            text="DONO EPICO"
            note="Al livello 19 ottieni un dono epico."
          />
          {epicBoonOptions.length === 0 ? (
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary }}>
              Nessun dono epico disponibile con i requisiti attuali.
            </Text>
          ) : (
            <View style={{ gap: t.spacing[2] }}>
              {epicBoonOptions.map((f) => (
                <FeatRow
                  key={f.id}
                  feat={f}
                  selected={epicBoonId === f.id}
                  asiPicks={epicBoonId === f.id ? featAsiPicks[f.id] : undefined}
                  onToggle={() => onSelectEpicBoon(epicBoonId === f.id ? null : f.id)}
                  onToggleAsi={(a) => onToggleFeatAsi(f.id, a)}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Errore di validazione punteggi (es. ASI oltre 20) */}
      {validationError && (
        <Text style={{ fontSize: t.typography.sm, color: t.colors.danger }}>
          {validationError}
        </Text>
      )}

      {/* Riepilogo */}
      {finalScores != null && (
        <View
          style={{
            backgroundColor: t.colors.backgroundSecondary,
            borderRadius: t.radius.md,
            borderWidth: 1,
            borderColor: t.colors.border,
            padding: t.spacing[3],
            gap: t.spacing[1],
          }}
        >
          <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.foregroundTertiary }}>
            RIEPILOGO
          </Text>
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
            Talenti generali: {chosenIds.length > 0 ? chosenIds.map((id) => generalFeatOptions.find((f) => f.id === id)?.name).filter(Boolean).join(', ') : 'nessuno'}
          </Text>
          {fightingStyleId != null && (
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
              Stile: {fightingStyleOptions.find((f) => f.id === fightingStyleId)?.name ?? '—'}
            </Text>
          )}
          {epicBoonId != null && (
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
              Dono epico: {epicBoonOptions.find((f) => f.id === epicBoonId)?.name ?? '—'}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

