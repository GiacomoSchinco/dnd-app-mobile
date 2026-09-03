import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../components/ui/prism-provider';
import TabHeader from '../../components/custom/TabHeader';
import MissingActiveCharacter from '../../components/custom/MissingActiveCharacter';
import SectionBlock from '../../components/custom/SectionBlock';
import BottomModal from '../../components/custom/BottomModal';
import ListCard from '../../components/custom/ListCard';
import CharacterBar from '../../components/custom/Spells/CharacterBar';
import { getAllSkills, getSkillModifierTotal, type SkillDefinition } from '../../lib/rules/skills';
import { getAllAbilities, getAbilityModifier, formatModifier, getEffectiveAbilityScores } from '../../lib/rules/abilities';
import type { AbilityScores } from '../../types';
import { useActiveCharacter } from '../../store/useActiveCharacter';
import { s } from '../../utils/style-helpers';

/** Le 6 caratteristiche in ordine canonico (FOR → CAR) */
const ABILITIES = getAllAbilities();

/** Punteggi neutri (10) usati quando non c'è un PG attivo (regola hooks: nessun hook dopo la guardia) */
const DEFAULT_ABILITIES: AbilityScores = {
  strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10,
};

/**
 * Tab "Abilità" — elenco leggibile delle 18 skill del PG attivo.
 * Modificatore = abilità + bonus di competenza (raddoppiato per maestria/expertise).
 * Le competenze includono quelle da classe, background, talenti e razza.
 */
export default function SkillsScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { activeChar } = useActiveCharacter();
  const [selectedSkill, setSelectedSkill] = useState<SkillDefinition | null>(null);

  // Punteggi effettivi = base + modificatori manuali (correzioni utente)
  // ⚠️ REGOLA HOOK: dichiarato PRIMA della guardia `if (!activeChar)` (fallback neutro = 10)
  const effectiveScores = useMemo(
    () => getEffectiveAbilityScores(activeChar?.abilities ?? DEFAULT_ABILITIES, activeChar?.abilityModifiers ?? []),
    [activeChar?.abilities, activeChar?.abilityModifiers],
  );

  if (!activeChar) {
    return <MissingActiveCharacter dndIcon="bullseye" message="Apri un personaggio dalla Home per vedere le sue abilità." />;
  }

  const pb = activeChar.proficiencyBonus ?? 0;
  const profSkills = activeChar.proficiencies?.skills ?? [];
  const expSkills = activeChar.proficiencies?.expertise ?? [];
  // Modificatori manuali alle skill (correzioni utente)
  const skillModifiers = activeChar.skillModifiers ?? [];

  return (
    <View style={[s.flex, { backgroundColor: t.colors.background }]}>
      <TabHeader title="Abilità" icon="bulb-outline">
        <CharacterBar activeChar={activeChar} spellInformation={false}/>
        <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: t.spacing[1] }}>
          ✓ competenza · ⭐ maestria (expertise) — qui decidi cosa fare fuori dal combattimento
        </Text>
        <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, marginTop: t.spacing[0.5] }}>
          Tocca una competenza per vedere la sua descrizione
        </Text>
      </TabHeader>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: t.spacing[4], paddingBottom: insets.bottom + 88 }}
        showsVerticalScrollIndicator={false}
      >
        {ABILITIES.map((ab) => {
          const group = getAllSkills().filter((sk) => sk.ability === ab.name);
          if (group.length === 0) return null;
          return (
            <SectionBlock
              key={ab.name}
              title={ab.nameIt}
              right={ab.abbreviation}
              titleMarginBottom={t.spacing[1]}
              marginBottom={t.spacing[4]}
            >
              <ListCard>
                {group.map((skill, idx) => {
                  const prof = profSkills.includes(skill.name);
                  const exp = expSkills.includes(skill.name);
                  const abMod = getAbilityModifier(effectiveScores[skill.ability]);
                  const skillModTotal = getSkillModifierTotal(skillModifiers, skill.name);
                  const total = abMod + (exp ? pb * 2 : prof ? pb : 0) + skillModTotal;
                  return (
                    <Pressable
                      key={skill.name}
                      onPress={() => setSelectedSkill(skill)}
                      style={({ pressed }) => [
                        s.row,
                        { justifyContent: 'space-between', paddingHorizontal: t.spacing[3], paddingVertical: t.spacing[2.5] },
                        idx > 0 && { borderTopWidth: 1, borderTopColor: t.colors.border },
                        pressed && { backgroundColor: t.colors.backgroundTertiary },
                      ]}
                    >
                      <View style={[s.row, s.gap(t.spacing[2])]}>
                        <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, width: 16 }}>
                          {exp ? '⭐' : prof ? '✓' : ''}
                        </Text>
                        <Text style={{ fontSize: t.typography.sm, color: prof || exp ? t.colors.foreground : t.colors.foregroundSecondary, fontWeight: prof || exp ? '600' : '400' }}>
                          {skill.nameIt}
                        </Text>
                      </View>
                      <View style={[s.row, s.gap(t.spacing[1.5])]}>
                        {(prof || exp || skillModTotal !== 0) && (
                          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
                            {formatModifier(abMod)}
                            {prof && <> + {exp ? pb * 2 : pb}</>}
                            {skillModTotal !== 0 && <> + {formatModifier(skillModTotal)}</>}
                          </Text>
                        )}
                        <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: prof || exp ? t.colors.accent : t.colors.foreground, minWidth: 32, textAlign: 'right' }}>
                          {formatModifier(total)}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ListCard>
            </SectionBlock>
          );
        })}
      </ScrollView>

      <BottomModal visible={!!selectedSkill} onClose={() => setSelectedSkill(null)} showCloseButton>
        {selectedSkill && (
          <SkillDetailCard
            skill={selectedSkill}
            ability={ABILITIES.find((a) => a.name === selectedSkill.ability)}
            abMod={getAbilityModifier(effectiveScores[selectedSkill.ability])}
            prof={profSkills.includes(selectedSkill.name)}
            exp={expSkills.includes(selectedSkill.name)}
            pb={pb}
            skillModTotal={getSkillModifierTotal(skillModifiers, selectedSkill.name)}
          />
        )}
      </BottomModal>
    </View>
  );
}

