import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAllClasses, getClass } from '../../../lib/rules/classes';
import { getSubclassesByClassId, type SubclassDefinition } from '../../../lib/rules/subclasses';
import { getClassProgression, getFeaturesAtLevel, getAsiLevels } from '../../../lib/rules/progression';
import { hasLineages } from '../../../lib/rules/races';
import { getBackground } from '../../../lib/rules/backgrounds';
import { STANDARD_ARRAY, parseAbilityFromAbbreviation, getAbilityModifier } from '../../../lib/rules/abilities';
import { parseSkillFromItalian } from '../../../lib/rules/skills';
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

  // ── Background ──
  backgroundId: number | null;
  setBackgroundId: (id: number) => void;

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

  // ── Derivati: classe / progressione ──
  const background = backgroundId != null ? getBackground(backgroundId) : undefined;
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
        return raceId != null && (!hasLineages(raceId) || lineageId != null);
      case 'background': return backgroundId != null;
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
    backgroundId, setBackgroundId,
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
