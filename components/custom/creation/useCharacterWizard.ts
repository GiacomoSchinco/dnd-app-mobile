import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAllClasses, getClass } from '../../../lib/rules/classes';
import { getSubclassesByClassId, type SubclassDefinition } from '../../../lib/rules/subclasses';
import { getClassProgression, getFeaturesAtLevel, getAsiLevels } from '../../../lib/rules/progression';
import { hasLineages, getRaceEffects } from '../../../lib/rules/races';
import { getBackground } from '../../../lib/rules/backgrounds';
import { getFeat } from '../../../lib/rules/feats';
import { getToolOptions, type ToolOption } from '../../../lib/rules/apply-feat';
import { STANDARD_ARRAY, parseAbilityFromAbbreviation, getAbilityLabel, getAbilityModifier } from '../../../lib/rules/abilities';
import { parseSkillFromItalian, getAllSkills, getSkillNameItalian } from '../../../lib/rules/skills';
import { getClassSpellsAtLevel } from '../../../lib/rules/spells';
import type { FeatChoiceState, FeatChoiceType } from './FeatChoice';
import { calculateFinalAbilities, type AbilityBoost } from '../../../lib/rules/character-builder';
import type { AbilityAssignmentResult } from '../../../lib/rules/character-builder';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { STEPS, ABILITY_ORDER, ASI_FEATURE_NAME } from './wizardSteps';
import type { StepKey, AsiMode, AsiAssignment, SkillOption } from './wizardSteps';
import type { WizardStep } from './StepIndicator';
import type { ClassCarouselItem } from '../ClassCarousel';
import type { RootStackParamList } from '../../../types/navigation';
import type { ClassName, Ability, AbilityScores, CharacterDraft, SkillName } from '../../../types';

/**
 * Hook del wizard di creazione personaggio.
 * Incapsula TUTTO lo stato, i dati derivati, la validazione e la creazione:
 * la schermata (`CharacterCreateScreen`) resta un renderer sottile e ogni
 * passo è un componente presentational. Nessuna logica duplicata tra i passi.
 */

// Dati reali dal JSON: le classi (le altre liste vivono nei singoli step)
const CLASSES: ClassCarouselItem[] = getAllClasses().map((c) => ({
  key: c.name as ClassName,
  label: c.labelIt,
  desc: c.description,
}));

export interface CharacterWizard {
  // ── Passi e navigazione ──
  step: StepKey;
  setStep: (k: StepKey) => void;
  stepIndex: number;
  activeSteps: WizardStep[];
  canGoNext: boolean;
  isLastStep: boolean;
  canCreate: boolean;
  goNext: () => void;
  goPrev: () => void;
  error: string | null;

  // ── Nome ──
  name: string;
  setName: (v: string) => void;

  // ── Classe ──
  classes: ClassCarouselItem[];
  selectedClass: ClassName;
  setSelectedClass: (c: ClassName) => void;

  // ── Competenze ──
  classLabel: string;
  classSkillOptions: SkillOption[];
  skillCount: number;
  classSkills: SkillName[];
  toggleSkill: (s: SkillName) => void;

  // ── Livello ──
  level: number;
  setLevel: (l: number) => void;
  hitDie?: number;
  levelFeatures: string[];

  // ── Sottoclasse ──
  subclassLabel?: string;
  subclassLevels: number[];
  subclassUnlocked: boolean;
  subclasses: SubclassDefinition[];
  subclassId: number | null;
  setSubclassId: (id: number | null) => void;

  // ── Razza ──
  raceId: number | null;
  setRaceId: (id: number) => void;
  lineageId: number | null;
  setLineageId: (id: number | null) => void;
  raceSkillOptions: { key: SkillName; label: string }[];
  raceSkills: SkillName[];
  raceSkillCount: number;
  toggleRaceSkill: (skill: SkillName) => void;

  // ── Background ──
  backgroundId: number | null;
  setBackgroundId: (id: number) => void;

  // ── Talento di origine ──
  bgToolOptions: ToolOption[];
  bgToolChoices: string[];
  bgToolCount: number;
  toggleBgTool: (slug: string) => void;
  featChoice: FeatChoiceState;

