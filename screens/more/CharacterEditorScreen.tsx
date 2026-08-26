import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AltroStackParamList } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../components/ui/prism-provider';
import ScreenHeader from '../../components/custom/ScreenHeader';
import BackButton from '../../components/custom/BackButton';
import MissingActiveCharacter from '../../components/custom/MissingActiveCharacter';
import CardBox from '../../components/custom/CardBox';
import StepperButton from '../../components/custom/StepperButton';
import StepperRow from '../../components/custom/StepperRow';
import AddModifierModal from '../../components/custom/AddModifierModal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  getAllAbilities,
  getAbilityModifier,
  getAbilityModifierTotal,
  formatModifier,
  getEffectiveAbilityScore,
  getEffectiveAbilityScores,
  getModifierTargetLabel,
} from '../../lib/rules/abilities';
import { getAllSkills, getSkillModifierTargetLabel } from '../../lib/rules/skills';
import type { Ability, AbilityModifier, AbilityScores, HitPoints, SkillModifier, SkillName } from '../../types';
import { useActiveCharacter } from '../../store/useActiveCharacter';
import { s } from '../../utils/style-helpers';
import { FLOATING_TAB_HEIGHT, FLOATING_TAB_GAP } from '../../utils/styles';

const SCORE_MIN = 1;
const SCORE_MAX = 30;
const MOD_MIN = -10;
const MOD_MAX = 10;
const HP_MIN = 0;
const HP_MAX = 9999;
const ARMOR_MIN = 0;
const ARMOR_MAX = 40;

/** PF di partenza per chi non ne ha ancora (bozza dell'editor) */
const DEFAULT_HP: HitPoints = { max: 1, current: 1, temporary: 0, hitDiceMax: 0, hitDiceCurrent: 0, hitDie: 'd8' };

/** Bozza PF a partire da un personaggio (default se assenti) */
const draftHpFrom = (hp?: HitPoints | null): HitPoints => (hp ? { ...hp } : { ...DEFAULT_HP });

/**
 * Editor di correzione del PG attivo (tab Altro): modifica a mano
 * nome, punteggi base e aggiunge modificatori alle abilità — utile
 * quando i dati derivati non tornano e serve correggerli.
 */
