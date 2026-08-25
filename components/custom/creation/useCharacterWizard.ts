import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAllClasses, getClass, getClassNameItalian } from '../../../lib/rules/classes';
import { getSubclassesByClassId, type SubclassDefinition } from '../../../lib/rules/subclasses';
import { getClassProgression, getFeaturesAtLevel, getAsiLevels } from '../../../lib/rules/progression';
import { getMulticlassPrerequisiteWarnings } from '../../../lib/rules/multiclass';
import { hasLineages, getRaceEffects } from '../../../lib/rules/races';
import { getBackground } from '../../../lib/rules/backgrounds';
import { getFeat, getGeneralFeats, getEpicBoons, isFeatAvailable, getFeatAsiCap, getFeatAsiCount } from '../../../lib/rules/feats';
import { getToolOptions, applyFeat, type ToolOption } from '../../../lib/rules/apply-feat';
import { STANDARD_ARRAY, POINT_BUY_COST, POINT_BUY_TOTAL, POINT_BUY_MIN, POINT_BUY_MAX, getPointBuyValues, parseAbilityFromAbbreviation, getAbilityLabel, getAbilityModifier, suggestScoreAssignment } from '../../../lib/rules/abilities';
import { parseSkillFromItalian, getAllSkills, getSkillNameItalian } from '../../../lib/rules/skills';
import { getClassSpellsAtLevel } from '../../../lib/rules/spells';
import type { FeatChoiceState, FeatChoiceType } from './FeatChoice';
import type { ScoreOption } from './ValuePickerModal';
import { calculateFinalAbilities, type AbilityBoost } from '../../../lib/rules/character-builder';
import type { AbilityAssignmentResult } from '../../../lib/rules/character-builder';
import { useCharacterStore } from '../../../store/useCharacterStore';
import { STEPS, ABILITY_ORDER, ASI_FEATURE_NAME, FEAT_MODE_PENDING } from './wizardSteps';
import type { StepKey, AsiMode, AsiAssignment, SkillOption } from './wizardSteps';
import type { WizardStep } from './StepIndicator';
import type { ClassCarouselItem } from '../ClassCarousel';
import type { RootStackParamList } from '../../../types/navigation';
import type { ClassName, Ability, AbilityScores, CharacterDraft, FeatRaw, SkillName } from '../../../types';

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

/** Una classe configurata nel wizard (per il multiclasse). La prima = primaria */
interface WizardClass {
  className: ClassName;
  level: number;
  subclassId: number | null;
  classSkills: SkillName[];
}

