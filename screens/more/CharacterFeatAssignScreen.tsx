import { useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AltroStackParamList } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../components/ui/prism-provider';
import ScreenHeader from '../../components/custom/ScreenHeader';
import MissingActiveCharacter from '../../components/custom/MissingActiveCharacter';
import BottomModal from '../../components/custom/BottomModal';
import CardBox from '../../components/custom/CardBox';
import { Button } from '../../components/ui/button';
import FeatChoicePicker from '../../components/custom/creation/FeatChoicePicker';
import {
  getOriginFeats,
  getGeneralFeats,
  getEpicBoons,
  isFeatChoiceComplete,
} from '../../lib/rules/feats';
import { useActiveCharacter } from '../../store/useActiveCharacter';
import { getProficiencyBonus } from '../../lib/rules/progression';
import { s } from '../../utils/style-helpers';
import type { FeatRaw, FeatChoiceSelection, SkillName } from '../../types';

/** Colori per categoria (stessa palette del Compendio talenti) */
const CATEGORY_COLORS: Record<string, string> = {
  origin: '#10B981',
  general: '#3B82F6',
  epic_boon: '#F59E0B',
  fighting_style: '#EC4899',
};

/** Etichetta italiana per categoria */
const CATEGORY_LABELS: Record<string, string> = {
  origin: 'Talento delle origini',
  general: 'Talento generale',
  epic_boon: 'Dono epico',
  fighting_style: 'Stile di combattimento',
};

/** Riepilogo compatto dei prerequisiti (es. "FOR 13 · Livello 4") */
function prereqSummary(feat: FeatRaw): string {
  const parts: string[] = [];
  for (const p of feat.prerequisites ?? []) {
    if (p.type === 'ability_score' && p.field && typeof p.value === 'number')
      parts.push(`${p.field} ${p.value}`);
    else if (p.type === 'level' && typeof p.value === 'number') parts.push(`Livello ${p.value}`);
    else if (p.type === 'weapon_proficiency' && typeof p.value === 'string')
      parts.push(`Competenza: ${p.value}`);
  }
  if (feat.level_requirement && feat.level_requirement > 1) {
    if (!parts.some((p) => p.startsWith('Livello'))) parts.push(`Livello ${feat.level_requirement}`);
  }
  return parts.join(' · ');
}

/**
 * Gestione manuale dei talenti del PG attivo (sezione Altro): assegna un talento
 * (con tutte le scelte del choice_config) oppure lo rimuove. Il toggle applica
 * subito le concessioni meccaniche (competenze, modificatori, risorse, magie, ASI).
 */