export default function CharacterEditorScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AltroStackParamList>>();
  const { activeChar, updateCharacter } = useActiveCharacter();

  const abilities = getAllAbilities();
  const skills = getAllSkills();

  // ── Bozza locale (draft): si edita qui, si salva SOLO con "Salva modifiche" ──
  const [draftName, setDraftName] = useState(activeChar?.name ?? '');
  const [draftAbilities, setDraftAbilities] = useState<AbilityScores>(
    { ...(activeChar?.abilities ?? {}) } as AbilityScores,
  );
  const [draftAbilityMods, setDraftAbilityMods] = useState<AbilityModifier[]>(() => [
    ...(activeChar?.abilityModifiers ?? []),
  ]);
  const [draftSkillMods, setDraftSkillMods] = useState<SkillModifier[]>(() => [
    ...(activeChar?.skillModifiers ?? []),
  ]);
  const [draftHitPoints, setDraftHitPoints] = useState<HitPoints>(() => draftHpFrom(activeChar?.hitPoints));
  const [draftArmorClass, setDraftArmorClass] = useState<number>(activeChar?.armorClass ?? 10);

  // ── Form "aggiungi modificatore abilità" ──
  const [showAddMod, setShowAddMod] = useState(false);
  // 'all' = tutte le abilità; altrimenti una o più abilità specifiche
  const [newAll, setNewAll] = useState(false);
  const [newAbilities, setNewAbilities] = useState<Ability[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState(1);

  // ── Form "aggiungi modificatore skill" ──
  const [showAddSkillMod, setShowAddSkillMod] = useState(false);
  // 'all' = tutte le skill; altrimenti una o più skill specifiche
  const [newSkillAll, setNewSkillAll] = useState(false);
  const [newSkills, setNewSkills] = useState<SkillName[]>([]);
  const [newSkillLabel, setNewSkillLabel] = useState('');
  const [newSkillValue, setNewSkillValue] = useState(1);

  // Ricarica la bozza quando cambia il personaggio attivo
  useEffect(() => {
    if (!activeChar) return;
    setDraftName(activeChar.name);
    setDraftAbilities({ ...activeChar.abilities });
    setDraftAbilityMods([...(activeChar.abilityModifiers ?? [])]);
    setDraftSkillMods([...(activeChar.skillModifiers ?? [])]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChar?.id]);

  const effective = useMemo(
    () => getEffectiveAbilityScores(draftAbilities, draftAbilityMods),
    [draftAbilities, draftAbilityMods],
  );

  // True se la bozza differisce da quanto salvato (serve per abilitare "Salva modifiche")
  const dirty = useMemo(() => {
    if (!activeChar) return false;
    const abDirty = abilities.some((ab) => draftAbilities[ab.name] !== (activeChar.abilities[ab.name] ?? 10));
    return (
      draftName !== activeChar.name ||
      abDirty ||
      JSON.stringify(draftAbilityMods) !== JSON.stringify(activeChar.abilityModifiers ?? []) ||
      JSON.stringify(draftSkillMods) !== JSON.stringify(activeChar.skillModifiers ?? []) ||
      JSON.stringify(draftHitPoints) !== JSON.stringify(activeChar.hitPoints ?? DEFAULT_HP) ||
      draftArmorClass !== (activeChar.armorClass ?? 10)
    );
  }, [activeChar, draftName, draftAbilities, draftAbilityMods, draftSkillMods, draftHitPoints, draftArmorClass, abilities]);

  if (!activeChar) {
    return <MissingActiveCharacter message="Apri un personaggio dalla Home per modificarne le caratteristiche." />;
  }

  // ── Nome (solo bozza) ──
  const setName = (name: string) => setDraftName(name);

  // ── Punteggi base (solo bozza) ──
  const setScore = (ability: Ability, delta: number) => {
    setDraftAbilities((prev) => {
      const current = prev[ability] ?? 10;
      return { ...prev, [ability]: Math.min(SCORE_MAX, Math.max(SCORE_MIN, current + delta)) };
    });
  };

  // ── Punti Ferita (solo bozza) ──
  const setHp = (field: 'max' | 'current' | 'temporary', delta: number) => {
    setDraftHitPoints((prev) => {
      const hp = draftHpFrom(prev);
      const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
      if (field === 'max') {
        const max = clamp(hp.max + delta, HP_MIN, HP_MAX);
        return { ...hp, max, current: clamp(hp.current, HP_MIN, max) };
      }
      if (field === 'current') return { ...hp, current: clamp(hp.current + delta, HP_MIN, hp.max) };
      return { ...hp, temporary: clamp(hp.temporary + delta, HP_MIN, HP_MAX) };
    });
  };

  // ── Classe Armatura (solo bozza) ──
  const setArmorClass = (delta: number) => {
    setDraftArmorClass((prev) => Math.min(ARMOR_MAX, Math.max(ARMOR_MIN, prev + delta)));
  };

  // ── Modificatori abilità (solo bozza) ──
  const addModifier = () => {
    if (!newAll && newAbilities.length === 0) return;
    const mod: AbilityModifier = {
      id: `mod_${Date.now()}`,
      label: newLabel.trim() || 'Modificatore',
      ability: newAll ? 'all' : newAbilities.length === 1 ? newAbilities[0] : newAbilities,
      value: newValue,
    };
    setDraftAbilityMods((prev) => [...prev, mod]);
    setNewAll(false);
    setNewAbilities([]);
    setNewLabel('');
    setNewValue(1);
    setShowAddMod(false);
  };

  const removeModifier = (id: string) => {
    setDraftAbilityMods((prev) => prev.filter((m) => m.id !== id));
  };

  // ── Modificatori skill (solo bozza) ──
  const addSkillModifier = () => {
    if (!newSkillAll && newSkills.length === 0) return;
    const mod: SkillModifier = {
      id: `skillmod_${Date.now()}`,
      label: newSkillLabel.trim() || 'Modificatore',
      skill: newSkillAll ? 'all' : newSkills.length === 1 ? newSkills[0] : newSkills,
      value: newSkillValue,
    };
    setDraftSkillMods((prev) => [...prev, mod]);
    setNewSkillAll(false);
    setNewSkills([]);
    setNewSkillLabel('');
    setNewSkillValue(1);
    setShowAddSkillMod(false);
  };

  const removeSkillModifier = (id: string) => {
    setDraftSkillMods((prev) => prev.filter((m) => m.id !== id));
  };

  // ── Salva / annulla: NIENTE tocca lo store finché non premi "Salva modifiche" ──
  const save = () => {
    if (!activeChar || !dirty) return;
    updateCharacter(activeChar.id, {
      name: draftName,
      abilities: draftAbilities,
      abilityModifiers: draftAbilityMods,
      skillModifiers: draftSkillMods,
      hitPoints: draftHitPoints,
      armorClass: draftArmorClass,
    });
  };

  const reset = () => {
    if (!activeChar) return;
    setDraftName(activeChar.name);
    setDraftAbilities({ ...activeChar.abilities });
    setDraftAbilityMods([...(activeChar.abilityModifiers ?? [])]);
    setDraftSkillMods([...(activeChar.skillModifiers ?? [])]);
    setDraftHitPoints(draftHpFrom(activeChar.hitPoints));
    setDraftArmorClass(activeChar.armorClass ?? 10);
    setDraftArmorClass(activeChar.armorClass ?? 10);
  };

  return (
    <View style={[s.flex, { backgroundColor: t.colors.background }]}>
      {/* Header fisso con safe-area — stessa struttura delle altre pagine pushate */}
      <View style={{ paddingTop: insets.top + t.spacing[3], paddingHorizontal: t.spacing[4], paddingBottom: t.spacing[2] }}>
        <BackButton onPress={() => navigation.goBack()} label="Altro" />
        <ScreenHeader
          title="Modifica personaggio"
          icon="create-outline"
          subtitle="Modifica in bozza e conferma in fondo con 'Salva modifiche'."
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: t.spacing[4], paddingBottom: t.spacing[8] }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Nome ── */}
        <CardBox gap={t.spacing[2]} marginBottom={t.spacing[5]}>
          <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>Nome</Text>
          <Input
            value={draftName}
            onChangeText={setName}
            placeholder="Nome del personaggio"
            helperText="Il nome viene salvato solo con 'Salva modifiche'."
          />
        </CardBox>

        {/* ── Caratteristiche (punteggi base) ── */}
        <CardBox gap={t.spacing[2]} marginBottom={t.spacing[5]}>
          <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
            Caratteristiche ({SCORE_MIN}–{SCORE_MAX})
          </Text>
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
            Usa i ± per correggere i punteggi base. I modificatori manuali si sommano qui sotto.
          </Text>
          {abilities.map((ab, idx) => {
            const base = draftAbilities[ab.name] ?? 10;
            const modTotal = getAbilityModifierTotal(draftAbilityMods, ab.name);
            const effectiveScore = getEffectiveAbilityScore(draftAbilities, ab.name, draftAbilityMods);
            return (
              <View
                key={ab.name}
                style={[
                  s.row,
                  { justifyContent: 'space-between' },
                  idx > 0 && { borderTopWidth: 1, borderTopColor: t.colors.border, paddingTop: t.spacing[2] },
                ]}
              >
                <View style={[s.row, s.gap(t.spacing[2])]}>
                  <View style={[s.box(34, t.radius.sm), { backgroundColor: t.colors.backgroundTertiary }]}>
                    <Text style={{ fontSize: t.typography.xs, fontWeight: '700', color: t.colors.foreground }}>
                      {ab.abbreviation}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
                      {ab.nameIt}
                    </Text>
                    <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
                      {modTotal !== 0
                        ? `base ${base} · effettivo ${effectiveScore}`
                        : `modificatore ${formatModifier(getAbilityModifier(base))}`}
                    </Text>
                  </View>
                </View>
                <View style={[s.row, s.gap(t.spacing[2])]}>
                  <StepperButton onPress={() => setScore(ab.name, -1)}>−</StepperButton>
                  <View style={{ alignItems: 'center', minWidth: 30 }}>
                    <Text style={{ fontSize: t.typography.base, fontWeight: '700', color: t.colors.foreground }}>
                      {base}
                    </Text>
                  </View>
                  <StepperButton onPress={() => setScore(ab.name, 1)}>+</StepperButton>
                </View>
              </View>
            );
          })}
        </CardBox>

        {/* ── Punti Ferita ── */}
        <CardBox gap={t.spacing[2]} marginBottom={t.spacing[5]}>
          <View style={[s.row, { justifyContent: 'space-between' }]}>
            <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
              Punti Ferita
            </Text>
            {draftHitPoints.hitDie && (
              <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
                Dado vita: {draftHitPoints.hitDie}
              </Text>
            )}
          </View>
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
            Corregge a mano PF massimi, attuali e temporanei (es. dopo un errore di livello).
          </Text>
          <StepperRow
            label="Massimi"
            value={draftHitPoints.max}
            onDecrement={() => setHp('max', -1)}
            onIncrement={() => setHp('max', 1)}
            labelSize={t.typography.base}
            labelColor={t.colors.foreground}
            valueColor={t.colors.foreground}
          />
          <StepperRow
            label="Attuali"
            value={draftHitPoints.current}
            onDecrement={() => setHp('current', -1)}
            onIncrement={() => setHp('current', 1)}
            labelSize={t.typography.base}
            labelColor={t.colors.foreground}
            valueColor={t.colors.accent}
          />
          <StepperRow
            label="Temporanei"
            value={draftHitPoints.temporary}
            onDecrement={() => setHp('temporary', -1)}
            onIncrement={() => setHp('temporary', 1)}
            labelSize={t.typography.base}
            labelColor={t.colors.foreground}
            valueColor={t.colors.foreground}
          />
        </CardBox>

        {/* ── Classe Armatura (CA) ── */}
        <CardBox gap={t.spacing[2]} marginBottom={t.spacing[5]}>
          <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
            Classe Armatura (CA)
          </Text>
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
            Corregge a mano la CA (es. armatura, scudo, modificatori particolari).
          </Text>
          <StepperRow
            label="CA"
            value={draftArmorClass}
            onDecrement={() => setArmorClass(-1)}
            onIncrement={() => setArmorClass(1)}
            labelSize={t.typography.base}
            labelColor={t.colors.foreground}
            valueColor={t.colors.foreground}
            minWidth={48}
          />
        </CardBox>

        {/* ── Modificatori alle abilità ── */}
        <CardBox gap={t.spacing[2]} marginBottom={t.spacing[5]}>
          <View style={[s.row, { justifyContent: 'space-between' }]}>
            <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
              Modificatori alle abilità
            </Text>
            <Pressable onPress={() => setShowAddMod(true)} hitSlop={8}>
              <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.accent }}>+ Aggiungi</Text>
            </Pressable>
          </View>
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
            Bonus/malus a una o più abilità (o a tutte, es. 'Talento: +1 a tutto').
          </Text>
          <ModifierList
            items={draftAbilityMods.map((m) => ({
              id: m.id,
              label: m.label,
              value: m.value,
              targetLabel: getModifierTargetLabel(m.ability),
            }))}
            onRemove={removeModifier}
          />
        </CardBox>

        {/* ── Modificatori alle skill ── */}
        <CardBox gap={t.spacing[2]} marginBottom={t.spacing[5]}>
          <View style={[s.row, { justifyContent: 'space-between' }]}>
            <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
              Modificatori alle skill
            </Text>
            <Pressable onPress={() => setShowAddSkillMod(true)} hitSlop={8}>
              <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.accent }}>+ Aggiungi</Text>
            </Pressable>
          </View>
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
            Bonus/malus a una o più skill (o a tutte, es. 'Talento: +2 a Percezione').
          </Text>
          <ModifierList
            items={draftSkillMods.map((m) => ({
              id: m.id,
              label: m.label,
              value: m.value,
              targetLabel: getSkillModifierTargetLabel(m.skill),
            }))}
            onRemove={removeSkillModifier}
          />
        </CardBox>

        {/* ── Riepilogo punteggi effettivi ── */}
        {effective && (
          <CardBox gap={t.spacing[2]} marginBottom={t.spacing[5]}>
            <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
              Punteggi effettivi (base + modificatori)
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[2] }}>
              {abilities.map((ab) => {
                const score = effective[ab.name];
                const mod = getAbilityModifier(score);
                return (
                  <View
                    key={ab.name}
                    style={{
                      flexBasis: '30%',
                      flexGrow: 1,
                      borderRadius: t.radius.md,
                      backgroundColor: t.colors.backgroundTertiary,
                      padding: t.spacing[2],
                      alignItems: 'center',
                      gap: t.spacing[0.5],
                    }}
                  >
                    <Text style={{ fontSize: t.typography.xs, fontWeight: '700', color: t.colors.foregroundTertiary }}>
                      {ab.abbreviation}
                    </Text>
                    <Text style={{ fontSize: t.typography.md, fontWeight: '700', color: t.colors.foreground }}>
                      {score}
                    </Text>
                    <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: mod >= 0 ? t.colors.accent : t.colors.danger }}>
                      {formatModifier(mod)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </CardBox>
        )}
      </ScrollView>

      {/* Barra di conferma — NIENTE viene salvato finché non premi "Salva modifiche" */}
      <View
        style={{
          padding: t.spacing[3],
          // Clearance per la floating tab bar: la barra resta SEMPRE visibile sopra la navbar
          paddingBottom: insets.bottom + FLOATING_TAB_HEIGHT + FLOATING_TAB_GAP,
          borderTopWidth: 1,
          borderTopColor: t.colors.border,
          backgroundColor: t.colors.background,
          gap: t.spacing[2],
        }}
      >
        {dirty && (
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, textAlign: 'center' }}>
            ⚠️ Hai modifiche non salvate
          </Text>
        )}
        <View style={[s.row, s.gap(t.spacing[3])]}>
          <Button variant="outline" onPress={reset} style={{ flex: 1 }}>
            Annulla
          </Button>
          <Button variant="solid" onPress={save} style={{ flex: 1 }} disabled={!dirty}>
            Salva modifiche
          </Button>
        </View>
      </View>

      {/* ── Modale "aggiungi modificatore abilità" ── */}
      <AddModifierModal
        visible={showAddMod}
        onClose={() => setShowAddMod(false)}
        title="Aggiungi modificatore (abilità)"
        targetLabel="Abilità"
        chips={[
          { key: 'all', label: 'Tutte le abilità', active: newAll, onPress: () => setNewAll(true) },
          ...abilities.map((ab) => ({
            key: ab.name,
            label: `${ab.abbreviation} · ${ab.nameIt}`,
            active: !newAll && newAbilities.includes(ab.name),
            onPress: () => {
              setNewAll(false);
              setNewAbilities((prev) =>
                prev.includes(ab.name) ? prev.filter((a) => a !== ab.name) : [...prev, ab.name],
              );
            },
          })),
        ]}
        labelValue={newLabel}
        onLabelChange={setNewLabel}
        value={newValue}
        onValueChange={setNewValue}
        minValue={MOD_MIN}
        maxValue={MOD_MAX}
        addDisabled={!newAll && newAbilities.length === 0}
        onAdd={addModifier}
        placeholder="es. Correzione DM, Pozione di forza…"
      />

      {/* ── Modale "aggiungi modificatore skill" ── */}
      <AddModifierModal
        visible={showAddSkillMod}
        onClose={() => setShowAddSkillMod(false)}
        title="Aggiungi modificatore (skill)"
        targetLabel="Skill"
        chips={[
          { key: 'all', label: 'Tutte le skill', active: newSkillAll, onPress: () => setNewSkillAll(true) },
          ...skills.map((sk) => ({
            key: sk.name,
            label: sk.nameIt,
            active: !newSkillAll && newSkills.includes(sk.name),
            onPress: () => {
              setNewSkillAll(false);
              setNewSkills((prev) =>
                prev.includes(sk.name) ? prev.filter((x) => x !== sk.name) : [...prev, sk.name],
              );
            },
          })),
        ]}
        labelValue={newSkillLabel}
        onLabelChange={setNewSkillLabel}
        value={newSkillValue}
        onValueChange={setNewSkillValue}
        minValue={MOD_MIN}
        maxValue={MOD_MAX}
        addDisabled={!newSkillAll && newSkills.length === 0}
        onAdd={addSkillModifier}
        placeholder="es. Talento, Correzione DM…"
      />
    </View>
  );
}