/** Chiave composita di un ASI: `${className}:${livello}` (evita collisioni tra classi) */
interface AsiKey {
  key: string;
  label: string;
}

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
  /** Verifica se un passo è valido (per l'indicatore e i salti) */
  stepValid: (k: StepKey) => boolean;
  /** Motivo per cui il passo corrente non è valido (per il feedback) */
  stepInvalidReason: (k: StepKey) => string | null;
  error: string | null;

  // ── Nome ──
  name: string;
  setName: (v: string) => void;

  // ── Classe (multiclasse) ──
  classes: ClassCarouselItem[];
  selectedClass: ClassName;
  setSelectedClass: (c: ClassName) => void;
  /** Lista di classi configurate (la PRIMA = primaria) */
  classList: { className: ClassName; level: number; subclassId: number | null; classSkills: SkillName[] }[];
  activeClassIndex: number;
  setActiveClassIndex: (i: number) => void;
  addClass: () => void;
  removeClass: (index: number) => void;
  /** Livello TOTALE (somma delle classi) */
  totalLevel: number;
  canAddClass: boolean;

  // ── Competenze (della classe attiva) ──
  classLabel: string;
  classSkillOptions: SkillOption[];
  skillCount: number;
  classSkills: SkillName[];
  toggleSkill: (s: SkillName) => void;

  // ── Livello (della classe attiva) ──
  level: number;
  setLevel: (l: number) => void;
  hitDie?: number;
  levelFeatures: string[];

  // ── Sottoclasse (della classe attiva) ──
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

  // ── Talenti (step dedicato) ──
  hasFightingStyle: boolean;
  fightingStyleOptions: FeatRaw[];
  fightingStyleId: number | null;
  selectFightingStyle: (id: number | null) => void;
  /** Scelta per livello ASI (chiave composita `${classe}:${livello}`): feat id oppure null = ASI */
  featAtAsiLevel: Record<string, number | null>;
  setAsiLevelFeat: (key: string, featId: number | null) => void;
  generalFeatOptions: FeatRaw[];
  generalFeatIds: number[];
  featAsiPicks: Record<number, Ability[]>;
  toggleFeatAsi: (featId: number, ability: Ability) => void;
  epicBoonUnlocked: boolean;
  epicBoonOptions: FeatRaw[];
  epicBoonId: number | null;
  selectEpicBoon: (id: number | null) => void;
  /** Errore di validazione dei punteggi (es. ASI oltre 20) — per lo step talenti */
  featError: string | null;
  /** Punteggi finali (per prerequisiti e anteprima nello step talenti) */
  finalScores: AbilityScores | null;

  // ── Punteggi ──
  assigned: Partial<Record<Ability, number>>;
  editingAbility: Ability | null;
  openAbilityPicker: (a: Ability) => void;
  closeAbilityPicker: () => void;
  assignToAbility: (a: Ability, v: number) => void;
  clearAbility: (a: Ability) => void;
  /** Aggiunge/rimuove un punto a un'abilità (stepper −/+, solo punto acquisto) */
  adjustAbility: (a: Ability, delta: 1 | -1) => void;
  /** Distribuzione automatica consigliata in base alla classe (abil. principali) */
  suggestScores: () => void;
  abilityMethod: 'standard' | 'point_buy';
  setAbilityMethod: (m: 'standard' | 'point_buy') => void;
  pickerOptions: ScoreOption[];
  pointsLeft: number;
  allowedAbilities: Ability[];
  showBoosts: boolean;
  plusTwoPlusOne: boolean;
  picks: (Ability | null)[];
  togglePick: (a: Ability) => void;
  /** Livelli ASI di TUTTE le classi (chiavi composite + etichetta per lo step talenti) */
  asiKeys: { key: string; label: string }[];
  /** Assegnazioni ASI per chiave composita (classe:livello) */
  asiAssignments: Record<string, AsiAssignment>;
  setAsiMode: (key: string, m: AsiMode) => void;
  toggleAsiAbility: (key: string, a: Ability) => void;
  finalResult: AbilityAssignmentResult | null;
  /** Prerequisiti multiclasse mancanti (13+ nelle caratteristiche primarie) */
  multiclassPrereqMissing: string[];
  /** Tutte le classi hanno sottoclasse (se sbloccata) e competenze complete */
  allClassesValid: boolean;

  // ── Punti Ferita ──
  hpRoll: number | null;
  setHpRoll: (v: number) => void;
  takeMaxHp: () => void;
  conMod: number;
  averagePerLevel: number;
  /** Dado vita della classe PRIMARIA (per il tiro del 1° livello) */
  primaryHitDie?: number;

  // ── Creazione ──
  handleCreate: () => void;
}