/** Card del modale: cosa fa la skill + caratteristica + calcolo modificatore. */
function SkillDetailCard({
  skill,
  ability,
  abMod,
  prof,
  exp,
  pb,
  skillModTotal,
}: {
  skill: SkillDefinition;
  ability: (typeof ABILITIES)[number] | undefined;
  abMod: number;
  prof: boolean;
  exp: boolean;
  pb: number;
  skillModTotal: number;
}) {
  const t = useTokens();
  const total = abMod + (exp ? pb * 2 : prof ? pb : 0) + skillModTotal;
  const statusLabel = exp ? 'Maestria' : prof ? 'Competenza' : 'Non competente';
  const statusEmoji = exp ? '⭐' : prof ? '✓' : '';

  return (
    <View style={{ gap: t.spacing[4] }}>
      {/* Intestazione */}
      <View style={{ gap: t.spacing[1] }}>
        <Text style={{ fontSize: t.typography.xl, fontWeight: '700', color: t.colors.foreground }}>
          {statusEmoji} {skill.nameIt}
        </Text>
        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
          Abilità di {ability?.nameIt ?? skill.ability} ({ability?.abbreviation ?? ''})
        </Text>
      </View>

      {/* Chips: stato + modificatore */}
      <View style={[s.row, { flexWrap: 'wrap', gap: t.spacing[2] }]}>
        <View
          style={{
            borderRadius: t.radius.full,
            paddingHorizontal: t.spacing[2.5],
            paddingVertical: t.spacing[1],
            backgroundColor: prof || exp ? t.colors.accent : t.colors.backgroundSecondary,
            borderWidth: 1,
            borderColor: prof || exp ? t.colors.accent : t.colors.border,
          }}
        >
          <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: prof || exp ? t.colors.accentForeground : t.colors.foregroundSecondary }}>
            {statusLabel}
          </Text>
        </View>
        <View
          style={{
            borderRadius: t.radius.full,
            paddingHorizontal: t.spacing[2.5],
            paddingVertical: t.spacing[1],
            backgroundColor: t.colors.backgroundSecondary,
            borderWidth: 1,
            borderColor: t.colors.border,
          }}
        >
          <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.foregroundSecondary }}>
            Modificatore {formatModifier(total)}
          </Text>
        </View>
      </View>

      {/* Calcolo modificatore */}
      <View style={{ borderRadius: t.radius.lg, backgroundColor: t.colors.backgroundSecondary, padding: t.spacing[3], gap: t.spacing[1] }}>
        <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>Come si calcola</Text>
        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
          {ability?.nameIt ?? ''} {formatModifier(abMod)}
          {prof && <> + Competenza {formatModifier(pb)}</>}
          {exp && <> + Competenza ×2 {formatModifier(pb * 2)}</>}
          {skillModTotal !== 0 && <> + Modificatori {formatModifier(skillModTotal)}</>}
          {' = '}
          <Text style={{ fontWeight: '700', color: t.colors.accent }}>{formatModifier(total)}</Text>
        </Text>
      </View>

      {/* Descrizione */}
      <View style={{ gap: t.spacing[1] }}>
        <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>A cosa serve</Text>
        <Text style={{ fontSize: t.typography.sm, lineHeight: Math.round(20 * (t.scale ?? 1)), color: t.colors.foregroundSecondary }}>{skill.description}</Text>
      </View>
    </View>
  );
}