/** Lista di modificatori con rimozione — riusata per abilità e skill */
function ModifierList({
  items,
  onRemove,
}: {
  items: { id: string; label: string; value: number; targetLabel: string }[];
  onRemove: (id: string) => void;
}) {
  const t = useTokens();
  if (items.length === 0) {
    return <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>Nessun modificatore aggiunto.</Text>;
  }
  return (
    <>
      {items.map((m, idx) => (
        <View
          key={m.id}
          style={[
            s.row,
            { justifyContent: 'space-between' },
            idx > 0 && { borderTopWidth: 1, borderTopColor: t.colors.border, paddingTop: t.spacing[2] },
          ]}
        >
          <View style={[s.row, s.gap(t.spacing[2]), s.flex]}>
            <Text style={{ fontSize: t.typography.xs, fontWeight: '700', color: t.colors.accent }} numberOfLines={1}>
              {m.targetLabel}
            </Text>
            <Text style={[s.flex, { fontSize: t.typography.sm, color: t.colors.foregroundSecondary }]} numberOfLines={1}>
              {m.label}
            </Text>
          </View>
          <View style={[s.row, s.gap(t.spacing[2])]}>
            <Text style={{ fontSize: t.typography.sm, fontWeight: '700', color: m.value >= 0 ? t.colors.accent : t.colors.danger }}>
              {m.value > 0 ? `+${m.value}` : m.value}
            </Text>
            <Pressable onPress={() => onRemove(m.id)} hitSlop={8}>
              <Text style={{ fontSize: t.typography.sm, color: t.colors.danger }}>✕</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </>
  );
}
