import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { calculateLevelUpPreview, type LevelUpPreview } from '../../lib/rules/character-builder';
import { getClassNameItalian, getClass } from '../../lib/rules/classes';
import { getGeneralFeats, isFeatAvailable, getFeatAsiOptions, getFeatAsiCount } from '../../lib/rules/feats';
import { getAbilityAbbreviation, getAbilityModifier } from '../../lib/rules/abilities';
import { rollDie, DICE_COLORS } from '../../utils/dice';
import { s } from '../../utils/style-helpers';
import { ABILITY_ORDER, type AsiMode } from './creation/wizardSteps';
import BottomModal from './BottomModal';
import Chip from './creation/Chip';
import CardBox from './CardBox';
import LabelValueRow from './LabelValueRow';
import SectionTitle from './SectionTitle';
import type { Ability, Character, DiceType, LevelUpOptions } from '../../types';

type Props = {
  visible: boolean;
  character: Character;
  onClose: () => void;
  /** Chiamata con la classe selezionata e le opzioni raccolte nel modale */
  onConfirm: (className: string, options: LevelUpOptions) => void;
};

/**
 * Modale di level-up: scegli la classe da livellare, tira/prendi la media dei PF,
 * vedi le novità (feature, slot, risorse), gestisci ASI o talento e la sottoclasse
 * appena sbloccata. Alla conferma chiama `onConfirm` con le opzioni raccolte.
 */