export function useCharacterWizard(): CharacterWizard {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const createCharacterFull = useCharacterStore((st) => st.createCharacterFull);

  // ── Stato del wizard ──
  const [step, setStepState] = useState<StepKey>('name');
  const [name, setName] = useState('');
  // Multiclasse: lista di classi (la PRIMA = primaria) + classe attiva in configurazione
  const [classList, setClassList] = useState<WizardClass[]>([
    { className: CLASSES[0].key, level: 1, subclassId: null, classSkills: [] },
  ]);
  const [activeClassIndex, setActiveClassIndex] = useState(0);
  const [raceId, setRaceId] = useState<number | null>(null);
  const [lineageId, setLineageId] = useState<number | null>(null);
  const [backgroundId, setBackgroundId] = useState<number | null>(null);
  const [asiAssignments, setAsiAssignments] = useState<Record<string, AsiAssignment>>({});
  const [hpRoll, setHpRoll] = useState<number | null>(null);
  const [assigned, setAssigned] = useState<Partial<Record<Ability, number>>>({});
  const [editingAbility, setEditingAbility] = useState<Ability | null>(null);
  const [abilityMethod, setAbilityMethodState] = useState<'standard' | 'point_buy'>('standard');
  const [picks, setPicks] = useState<(Ability | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [bgToolChoices, setBgToolChoices] = useState<string[]>([]);
  const [featToolChoices, setFeatToolChoices] = useState<string[]>([]);
  const [featSkillChoices, setFeatSkillChoices] = useState<SkillName[]>([]);
  const [featSpellAbility, setFeatSpellAbility] = useState<Ability | null>(null);
  const [featCantrips, setFeatCantrips] = useState<string[]>([]);
  const [featSpell, setFeatSpell] = useState<string | null>(null);
  const [raceSkills, setRaceSkills] = useState<SkillName[]>([]);
  const [featAtAsiLevel, setFeatAtAsiLevel] = useState<Record<string, number | null>>({});
  const [fightingStyleId, setFightingStyleId] = useState<number | null>(null);
  const [epicBoonId, setEpicBoonId] = useState<number | null>(null);
  const [featAsiPicks, setFeatAsiPicks] = useState<Record<number, Ability[]>>({});

  // ── Classe attiva (multiclasse) ──
  const activeClass = classList[activeClassIndex] ?? classList[0];
  const selectedClass = activeClass.className;
  const level = activeClass.level;
  const subclassId = activeClass.subclassId;
  const classSkills = activeClass.classSkills;
  const totalLevel = classList.reduce((n, c) => n + c.level, 0);

  const updateActiveClass = (patch: Partial<WizardClass>) => {
    setClassList((prev) => prev.map((c, i) => (i === activeClassIndex ? { ...c, ...patch } : c)));
  };
  const setSelectedClass = (c: ClassName) => {
    setClassList((prev) =>
      prev.map((cl, i) => (i === activeClassIndex ? { ...cl, className: c, subclassId: null, classSkills: [] } : cl)),
    );
    // Reset dello stato dipendente dalla classe (ASI/talenti/stile/epico)
    setHpRoll(null);
    setAsiAssignments({});
    setFeatAtAsiLevel({});
    setFightingStyleId(null);
    setEpicBoonId(null);
    setFeatAsiPicks({});
  };
  const setLevel = (l: number) => updateActiveClass({ level: l });
  const setSubclassId = (id: number | null) => updateActiveClass({ subclassId: id });
  const setClassSkills = (sk: SkillName[]) => updateActiveClass({ classSkills: sk });

  /** Aggiunge una classe (nuova, la configura la carousel) e la rende attiva */
  const addClass = () => {
    setClassList((prev) => [
      ...prev,
      { className: CLASSES[0].key, level: 1, subclassId: null, classSkills: [] },
    ]);
    setActiveClassIndex(classList.length);
  };
  const removeClass = (index: number) => {
    // La classe primaria (0) non si rimuove
    if (index <= 0) return;
    setClassList((prev) => prev.filter((_, i) => i !== index));
    if (index === activeClassIndex) {
      setActiveClassIndex(Math.max(0, index - 1));
    } else if (index < activeClassIndex) {
      setActiveClassIndex(activeClassIndex - 1);
    }
  };

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
  // ASI applicati (4/8/12/16 + bonus classe, 19 = Dono epico) di TUTTE le classi:
  // ogni classe ha i propri livelli ASI (es. Guerriero 4 e Chierico 4 = 2 ASI distinti).
  const asiKeys = useMemo<AsiKey[]>(() => {
    const keys: AsiKey[] = [];
    for (const cls of classList) {
      const def = getClass(cls.className);
      if (!def) continue;
      for (const lvl of getAsiLevels(def.name)) {
        if (lvl <= cls.level && lvl < 19) {
          keys.push({
            key: `${cls.className}:${lvl}`,
            label: `${getClassNameItalian(cls.className)} ${lvl}°`,
          });
        }
      }
    }
    return keys;
  }, [classList]);

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

  // Se la classe attiva scende sotto il livello di sottoclasse, la azzera
  useEffect(() => {
    if (!subclassUnlocked && activeClass.subclassId != null) {
      updateActiveClass({ subclassId: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subclassUnlocked, activeClassIndex]);

  // Mantiene ASI/talenti allineati ai livelli ASI correnti (aggiunge i nuovi,
  // rimuove quelli non più applicabili; es. 19→18 rimuove il dono epico)
  useEffect(() => {
    setAsiAssignments((prev) => {
      const next: Record<string, AsiAssignment> = {};
      for (const k of asiKeys) {
        next[k.key] = prev[k.key] ?? { mode: 'plus_two', slots: [null] };
      }
      return next;
    });
    setFeatAtAsiLevel((prev) => {
      const next: Record<string, number | null> = {};
      for (const k of asiKeys) {
        next[k.key] = prev[k.key] ?? null;
      }
      return next;
    });
    setEpicBoonId((prev) => (totalLevel >= 19 ? prev : null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asiKeys, totalLevel]);

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

  // Punto acquisto (27 punti): punti spesi/rimanenti
  const pointsSpent = useMemo(
    () =>
      ABILITY_ORDER.reduce((sum, a) => {
        const v = assigned[a];
        return v != null ? sum + POINT_BUY_COST[v] : sum;
      }, 0),
    [assigned],
  );
  const pointsLeft = POINT_BUY_TOTAL - pointsSpent;

  // Opzioni del picker valori: standard array (valori rimanenti) o punto acquisto
  // (valori 8–15 con costo, acquistabili se il budget lo consente — il valore già
  // assegnato all'abilità in modifica viene "rimborsato" così puoi cambiarlo).
  const pickerOptions: ScoreOption[] = useMemo(() => {
    if (abilityMethod === 'standard') {
      return pool.map((v) => ({ value: v, cost: 0, disabled: false }));
    }
    const current = editingAbility != null ? assigned[editingAbility] : undefined;
    const refund = current != null ? POINT_BUY_COST[current] : 0;
    const budget = pointsLeft + refund;
    return getPointBuyValues().map((v) => ({
      value: v,
      cost: POINT_BUY_COST[v],
      disabled: POINT_BUY_COST[v] > budget,
    }));
  }, [abilityMethod, pool, editingAbility, assigned, pointsLeft]);

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

  // Livelli ASI NON sostituiti da un talento generale (5.5e: a ogni livello ASI
  // si sceglie O l'ASI O un talento; i livelli con un talento NON danno l'ASI).
  const effectiveAsiKeys = useMemo(
    () => asiKeys.filter((k) => !featAtAsiLevel[k.key]),
    [asiKeys, featAtAsiLevel],
  );
  const effectiveAsiAssignments = useMemo(
    () =>
      effectiveAsiKeys
        .map((k) => asiAssignments[k.key])
        .filter((s): s is AsiAssignment => s != null),
    [effectiveAsiKeys, asiAssignments],
  );
  const asiBoosts: AbilityBoost[] = useMemo(
    () =>
      effectiveAsiAssignments.flatMap((sec) =>
        sec.slots
          .map((ab) => (ab ? { ability: ab, amount: sec.mode === 'plus_two' ? 2 : 1 } : null))
          .filter((b): b is AbilityBoost => b != null),
      ),
    [effectiveAsiAssignments],
  );

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
      method: abilityMethod,
      scores: fullScores,
      boosts,
      asiBoosts,
      allowedBoosts: background?.abilityScoreBoosts.allowedScores,
      distributionModes,
    });
  }, [fullScores, boosts, asiBoosts, background, distributionModes]);

  // Punteggi finali anche con gli ASI concessi dai talenti scelti (+1 di ciascuno)
  const finalScoresWithFeats: AbilityScores | null = useMemo(() => {
    if (!finalResult?.success) return null;
    const scores = { ...finalResult.scores };
    const chosenFeats = [
      ...(Object.values(featAtAsiLevel).filter(
        (v): v is number => v != null && v !== FEAT_MODE_PENDING,
      )),
      ...(epicBoonId != null ? [epicBoonId] : []),
    ];
    for (const id of chosenFeats) {
      const feat = getFeat(id);
      if (!feat) continue;
      const app = applyFeat(feat, { asiChoices: featAsiPicks[id] });
      const cap = getFeatAsiCap(feat);
      for (const b of app.asiBoosts) {
        scores[b.ability] = Math.min((scores[b.ability] ?? 10) + b.amount, cap);
      }
    }
    return scores;
  }, [finalResult, featAtAsiLevel, epicBoonId, featAsiPicks]);

  // Per lo step Punti Ferita: mod COS finale e PF medi per livello dopo il 1°
  // (della classe PRIMARIA, dato che il tiro del dado vita riguarda il 1° livello)
  const primaryClassDef = useMemo(
    () => (classList[0] ? getClass(classList[0].className) : undefined),
    [classList],
  );
  const conMod =
    finalResult && finalResult.success
      ? getAbilityModifier((finalScoresWithFeats ?? finalResult.scores).constitution)
      : 0;
  const averagePerLevel = primaryClassDef ? Math.max(primaryClassDef.hitPoints.average + conMod, 1) : 1;
  /** Dado vita della classe PRIMARIA (per il tiro del 1° livello nello step PF) */
  const primaryHitDie = primaryClassDef?.hitDie;

  // ── Derivati: talenti (step dedicato) ──
  // Incantatore se ALMENO una classe lancia incantesimi
  const isSpellcaster = classList.some((cls) => getClass(cls.className)?.isSpellcaster);
  // Stile di combattimento: Fighter al 1°, Paladino/Ranger al 2° (regola 5.5e),
  // se una delle classi lo sblocca al proprio livello
  const fightingStyleInfo = useMemo(() => {
    for (const cls of classList) {
      const def = getClass(cls.className);
      if (!def?.fightingStyles) continue;
      const lvlReq = cls.className === 'fighter' ? 1 : 2;
      if (cls.level >= lvlReq) {
        const opts = def.fightingStyles.map(getFeat).filter((f): f is FeatRaw => f != null);
        if (opts.length > 0) return { options: opts, className: cls.className };
      }
    }
    return null;
  }, [classList]);
  const hasFightingStyle = fightingStyleInfo != null;
  const fightingStyleOptions = fightingStyleInfo?.options ?? [];
  const featScores = finalResult?.success ? finalResult.scores : (fullScores ?? undefined);
  const generalFeatIds = useMemo(
    () =>
      Object.values(featAtAsiLevel).filter(
        (v): v is number => v != null && v !== FEAT_MODE_PENDING,
      ),
    [featAtAsiLevel],
  );
  const generalFeatOptions = useMemo(
    () =>
      getGeneralFeats().filter(
        (f) =>
          f.name_en !== 'Ability Score Improvement' &&
          isFeatAvailable(f, { level: totalLevel, scores: featScores, isSpellcaster }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalLevel, featScores, isSpellcaster],
  );
  const epicBoonUnlocked = totalLevel >= 19;
  const epicBoonOptions = useMemo(
    () =>
      epicBoonUnlocked
        ? getEpicBoons().filter((f) => isFeatAvailable(f, { level: totalLevel, scores: featScores, isSpellcaster }))
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [epicBoonUnlocked, totalLevel, featScores, isSpellcaster],
  );

  // ── Multiclasse: validità globale delle classi + prerequisiti ──
  // Tutte le classi devono avere sottoclasse (se sbloccata) e competenze complete
  const allClassesValid = useMemo(
    () =>
      classList.every((cls) => {
        const def = getClass(cls.className);
        if (!def) return false;
        const subLevels = getClassProgression(def.name)?.subclassLevels ?? [];
        if (subLevels.length > 0 && cls.level >= subLevels[0] && cls.subclassId == null) return false;
        const count = def.proficiencies.skills.count ?? 0;
        if (count > 0 && cls.classSkills.length !== count) return false;
        return cls.level >= 1;
      }),
    [classList],
  );
  // Prerequisiti multiclasse (13+ nelle caratteristiche primarie di ogni classe).
  // Vale SOLO con 2+ classi: un PG a classe singola non richiede 13+ nella primaria.
  const multiclassPrereqMissing = useMemo(() => {
    if (classList.length < 2 || !finalResult?.success) return [];
    return getMulticlassPrerequisiteWarnings(
      classList.map((cls) => ({ className: cls.className })),
      finalResult.scores,
    );
  }, [classList, finalResult]);

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
      case 'abilities': return allAssigned && boostsComplete && (abilityMethod !== 'point_buy' || pointsLeft >= 0);
      case 'feat': {
        // Ogni livello ASI (di ogni classe): o ha un talento generale, o l'ASI
        const asiOk = asiKeys.every((k) => {
          const sel = featAtAsiLevel[k.key];
          // In modalità talento serve un talento SCELTO (il pending non basta)
          if (sel != null) return sel !== FEAT_MODE_PENDING;
          const sec = asiAssignments[k.key];
          return sec != null && sec.slots.every((s) => s != null);
        });
        return (!hasFightingStyle || fightingStyleId != null) && asiOk;
      }
      case 'hp': return hpRoll != null;
      case 'summary':
        // Raggiungibile solo a valle di hp: pronta se tutto il resto è valido
        return (
          stepValid('hp') &&
          stepValid('feat') &&
          finalResult?.success === true &&
          allClassesValid &&
          multiclassPrereqMissing.length === 0
        );
    }
  };

  /** Motivo leggibile per cui un passo non è valido (feedback in schermata) */
  const stepInvalidReason = (k: StepKey): string | null => {
    switch (k) {
      case 'name': return name.trim().length > 0 ? null : 'Inserisci un nome per il personaggio.';
      case 'class': return selectedClass != null ? null : 'Scegli una classe.';
      case 'skills':
        return classSkillOptions.length === 0 || classSkills.length === skillCount
          ? null
          : `Scegli ${skillCount} competenze di classe.`;
      case 'level': return null;
      case 'subclass':
        return subclassUnlocked && subclasses.length > 0 && subclassId == null
          ? 'Scegli la sottoclasse.'
          : null;
      case 'race':
        if (raceId == null) return 'Scegli la razza.';
        if (hasLineages(raceId) && lineageId == null) return 'Scegli la sottorazza (lineage).';
        if (raceSkills.length !== raceSkillCount) return 'Completa le competenze della razza.';
        return null;
      case 'background': {
        if (backgroundId == null) return 'Scegli il background.';
        if (bgToolChoices.length !== bgToolCount) return 'Completa la scelta degli strumenti del background.';
        if (featChoiceType === 'tool_proficiency' && featToolChoices.length !== featToolCount)
          return 'Completa la scelta degli strumenti del talento.';
        if (
          featChoiceType === 'hybrid_proficiency' &&
          featSkillChoices.length + featToolChoices.length !== hybridTotal
        )
          return `Completa la scelta del talento (${hybridTotal} tra abilità e strumenti).`;
        if (
          featChoiceType === 'spellcasting' &&
          (featSpellAbility == null || featCantrips.length !== featCantripCount || featSpell == null)
        )
          return 'Completa la scelta incantesimi del talento.';
        return null;
      }
      case 'abilities':
        if (!allAssigned) return 'Assegna un valore a tutte le caratteristiche.';
        if (abilityMethod === 'point_buy' && pointsLeft < 0) return 'Hai speso più di 27 punti.';
        if (!boostsComplete) return 'Completa i boost dal background.';
        return null;
      case 'feat':
        if (hasFightingStyle && fightingStyleId == null) return 'Scegli lo stile di combattimento.';
        if (finalResult && !finalResult.success) return finalResult.error;
        {
          const asiOk = asiKeys.every((k) => {
            const sel = featAtAsiLevel[k.key];
            if (sel != null) return sel !== FEAT_MODE_PENDING;
            const sec = asiAssignments[k.key];
            return sec != null && sec.slots.every((s) => s != null);
          });
          if (!asiOk) return "Per ogni livello ASI scegli o completa l'ASI o un talento.";
        }
        return null;
      case 'hp':
        if (hpRoll == null) return 'Tira il dado vita (o scegli il massimo).';
        if (finalResult && !finalResult.success) return finalResult.error;
        if (!allClassesValid) return 'Completa sottoclasse e competenze di tutte le classi.';
        if (multiclassPrereqMissing.length > 0)
          return `Prerequisiti multiclasse: ${multiclassPrereqMissing.join(', ')}`;
        return null;
      case 'summary':
        // Lo step è raggiungibile solo se 'hp' è valido → riusa il motivo di hp
        return stepInvalidReason('hp');
    }
  };

  // Un passo è raggiungibile se tutti i precedenti sono validi
  const isStepReachable = (k: StepKey): boolean => {
    const idx = activeSteps.findIndex((s) => s.key === k);
    if (idx < 0) return false;
    return activeSteps.slice(0, idx).every((s) => stepValid(s.key));
  };

  // Navigazione: indietro sempre permesso, avanti solo se i passi intermedi sono validi
  const setStep = (k: StepKey) => {
    const idx = activeSteps.findIndex((s) => s.key === k);
    if (idx <= stepIndex || isStepReachable(k)) {
      setError(null);
      setStepState(k);
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
  // Stepper −/+ per il punto acquisto: ogni +1 ha un costo (il delta tra i costi
  // della tabella) e non può superare il budget; il −1 restituisce punti (min 8).
  const adjustAbility = (ability: Ability, delta: 1 | -1) => {
    setAssigned((prev) => {
      const current = prev[ability] ?? POINT_BUY_MIN;
      const next = current + delta;
      if (next < POINT_BUY_MIN || next > POINT_BUY_MAX) return prev;
      if (delta > 0) {
        const costDelta = POINT_BUY_COST[next] - POINT_BUY_COST[current];
        const spent = ABILITY_ORDER.reduce((sum, a) => {
          const v = prev[a];
          return v != null ? sum + POINT_BUY_COST[v] : sum;
        }, 0);
        if (spent + costDelta > POINT_BUY_TOTAL) return prev;
      }
      return { ...prev, [ability]: next };
    });
    setError(null);
  };
  // Distribuzione automatica consigliata: lo standard array distribuito dando
  // priorità alle abilità principali della classe (poi COS, poi le restanti).
  // Vale per entrambi i metodi (lo standard array costa esattamente 27 punti).
  // Priorità alle caratteristiche primarie di TUTTE le classi (multiclasse)
  const allPrimaryAbilities = useMemo(() => {
    const primaries: Ability[] = [];
    for (const cls of classList) {
      const def = getClass(cls.className);
      if (!def) continue;
      for (const a of def.primaryAbilities) {
        if (!primaries.includes(a)) primaries.push(a);
      }
    }
    return primaries;
  }, [classList]);

  const suggestScores = () => {
    setAssigned(suggestScoreAssignment(allPrimaryAbilities.length > 0 ? allPrimaryAbilities : classDef?.primaryAbilities ?? []));
    setEditingAbility(null);
    setError(null);
  };

  // All'ingresso nello step Punteggi, se non è stato ancora assegnato nulla,
  // applica automaticamente la distribuzione consigliata (niente partenza vuota).
  const prevStepRef = useRef<StepKey>('name');
  useEffect(() => {
    if (
      step === 'abilities' &&
      prevStepRef.current !== 'abilities' &&
      Object.keys(assigned).length === 0
    ) {
      suggestScores();
    }
    prevStepRef.current = step;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Cambio metodo punteggi: azzera le assegnazioni (valori standard array e punti
  // acquisto non sono compatibili tra loro), chiude il picker e ripropone la
  // distribuzione consigliata.
  const changeAbilityMethod = (m: 'standard' | 'point_buy') => {
    if (m === abilityMethod) return;
    setAssigned({});
    setEditingAbility(null);
    setAbilityMethodState(m);
    setError(null);
    setAssigned(suggestScoreAssignment(allPrimaryAbilities.length > 0 ? allPrimaryAbilities : classDef?.primaryAbilities ?? []));
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
    const next = classSkills.includes(skill)
      ? classSkills.filter((s) => s !== skill)
      : classSkills.length >= skillCount
        ? classSkills
        : [...classSkills, skill];
    updateActiveClass({ classSkills: next });
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
  const setAsiMode = (key: string, mode: AsiMode) => {
    setAsiAssignments((prev) => ({
      ...prev,
      [key]: { mode, slots: mode === 'plus_two' ? [null] : [null, null] },
    }));
  };
  const toggleAsiAbility = (key: string, ability: Ability) => {
    setAsiAssignments((prev) => {
      const sec = prev[key];
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
      return { ...prev, [key]: { ...sec, slots } };
    });
  };

  // ── Handler: talenti (step dedicato) ──
  // A ogni livello ASI si sceglie O l'ASI (null) O un talento generale (feat id;
  // FEAT_MODE_PENDING = modalità talento attiva ma nessun talento scelto)
  const setAsiLevelFeat = (key: string, featId: number | null) => {
    const previous = featAtAsiLevel[key] ?? null;
    setFeatAtAsiLevel((prev) => ({ ...prev, [key]: featId }));
    // Se si esce da un talento scelto, si pulisce la scelta caratteristica collegata
    if (
      previous != null &&
      previous !== FEAT_MODE_PENDING &&
      previous !== featId
    ) {
      setFeatAsiPicks((p) => {
        if (!(previous in p)) return p;
        const copy = { ...p };
        delete copy[previous];
        return copy;
      });
    }
  };
  const selectFightingStyle = (id: number | null) => setFightingStyleId(id);
  const selectEpicBoon = (id: number | null) => setEpicBoonId(id);
  const toggleFeatAsi = (featId: number, ability: Ability) => {
    setFeatAsiPicks((prev) => {
      const current = prev[featId] ?? [];
      if (current.includes(ability)) {
        return { ...prev, [featId]: current.filter((a) => a !== ability) };
      }
      const count = getFeatAsiCount(getFeat(featId));
      if (current.length >= count) return prev;
      return { ...prev, [featId]: [...current, ability] };
    });
  };

  // ── Creazione ──
  const handleCreate = () => {
    // `scores` nel draft = punteggi BASE (standard array distribuito); i boost e
    // gli ASI vengono riapplicati da `buildCharacter` → `calculateFinalAbilities`.
    // Usare `finalResult.scores` (già con boost) li raddoppierebbe.
    if (!fullScores || !finalResult?.success || !background) return;
    if (!allClassesValid) {
      setError('Completa sottoclasse e competenze di tutte le classi.');
      return;
    }
    if (multiclassPrereqMissing.length > 0) {
      setError(`Prerequisiti multiclasse non soddisfatti: ${multiclassPrereqMissing.join(', ')}`);
      return;
    }
    const draft: CharacterDraft = {
      name: name.trim(),
      race: { raceId: raceId ?? undefined, lineageId: lineageId ?? undefined },
      classChoice: {
        className: classList[0].className,
        level: classList[0].level,
        subclassId: classList[0].subclassId ?? undefined,
      },
      classes: classList.map((cls) => ({
        className: cls.className,
        level: cls.level,
        subclassId: cls.subclassId ?? undefined,
      })),
      background: { backgroundId: background.id },
      classSkills: classList.flatMap((cls) => cls.classSkills),
      raceSkillChoices: raceSkills.length > 0 ? raceSkills : undefined,
      bgToolChoices: bgToolChoices.length > 0 ? bgToolChoices : undefined,
      featToolChoices: featToolChoices.length > 0 ? featToolChoices : undefined,
      featSkillChoices: featSkillChoices.length > 0 ? featSkillChoices : undefined,
      featSpellChoice:
        featSpellAbility != null && featCantrips.length > 0 && featSpell != null
          ? { ability: featSpellAbility, cantrips: featCantrips, spells: [featSpell] }
          : undefined,
      generalFeatIds: generalFeatIds.length > 0 ? generalFeatIds : undefined,
      fightingStyleId: fightingStyleId ?? undefined,
      epicBoonId: epicBoonId ?? undefined,
      featAsiPicks: Object.keys(featAsiPicks).length > 0 ? featAsiPicks : undefined,
      hpRoll: hpRoll ?? undefined,
      abilities: {
        method: abilityMethod,
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
    // Multiclasse
    classes: CLASSES, selectedClass, setSelectedClass,
    classList, activeClassIndex, setActiveClassIndex, addClass, removeClass,
    totalLevel,
    canAddClass: totalLevel < 20 && classList.length < 12,
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
    hasFightingStyle, fightingStyleOptions, fightingStyleId, selectFightingStyle,
    featAtAsiLevel, setAsiLevelFeat,
    generalFeatOptions, generalFeatIds,
    featAsiPicks, toggleFeatAsi,
    epicBoonUnlocked, epicBoonOptions, epicBoonId, selectEpicBoon,
    featError: finalResult && !finalResult.success ? finalResult.error : null,
    finalScores: finalScoresWithFeats,
    assigned, editingAbility, openAbilityPicker, closeAbilityPicker,
    assignToAbility, clearAbility, adjustAbility, suggestScores,
    abilityMethod, setAbilityMethod: changeAbilityMethod,
    pickerOptions, pointsLeft, allowedAbilities,
    showBoosts: background != null && allowedAbilities.length > 0,
    plusTwoPlusOne, picks, togglePick,
    asiKeys, asiAssignments, setAsiMode, toggleAsiAbility, finalResult,
    multiclassPrereqMissing, allClassesValid,
    hpRoll, setHpRoll,
    takeMaxHp: () => { if (primaryClassDef) setHpRoll(primaryClassDef.hitDie); },
    conMod, averagePerLevel, primaryHitDie,
    canGoNext: stepValid(step),
    isLastStep: step === 'summary',
    canCreate:
      stepValid('hp') &&
      stepValid('feat') &&
      finalResult?.success === true &&
      allClassesValid &&
      multiclassPrereqMissing.length === 0,
    stepValid,
    stepInvalidReason,
    handleCreate,
  };
}