  // ── Punteggi ──
  assigned: Partial<Record<Ability, number>>;
  editingAbility: Ability | null;
  openAbilityPicker: (a: Ability) => void;
  closeAbilityPicker: () => void;
  assignToAbility: (a: Ability, v: number) => void;
  clearAbility: (a: Ability) => void;
  pool: number[];
  allowedAbilities: Ability[];
  showBoosts: boolean;
  plusTwoPlusOne: boolean;
  picks: (Ability | null)[];
  togglePick: (a: Ability) => void;
  asiLevelsApplied: number[];
  asiAssignments: AsiAssignment[];
  setAsiMode: (i: number, m: AsiMode) => void;
  toggleAsiAbility: (i: number, a: Ability) => void;
  finalResult: AbilityAssignmentResult | null;

  // ── Punti Ferita ──
  hpRoll: number | null;
  setHpRoll: (v: number) => void;
  takeMaxHp: () => void;
  conMod: number;
  averagePerLevel: number;

  // ── Creazione ──
  handleCreate: () => void;
}

export function useCharacterWizard(): CharacterWizard {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const createCharacterFull = useCharacterStore((st) => st.createCharacterFull);

  // ── Stato del wizard ──
  const [step, setStep] = useState<StepKey>('name');
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassName>(CLASSES[0].key);
  const [raceId, setRaceId] = useState<number | null>(null);
  const [lineageId, setLineageId] = useState<number | null>(null);
  const [backgroundId, setBackgroundId] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [subclassId, setSubclassId] = useState<number | null>(null);
  const [classSkills, setClassSkills] = useState<SkillName[]>([]);
  const [asiAssignments, setAsiAssignments] = useState<AsiAssignment[]>([]);
  const [hpRoll, setHpRoll] = useState<number | null>(null);
  const [assigned, setAssigned] = useState<Partial<Record<Ability, number>>>({});
  const [editingAbility, setEditingAbility] = useState<Ability | null>(null);
  const [picks, setPicks] = useState<(Ability | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [bgToolChoices, setBgToolChoices] = useState<string[]>([]);
  const [featToolChoices, setFeatToolChoices] = useState<string[]>([]);
  const [featSkillChoices, setFeatSkillChoices] = useState<SkillName[]>([]);
  const [featSpellAbility, setFeatSpellAbility] = useState<Ability | null>(null);
  const [featCantrips, setFeatCantrips] = useState<string[]>([]);
  const [featSpell, setFeatSpell] = useState<string | null>(null);
  const [raceSkills, setRaceSkills] = useState<SkillName[]>([]);

  // ── Derivati: classe / progressione ──
  const background = backgroundId != null ? getBackground(backgroundId) : undefined;

  // ── Derivati: talento di origine + scelte strumenti ──
  const originFeat = useMemo(() => {
    if (!background) return undefined;
    const fid = background.feat.featId;
    return fid != null ? getFeat(fid) : undefined;
  }, [background]);
  const featChoiceConfig = originFeat?.choice_config as
    | {
        type?: string;
        pool?: string;
        count?: number;
        spell_list?: string;
        cantrips_count?: number;
        first_level_spells_count?: number;
        spell_casting_ability_choices?: string[];
      }
    | null
    | undefined;
  const bgToolOptions = useMemo<ToolOption[]>(() => {
    const tp = background?.toolProficiency;
    return tp?.type === 'CHOICE' && tp.category ? getToolOptions(tp.category) : [];
  }, [background]);
  const bgToolCount = bgToolOptions.length > 0 ? 1 : 0;
  const featToolOptions = useMemo<ToolOption[]>(() => {
    return featChoiceConfig?.type === 'tool_proficiency'
      ? getToolOptions(featChoiceConfig.pool)
      : [];
  }, [featChoiceConfig]);
  const featToolCount =
    featChoiceConfig?.type === 'tool_proficiency'
      ? (featChoiceConfig.count ?? featToolOptions.length)
      : 0;
  const featChoiceType = featChoiceConfig?.type as FeatChoiceType | undefined;
  // "Abile" (hybrid_proficiency): tutte le skill + tutti gli strumenti, budget totale
  const featSkillOptions = useMemo<{ key: SkillName; label: string }[]>(
    () => getAllSkills().map((sk) => ({ key: sk.name, label: sk.nameIt })),
    [],
  );
  const allToolOptions = useMemo<ToolOption[]>(() => getToolOptions(), []);
  const hybridTotal =
    featChoiceType === 'hybrid_proficiency' ? (featChoiceConfig?.count ?? 3) : 0;
  // "Iniziato alla Magia" (spellcasting): caratteristica + trucchetti + incantesimo
  const featAbilityOptions = useMemo<{ key: Ability; label: string }[]>(
    () =>
      (featChoiceConfig?.spell_casting_ability_choices ?? [])
        .map((ab) => parseAbilityFromAbbreviation(ab))
        .filter((a): a is Ability => a != null)
        .map((a) => ({ key: a, label: getAbilityLabel(a) })),
    [featChoiceConfig],
  );
  const featCantripOptions = useMemo(
    () =>
      featChoiceConfig?.type === 'spellcasting' && featChoiceConfig.spell_list
        ? getClassSpellsAtLevel(featChoiceConfig.spell_list, 0).map((sp) => ({
            key: sp.name,
            label: sp.name,
          }))
        : [],
    [featChoiceConfig],
  );
  const featSpellOptions = useMemo(
    () =>
      featChoiceConfig?.type === 'spellcasting' && featChoiceConfig.spell_list
        ? getClassSpellsAtLevel(featChoiceConfig.spell_list, 1).map((sp) => ({
            key: sp.name,
            label: sp.name,
          }))
        : [],
    [featChoiceConfig],
  );
  const featCantripCount =
    featChoiceType === 'spellcasting' ? (featChoiceConfig?.cantrips_count ?? 0) : 0;

  // ── Derivati: competenze in abilità dalla razza (Umano "Pluriabilità", Elfo "Sensi Acuti") ──
  const raceSkillEffects = useMemo(() => {
    if (raceId == null) return [];
    return getRaceEffects(raceId, lineageId ?? undefined).filter(
      (e) => e.type === 'choice' && e.choice_type === 'skill_proficiency',
    );
  }, [raceId, lineageId]);
  const raceSkillOptions = useMemo<{ key: SkillName; label: string }[]>(() => {
    if (raceSkillEffects.length === 0) return [];
    const hasFreeChoice = raceSkillEffects.some(
      (e) => !Array.isArray(e.options) || e.options.length === 0,
    );
    if (hasFreeChoice) return getAllSkills().map((sk) => ({ key: sk.name, label: sk.nameIt }));
    const keys = [
      ...new Set(raceSkillEffects.flatMap((e) => (e.options ?? []) as SkillName[])),
    ];
    return keys.map((key) => ({ key, label: getSkillNameItalian(key) }));
  }, [raceSkillEffects]);
  const raceSkillCount = raceSkillEffects.reduce((n, e) => n + (e.count ?? 0), 0);

  const classDef = useMemo(() => getClass(selectedClass), [selectedClass]);
  const progression = useMemo(
    () => (classDef ? getClassProgression(classDef.name) : undefined),
    [classDef],
  );
  const subclassLabel = progression?.subclassLabel;
  const subclassLevels = progression?.subclassLevels ?? [];
  const subclassUnlocked = subclassLevels.length > 0 && level >= subclassLevels[0];
  const subclasses = useMemo(
    () => (classDef ? getSubclassesByClassId(classDef.id) : []),
    [classDef],
  );
  const asiLevels = useMemo(() => (classDef ? getAsiLevels(classDef.name) : []), [classDef]);
  const levelFeatures = useMemo(
    () =>
      (classDef ? getFeaturesAtLevel(classDef.name, level) : []).filter(
        (f) => f !== ASI_FEATURE_NAME,
      ),
    [classDef, level],
  );
  // ASI applicati al livello scelto (4/8/12/16 + bonus classe; 19 = Dono epico)
  const asiLevelsApplied = useMemo(
    () => asiLevels.filter((l) => l <= level && l < 19),
    [asiLevels, level],
  );

  // ── Derivati: competenze di classe ──
  const classSkillOptions = useMemo(() => {
    const opts = classDef?.proficiencies.skills.options ?? [];
    return opts
      .map((label) => ({ label, key: parseSkillFromItalian(label) }))
      .filter((o): o is { label: string; key: SkillName } => o.key != null);
  }, [classDef]);
  const skillCount = classDef?.proficiencies.skills.count ?? 0;

  // ── Derivati: boost da background ──
  const allowedAbilities: Ability[] = useMemo(
    () =>
      (background?.abilityScoreBoosts.allowedScores ?? [])
        .map((a) => parseAbilityFromAbbreviation(a))
        .filter((a): a is Ability => a != null),
    [background],
  );
  const distributionModes = background?.abilityScoreBoosts.distributionModes ?? [];
  // Se il background permette entrambe, default +2/+1 (altrimenti +1+1+1)
  const plusTwoPlusOne =
    distributionModes.length === 0 || distributionModes.includes('PLUS_TWO_PLUS_ONE');

  // ── Reset automatici ──
  // Reset dei boost quando cambia il background
  useEffect(() => {
    const slots = plusTwoPlusOne ? 2 : 3;
    setPicks(Array.from({ length: slots }, () => null));
    setBgToolChoices([]);
    setFeatToolChoices([]);
    setFeatSkillChoices([]);
    setFeatSpellAbility(null);
    setFeatCantrips([]);
    setFeatSpell(null);
    setError(null);
  }, [backgroundId, plusTwoPlusOne]);

  // Reset di sottoclasse, skill e PF quando cambia la classe
  useEffect(() => {
    setSubclassId(null);
    setClassSkills([]);
    setHpRoll(null);
  }, [selectedClass]);
  useEffect(() => {
    if (!subclassUnlocked) setSubclassId(null);
  }, [subclassUnlocked]);

  // Reset degli ASI quando cambia classe o livello
  useEffect(() => {
    setAsiAssignments(asiLevelsApplied.map(() => ({ mode: 'plus_two', slots: [null] })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asiLevels, level]);

  // Reset delle skill scelte quando cambia razza/sottorazza
  useEffect(() => {
    setRaceSkills([]);
  }, [raceId, lineageId]);

  // ── Derivati: punteggi ──
  const pool = useMemo(
    () => STANDARD_ARRAY.filter((v) => !Object.values(assigned).includes(v)),
    [assigned],
  );
  const allAssigned = ABILITY_ORDER.every((a) => assigned[a] != null);

  const boosts: AbilityBoost[] = useMemo(
    () =>
      picks
        .map((ab, i) =>
          ab ? { ability: ab, amount: plusTwoPlusOne ? (i === 0 ? 2 : 1) : 1 } : null,
        )
        .filter((b): b is AbilityBoost => b != null),
    [picks, plusTwoPlusOne],
  );
  const boostsComplete = picks.length > 0 && picks.every((p) => p != null);

  const asiBoosts: AbilityBoost[] = useMemo(
    () =>
      asiAssignments.flatMap((sec) =>
        sec.slots
          .map((ab, i) => (ab ? { ability: ab, amount: sec.mode === 'plus_two' ? 2 : 1 } : null))
          .filter((b): b is AbilityBoost => b != null),
      ),
    [asiAssignments],
  );
  const asiComplete = asiAssignments.every((sec) => sec.slots.every((s) => s != null));

  // Punteggi di base (standard array distribuito, senza boost)
  const fullScores: AbilityScores | null = useMemo(() => {
    if (!allAssigned) return null;
    return ABILITY_ORDER.reduce((acc, a) => {
      acc[a] = assigned[a] ?? 10;
      return acc;
    }, {} as AbilityScores);
  }, [allAssigned, assigned]);

  // Punteggi finali (con boost e ASI) per anteprima e creazione
  const finalResult: AbilityAssignmentResult | null = useMemo(() => {
    if (!fullScores) return null;
    return calculateFinalAbilities({
      method: 'standard',
      scores: fullScores,
      boosts,
      asiBoosts,
      allowedBoosts: background?.abilityScoreBoosts.allowedScores,
      distributionModes,
    });
  }, [fullScores, boosts, asiBoosts, background, distributionModes]);

  // Per lo step Punti Ferita: mod COS finale e PF medi per livello dopo il 1°
  const conMod =
    finalResult && finalResult.success ? getAbilityModifier(finalResult.scores.constitution) : 0;
  const averagePerLevel = classDef ? Math.max(classDef.hitPoints.average + conMod, 1) : 1;

  // ── Passi attivi e validazione ──
  const activeSteps = useMemo(
    () => STEPS.filter((s) => s.key !== 'subclass' || subclassUnlocked),
    [subclassUnlocked],
  );
  const stepIndex = activeSteps.findIndex((s) => s.key === step);

  const stepValid = (k: StepKey): boolean => {
    switch (k) {
      case 'name': return name.trim().length > 0;
      case 'class': return selectedClass != null;
      case 'skills':
        return classSkillOptions.length === 0 || classSkills.length === skillCount;
      case 'level': return true;
      case 'subclass':
        return subclassUnlocked && subclasses.length > 0 ? subclassId != null : true;
      case 'race':
        return (
          raceId != null &&
          (!hasLineages(raceId) || lineageId != null) &&
          raceSkills.length === raceSkillCount
        );
      case 'background': {
        const featDone = (() => {
          if (featChoiceType === 'tool_proficiency') return featToolChoices.length === featToolCount;
          if (featChoiceType === 'hybrid_proficiency')
            return featSkillChoices.length + featToolChoices.length === hybridTotal;
          if (featChoiceType === 'spellcasting')
            return (
              featSpellAbility != null &&
              featCantrips.length === featCantripCount &&
              featSpell != null
            );
          return true;
        })();
        return backgroundId != null && bgToolChoices.length === bgToolCount && featDone;
      }
      case 'abilities': return allAssigned && boostsComplete && asiComplete;
      case 'hp': return hpRoll != null;
    }
  };

  const goNext = () => {
    setError(null);
    const next = activeSteps[stepIndex + 1];
    if (next && stepValid(step)) setStep(next.key);
  };
  const goPrev = () => {
    setError(null);
    const prev = activeSteps[stepIndex - 1];
    if (prev) setStep(prev.key);
  };

  // ── Handler: punteggi / boost / ASI / skill ──
  const openAbilityPicker = (a: Ability) => setEditingAbility(a);
  const closeAbilityPicker = () => setEditingAbility(null);
  const assignToAbility = (ability: Ability, value: number) => {
    setAssigned((prev) => {
      const next = { ...prev };
      delete next[ability];
      next[ability] = value;
      return next;
    });
    setEditingAbility(null);
    setError(null);
  };
  const clearAbility = (ab: Ability) => {
    setAssigned((prev) => {
      const next = { ...prev };
      delete next[ab];
      return next;
    });
  };
  const togglePick = (ab: Ability) => {
    setPicks((prev) => {
      const idx = prev.findIndex((p) => p === ab);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = null;
        return next;
      }
      const emptyIdx = prev.findIndex((p) => p == null);
      if (emptyIdx < 0) return prev;
      const next = [...prev];
      next[emptyIdx] = ab;
      return next;
    });
    setError(null);
  };
  const toggleSkill = (skill: SkillName) => {
    setClassSkills((prev) => {
      if (prev.includes(skill)) return prev.filter((s) => s !== skill);
      if (prev.length >= skillCount) return prev;
      return [...prev, skill];
    });
  };
  const toggleBgTool = (slug: string) => {
    setBgToolChoices((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (bgToolCount === 0 || prev.length >= bgToolCount) return prev;
      return [...prev, slug];
    });
    setError(null);
  };
  const toggleFeatTool = (slug: string) => {
    setFeatToolChoices((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      const budget =
        featChoiceType === 'hybrid_proficiency'
          ? Math.max(0, hybridTotal - featSkillChoices.length)
          : featToolCount;
      if (budget === 0 || prev.length >= budget) return prev;
      return [...prev, slug];
    });
    setError(null);
  };
  const toggleFeatSkill = (skill: SkillName) => {
    setFeatSkillChoices((prev) => {
      if (prev.includes(skill)) return prev.filter((s) => s !== skill);
      if (featToolChoices.length + prev.length >= hybridTotal) return prev;
      return [...prev, skill];
    });
    setError(null);
  };
  const toggleRaceSkill = (skill: SkillName) => {
    setRaceSkills((prev) => {
      if (prev.includes(skill)) return prev.filter((s) => s !== skill);
      if (prev.length >= raceSkillCount) return prev;
      return [...prev, skill];
    });
    setError(null);
  };
  const selectFeatSpellAbility = (a: Ability) => {
    setFeatSpellAbility((prev) => (prev === a ? null : a));
    setError(null);
  };
  const toggleFeatCantrip = (name: string) => {
    setFeatCantrips((prev) => {
      if (prev.includes(name)) return prev.filter((s) => s !== name);
      if (prev.length >= featCantripCount) return prev;
      return [...prev, name];
    });
    setError(null);
  };
  const selectFeatSpell = (name: string) => {
    setFeatSpell((prev) => (prev === name ? null : name));
    setError(null);
  };
  const setAsiMode = (index: number, mode: AsiMode) => {
    setAsiAssignments((prev) => {
      const next = [...prev];
      next[index] = { mode, slots: mode === 'plus_two' ? [null] : [null, null] };
      return next;
    });
  };
  const toggleAsiAbility = (index: number, ability: Ability) => {
    setAsiAssignments((prev) => {
      const next = [...prev];
      const sec = next[index];
      if (!sec) return prev;
      const slots = [...sec.slots];
      const existing = slots.indexOf(ability);
      if (existing >= 0) {
        slots[existing] = null;
      } else {
        const empty = slots.indexOf(null);
        if (empty < 0) return prev;
        slots[empty] = ability;
      }
      next[index] = { ...sec, slots };
      return next;
    });
  };

  // ── Creazione ──
  const handleCreate = () => {
    // `scores` nel draft = punteggi BASE (standard array distribuito); i boost e
    // gli ASI vengono riapplicati da `buildCharacter` → `calculateFinalAbilities`.
    // Usare `finalResult.scores` (già con boost) li raddoppierebbe.
    if (!fullScores || !finalResult?.success || !background) return;
    const draft: CharacterDraft = {
      name: name.trim(),
      race: { raceId: raceId ?? undefined, lineageId: lineageId ?? undefined },
      classChoice: { className: selectedClass, level, subclassId: subclassId ?? undefined },
      background: { backgroundId: background.id },
      classSkills,
      raceSkillChoices: raceSkills.length > 0 ? raceSkills : undefined,
      bgToolChoices: bgToolChoices.length > 0 ? bgToolChoices : undefined,
      featToolChoices: featToolChoices.length > 0 ? featToolChoices : undefined,
      featSkillChoices: featSkillChoices.length > 0 ? featSkillChoices : undefined,
      featSpellChoice:
        featSpellAbility != null && featCantrips.length > 0 && featSpell != null
          ? { ability: featSpellAbility, cantrips: featCantrips, spells: [featSpell] }
          : undefined,
      hpRoll: hpRoll ?? undefined,
      abilities: {
        method: 'standard',
        scores: fullScores,
        boosts,
        asiBoosts,
        allowedBoosts: background.abilityScoreBoosts.allowedScores,
        distributionModes,
      },
    };
    const created = createCharacterFull(draft);
    if (created) navigation.goBack();
    else setError('Impossibile creare il personaggio. Verifica i dati inseriti.');
  };

  return {
    step, setStep, stepIndex, activeSteps, goNext, goPrev, error,
    name, setName,
    classes: CLASSES, selectedClass, setSelectedClass,
    classLabel: classDef?.labelIt ?? selectedClass,
    classSkillOptions, skillCount, classSkills, toggleSkill,
    level, setLevel, hitDie: classDef?.hitDie, levelFeatures,
    subclassLabel, subclassLevels, subclassUnlocked, subclasses, subclassId, setSubclassId,
    raceId,
    setRaceId: (id) => { setRaceId(id); setLineageId(null); },
    lineageId, setLineageId,
    raceSkillOptions, raceSkills, raceSkillCount, toggleRaceSkill,
    backgroundId, setBackgroundId,
    bgToolOptions, bgToolChoices, bgToolCount, toggleBgTool,
    featChoice: {
      name: background?.feat.name,
      type: featChoiceType,
      hasChoices: !!originFeat?.has_choices,
      toolOptions: featToolOptions,
      toolSelected: featToolChoices,
      toolCount: featToolCount,
      toggleTool: toggleFeatTool,
      skillOptions: featSkillOptions,
      skillSelected: featSkillChoices,
      total: hybridTotal,
      toggleSkill: toggleFeatSkill,
      abilityOptions: featAbilityOptions,
      abilitySelected: featSpellAbility,
      selectAbility: selectFeatSpellAbility,
      cantripOptions: featCantripOptions,
      cantripSelected: featCantrips,
      cantripCount: featCantripCount,
      toggleCantrip: toggleFeatCantrip,
      spellOptions: featSpellOptions,
      spellSelected: featSpell,
      selectSpell: selectFeatSpell,
    },
    assigned, editingAbility, openAbilityPicker, closeAbilityPicker,
    assignToAbility, clearAbility, pool, allowedAbilities,
    showBoosts: background != null && allowedAbilities.length > 0,
    plusTwoPlusOne, picks, togglePick,
    asiLevelsApplied, asiAssignments, setAsiMode, toggleAsiAbility, finalResult,
    hpRoll, setHpRoll,
    takeMaxHp: () => { if (classDef) setHpRoll(classDef.hitDie); },
    conMod, averagePerLevel,
    canGoNext: stepValid(step),
    isLastStep: step === 'hp',
    canCreate: stepValid('hp') && finalResult?.success === true,
    handleCreate,
  };
}