export default function LevelUpModal({ visible, character, onClose, onConfirm }: Props) {
  const t = useTokens();

  const [selectedClass, setSelectedClass] = useState<string>(character.classes[0]?.className ?? '');
  const [hpChoice, setHpChoice] = useState<'average' | 'roll'>('average');
  const [hpRolled, setHpRolled] = useState<number | null>(null);
  const [asiChoice, setAsiChoice] = useState<'asi' | 'feat'>('asi');
  const [asiMode, setAsiMode] = useState<AsiMode>('plus_two');
  const [asiSlots, setAsiSlots] = useState<Ability[]>([]);
  const [featId, setFeatId] = useState<number | null>(null);
  const [featAsiPicks, setFeatAsiPicks] = useState<Ability[]>([]);
  const [subclassId, setSubclassId] = useState<number | null>(null);

  const preview: LevelUpPreview = useMemo(
    () =>
      selectedClass
        ? calculateLevelUpPreview(character, selectedClass)
        : { success: false, error: 'Nessuna classe selezionata' },
    [character, selectedClass]
  );

  // Reset quando si apre il modale o cambia il personaggio
  useEffect(() => {
    if (!visible) return;
    setSelectedClass(character.classes[0]?.className ?? '');
    setHpChoice('average');
    setHpRolled(null);
    setAsiChoice('asi');
    setAsiMode('plus_two');
    setAsiSlots([]);
    setFeatId(null);
    setFeatAsiPicks([]);
    setSubclassId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, character.id]);

  const conMod = getAbilityModifier(character.abilities?.constitution ?? 10);
  const hpGained =
    hpChoice === 'roll' && hpRolled != null ? Math.max(hpRolled + conMod, 1) : preview.success ? preview.averageHpGained : 0;

  // Talenti generali disponibili al nuovo livello totale
  const featOptions = useMemo(() => {
    const pr = preview;
    if (!pr.success) return [];
    const isSpellcaster = character.classes.some((cl) => getClass(cl.className)?.isSpellcaster);
    return getGeneralFeats().filter((f) =>
      isFeatAvailable(f, { level: pr.totalLevel, scores: character.abilities, isSpellcaster })
    );
  }, [preview, character]);

  // ── ASI ─────────────────────────────────────────────────────
  const asiSlotCount = asiMode === 'plus_two' ? 1 : 2;
  const asiComplete = asiSlots.length === asiSlotCount;
  const toggleAsiAbility = (a: Ability) => {
    setAsiSlots((prev) => {
      if (prev.includes(a)) return prev.filter((x) => x !== a);
      if (prev.length >= asiSlotCount) return prev;
      return [...prev, a];
    });
  };
  const asiBoosts = asiSlots.map((ability) => ({
    ability,
    amount: (asiMode === 'plus_two' ? 2 : 1) as 1 | 2,
  }));

  // ASI del talento scelto
  const selectedFeat = featId != null ? getGeneralFeats().find((f) => f.id === featId) : undefined;
  const selectedFeatAsiOptions = selectedFeat ? getFeatAsiOptions(selectedFeat) : [];
  const featAsiCount = getFeatAsiCount(selectedFeat);
  const featAsiComplete = selectedFeatAsiOptions.length <= 1 || featAsiPicks.length >= featAsiCount;
  const toggleFeatAsi = (a: Ability) => {
    setFeatAsiPicks((prev) => {
      if (prev.includes(a)) return prev.filter((x) => x !== a);
      if (prev.length >= featAsiCount) return prev;
      return [...prev, a];
    });
  };

  const hasAsi = preview.success && preview.asiLevels.length > 0;
  const asiValid = !hasAsi || (asiChoice === 'asi' ? asiComplete : featId != null && featAsiComplete);
  const subclassValid = !preview.success || !preview.subclassUnlocked || subclassId != null;

  const canConfirm = preview.success && asiValid && subclassValid;

  const handleConfirm = () => {
    if (!canConfirm || !preview.success) return;
    onConfirm(selectedClass, {
      hpRoll: hpChoice === 'roll' && hpRolled != null ? hpRolled : undefined,
      asiBoosts: hasAsi && asiChoice === 'asi' && asiBoosts.length > 0 ? asiBoosts : undefined,
      generalFeatId: hasAsi && asiChoice === 'feat' ? featId ?? undefined : undefined,
      featAsiPicks: featAsiPicks.length > 0 ? featAsiPicks : undefined,
      subclassId: subclassId ?? undefined,
    });
    onClose();
  };

  if (!preview.success) {
    return (
      <BottomModal visible={visible} onClose={onClose}>
        <Text style={{ fontSize: t.typography.md, color: t.colors.danger, fontWeight: '600' }}>
          {preview.error}
        </Text>
        <Button variant="outline" onPress={onClose} style={{ marginTop: t.spacing[4] }} fullWidth>
          Chiudi
        </Button>
      </BottomModal>
    );
  }

  return (
    <BottomModal visible={visible} onClose={onClose}>
      <View style={[s.gap(t.spacing[4])]}>
        {/* Titolo + classe da livellare */}
        <View>
          <Text style={{ fontSize: t.typography.lg, fontWeight: '700', color: t.colors.foreground }}>
            ⤴️ Salì di livello
          </Text>
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[1] }}>
            {character.classes.length > 1
              ? 'Scegli quale classe sale di livello.'
              : `${getClassNameItalian(preview.className)} ${preview.currentClassLevel}° → ${preview.newClassLevel}°`}
          </Text>
        </View>

        {/* Selettore classe (solo multiclasse) */}
        {character.classes.length > 1 && (
          <View style={[s.row, { gap: t.spacing[1.5], flexWrap: 'wrap' }]}>
            {character.classes.map((cl) => {
              const atMax = cl.level >= 20;
              return (
                <Chip
                  key={cl.className}
                  label={`${getClassNameItalian(cl.className)} ${cl.level}°`}
                  selected={selectedClass === cl.className}
                  disabled={atMax}
                  onPress={() => setSelectedClass(cl.className)}
                />
              );
            })}
          </View>
        )}

        {/* Badge riepilogo livello */}
        <View style={[s.row, { gap: t.spacing[1.5], flexWrap: 'wrap' }]}>
          <Badge variant="solid" size="sm">{getClassNameItalian(preview.className)} {preview.newClassLevel}°</Badge>
          <Badge variant="subtle" size="sm">Totale {preview.totalLevel}°</Badge>
          {hasAsi && <Badge variant="solid" size="sm" color={t.colors.accent}>ASI</Badge>}
          {preview.subclassUnlocked && <Badge variant="solid" size="sm" color={t.colors.accent}>Sottoclasse</Badge>}
        </View>

        {/* PF guadagnati */}
        <CardBox gap={t.spacing[2]}>
          <SectionTitle text="Punti Ferita" />
          <LabelValueRow
            label="Guadagni"
            value={`+${hpGained}`}
            valueColor={t.colors.accent}
            valueWeight="700"
            labelColor={t.colors.foreground}
            labelWeight="600"
          />
          <View style={[s.row, { gap: t.spacing[2], marginTop: t.spacing[2] }]}>
            <Chip
              label={`Media (+${preview.averageHpGained})`}
              selected={hpChoice === 'average'}
              compact
              onPress={() => setHpChoice('average')}
            />
            <Chip
              label={
                hpChoice === 'roll' && hpRolled != null
                  ? `Tiro: ${hpRolled}`
                  : `🎲 Tira (d${preview.hitDie})`
              }
              selected={hpChoice === 'roll'}
              compact
              onPress={() => {
                setHpChoice('roll');
                setHpRolled(rollDie(`d${preview.hitDie}` as DiceType));
              }}
            />
          </View>
          {hpChoice === 'roll' && hpRolled != null && (
            <Text style={{ fontSize: t.typography.xs, color: DICE_COLORS[`d${preview.hitDie}` as DiceType], fontWeight: '700' }}>
              Hai tirato {hpRolled} + {conMod >= 0 ? `+${conMod}` : conMod} (COS)
            </Text>
          )}
        </CardBox>

        {/* Nuove feature */}
        {preview.newFeatures.length > 0 && (
          <CardBox gap={t.spacing[2]}>
            <SectionTitle text="Nuove caratteristiche" />
            {preview.newFeatures.map((lvl) => (
              <View key={lvl.level}>
                <Text style={{ fontSize: t.typography.xs, fontWeight: '700', color: t.colors.foregroundTertiary, marginBottom: t.spacing[0.5] }}>
                  LIVELLO {lvl.level}
                </Text>
                <Text style={{ fontSize: t.typography.sm, color: t.colors.foreground }}>
                  {lvl.features.join(', ')}
                </Text>
              </View>
            ))}
          </CardBox>
        )}

        {/* Nuovi slot incantesimi */}
        {Object.keys(preview.newSpellSlots).length > 0 && (
          <CardBox gap={t.spacing[2]}>
            <SectionTitle text="Nuovi slot incantesimo" />
            {Object.entries(preview.newSpellSlots).map(([lvl, count]) => (
              <LabelValueRow key={lvl} label={`Slot ${lvl}°`} value={`+${count}`} valueColor={t.colors.accent} />
            ))}
          </CardBox>
        )}

        {/* Risorse che cambiano */}
        {preview.resourceChanges.length > 0 && (
          <CardBox gap={t.spacing[2]}>
            <SectionTitle text="Risorse" />
            {preview.resourceChanges.map((r) => (
              <LabelValueRow key={r.resource} label={r.resource} value={`${r.newValue}`} valueColor={t.colors.accent} />
            ))}
          </CardBox>
        )}

        {/* ASI: +2 / +1+1 oppure talento generale */}
        {hasAsi && (
          <CardBox gap={t.spacing[3]}>
            <SectionTitle text="Aumento dei punteggi (ASI)" />
            <View style={[s.row, { gap: t.spacing[1.5] }]}>
              <Chip label="ASI" selected={asiChoice === 'asi'} compact onPress={() => setAsiChoice('asi')} />
              <Chip label="Talento" selected={asiChoice === 'feat'} compact onPress={() => setAsiChoice('feat')} />
            </View>

            {asiChoice === 'asi' ? (
              <>
                <View style={[s.row, { gap: t.spacing[1.5] }]}>
                  <Chip label="+2 a una caratteristica" selected={asiMode === 'plus_two'} compact onPress={() => { setAsiMode('plus_two'); setAsiSlots([]); }} />
                  <Chip label="+1 a due" selected={asiMode === 'two_plus_ones'} compact onPress={() => { setAsiMode('two_plus_ones'); setAsiSlots([]); }} />
                </View>
                <View style={[s.row, { gap: t.spacing[1.5], flexWrap: 'wrap' }]}>
                  {ABILITY_ORDER.map((a) => (
                    <Chip
                      key={a}
                      label={getAbilityAbbreviation(a)}
                      selected={asiSlots.includes(a)}
                      compact
                      onPress={() => toggleAsiAbility(a)}
                    />
                  ))}
                </View>
                {!asiComplete && (
                  <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
                    Seleziona {asiSlotCount === 1 ? 'una caratteristica' : 'due caratteristiche'}.
                  </Text>
                )}
              </>
            ) : (
              <View style={[s.gap(t.spacing[2])]}>
                {featOptions.length === 0 && (
                  <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary }}>
                    Nessun talento disponibile per questo personaggio.
                  </Text>
                )}
                {featOptions.map((feat) => {
                  const sel = feat.id === featId;
                  const asiOpts = getFeatAsiOptions(feat);
                  return (
                    <View key={feat.id}>
                      <Chip
                        label={feat.name}
                        selected={sel}
                        compact
                        onPress={() => { setFeatId(sel ? null : feat.id); setFeatAsiPicks([]); }}
                      />
                      {sel && asiOpts.length > 1 && (
                        <View style={[s.row, { gap: t.spacing[1.5], flexWrap: 'wrap', marginTop: t.spacing[2] }]}>
                          {asiOpts.map((a) => (
                            <Chip
                              key={a}
                              label={`${getAbilityAbbreviation(a)} +1`}
                              selected={featAsiPicks.includes(a)}
                              compact
                              onPress={() => toggleFeatAsi(a)}
                            />
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </CardBox>
        )}

        {/* Sottoclasse sbloccata */}
        {preview.subclassUnlocked && (
          <CardBox gap={t.spacing[2]}>
            <SectionTitle text="Scegli la sottoclasse" />
            <View style={[s.row, { gap: t.spacing[1.5], flexWrap: 'wrap' }]}>
              {preview.subclasses.map((sc) => (
                <Chip
                  key={sc.id}
                  label={sc.name}
                  selected={subclassId === sc.id}
                  compact
                  onPress={() => setSubclassId(sc.id)}
                />
              ))}
            </View>
          </CardBox>
        )}

        {/* Azioni */}
        <View style={[s.gap(t.spacing[2])]}>
          {!canConfirm && (
            <Text style={{ fontSize: t.typography.xs, color: t.colors.danger, textAlign: 'center' }}>
              Completa le scelte evidenziate per salire di livello.
            </Text>
          )}
          <Button onPress={handleConfirm} disabled={!canConfirm} fullWidth>
            Conferma salita di livello
          </Button>
          <Button variant="outline" onPress={onClose} fullWidth>
            Annulla
          </Button>
        </View>
      </View>
    </BottomModal>
  );
}