export default function CharacterFeatAssignScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AltroStackParamList>>();
  const { activeChar, addFeatToCharacter, removeFeatFromCharacter } = useActiveCharacter();

  // Talento in fase di configurazione (con choice_config) + scelte correnti
  const [choosing, setChoosing] = useState<FeatRaw | null>(null);
  const [pendingChoice, setPendingChoice] = useState<FeatChoiceSelection>({});

  // Talenti posseduti dal PG (per il toggle) — per NOME (feats/epicBoons salvano i nomi)
  const owned = useMemo(
    () => new Set([...(activeChar?.feats ?? []), ...(activeChar?.epicBoons ?? [])]),
    [activeChar?.feats, activeChar?.epicBoons],
  );

  const featsByCategory = useMemo(
    () => [
      { key: 'origin', label: 'TALENTI DELLE ORIGINI', feats: getOriginFeats() },
      { key: 'general', label: 'TALENTI GENERALI', feats: getGeneralFeats() },
      { key: 'epic_boon', label: 'DONI EPICI', feats: getEpicBoons() },
    ],
    [],
  );

  // Skill già competenti (per le scelte prof/expertise del picker)
  const knownSkills = (activeChar?.proficiencies?.skills ?? []) as SkillName[];
  const proficiencyBonus = activeChar?.proficiencyBonus ?? 2;

  const startAdd = (feat: FeatRaw) => {
    // Con scelte extra (choice_config) → configura nel modale; altrimenti aggiungi subito
    if (feat.choice_config) {
      setPendingChoice({});
      setChoosing(feat);
    } else {
      addFeatToCharacter(feat.id);
    }
  };

  const confirmAdd = () => {
    if (!choosing) return;
    addFeatToCharacter(choosing.id, pendingChoice);
    setChoosing(null);
    setPendingChoice({});
  };

  if (!activeChar) {
    return <MissingActiveCharacter message="Apri un personaggio dalla Home per gestire i suoi talenti." />;
  }

  return (
    <>
      <View
        style={[
          s.flex,
          {
            backgroundColor: t.colors.background,
            paddingTop: insets.top + t.spacing[2],
            paddingHorizontal: t.spacing[4],
          },
        ]}
      >
        <ScreenHeader
          title="Gestione Talenti"
          icon="medal"
          onBack={() => navigation.goBack()}
          backLabel="Torna ad Altro"
          subtitle="Assegna o rimuovi talenti: quelli del personaggio compaiono nella tab Talenti. Con le scelte extra puoi configurarle prima di aggiungere."
        />

        <ScrollView
          style={[s.flex, { marginTop: t.spacing[2] }]}
          contentContainerStyle={{ paddingBottom: insets.bottom + t.spacing[10] }}
          showsVerticalScrollIndicator={false}
        >
          {featsByCategory.map((group) =>
            group.feats.length > 0 ? (
              <View key={group.key} style={{ marginBottom: t.spacing[5] }}>
                <Text
                  style={{
                    fontSize: t.typography.xs,
                    fontWeight: '700',
                    color: t.colors.foregroundTertiary,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: t.spacing[2],
                  }}
                >
                  {group.label}
                </Text>
                <View style={{ gap: t.spacing[2] }}>
                  {group.feats.map((feat) => {
                    const isOwned = owned.has(feat.name);
                    const color = CATEGORY_COLORS[feat.category] || t.colors.accent;
                    const prereq = prereqSummary(feat);
                    return (
                      <CardBox key={feat.id} padding={t.spacing[3]} gap={t.spacing[1.5]}>
                        <View style={[s.row, { alignItems: 'flex-start', gap: t.spacing[2] }]}>
                          <View style={[s.flex, { gap: t.spacing[1] }]}>
                            <View style={[s.row, { alignItems: 'center', gap: t.spacing[2], flexWrap: 'wrap' }]}>
                              <Text
                                style={{
                                  fontSize: t.typography.sm,
                                  fontWeight: '700',
                                  color: t.colors.foreground,
                                  flexShrink: 1,
                                }}
                              >
                                {feat.name}
                              </Text>
                              {prereq ? (
                                <Text
                                  style={{
                                    fontSize: t.typography.xs,
                                    color: t.colors.foregroundTertiary,
                                  }}
                                >
                                  {prereq}
                                </Text>
                              ) : null}
                            </View>
                            <View
                              style={{
                                alignSelf: 'flex-start',
                                backgroundColor: color + '1A',
                                borderRadius: t.radius.full,
                                paddingHorizontal: t.spacing[2],
                                paddingVertical: t.spacing[0.5],
                              }}
                            >
                              <Text style={{ fontSize: t.typography.xs, fontWeight: '700', color }}>
                                {CATEGORY_LABELS[feat.category] ?? feat.category}
                              </Text>
                            </View>
                            <Text
                              style={{
                                fontSize: t.typography.xs,
                                color: t.colors.foregroundSecondary,
                                lineHeight: 17,
                              }}
                            >
                              {feat.description}
                            </Text>
                          </View>
                        </View>

                        <View style={{ marginTop: t.spacing[1] }}>
                          {isOwned ? (
                            <Button
                              variant="outline"
                              size="sm"
                              fullWidth
                              onPress={() => removeFeatFromCharacter(feat.id)}
                            >
                              ✓ Posseduto — Rimuovi
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" fullWidth onPress={() => startAdd(feat)}>
                              {feat.choice_config ? '＋ Aggiungi (con scelte)' : '＋ Aggiungi'}
                            </Button>
                          )}
                        </View>
                      </CardBox>
                    );
                  })}
                </View>
              </View>
            ) : null,
          )}
        </ScrollView>
      </View>

      {/* Configurazione delle scelte extra del talento prima di aggiungerlo */}
      <BottomModal
        visible={choosing != null}
        onClose={() => {
          setChoosing(null);
          setPendingChoice({});
        }}
        showCloseButton
      >
        {choosing ? (
          <View style={{ gap: t.spacing[3] }}>
            <Text style={{ fontSize: t.typography.md, fontWeight: '700', color: t.colors.foreground }}>
              {choosing.name}
            </Text>
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 20 }}>
              {choosing.description}
            </Text>
            <FeatChoicePicker
              feat={choosing}
              value={pendingChoice}
              onChange={setPendingChoice}
              knownSkills={knownSkills}
              knownExpertise={activeChar.proficiencies?.expertise ?? []}
              proficiencyBonus={proficiencyBonus}
            />
            <Button
              variant="solid"
              size="md"
              fullWidth
              disabled={!isFeatChoiceComplete(choosing, pendingChoice, proficiencyBonus)}
              onPress={confirmAdd}
            >
              Aggiungi talento
            </Button>
          </View>
        ) : null}
      </BottomModal>
    </>
  );
}
