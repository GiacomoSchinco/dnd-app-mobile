import { getClass, getClassById } from './classes';
import { getRace, getRaceById, getLineageById, getRaceEffects, getRaceEffectIds, hasLineages, type RaceDefinition } from './races';
import { getBackground, type BackgroundFeat } from './backgrounds';
import { getFeat, getFeatAsiCap, getFeatAsiOptions } from './feats';
import { applyFeat, getToolOptions, type FeatApplyResult } from './apply-feat';
import { getSubclass, getSubclassFeaturesUpToLevel, getSubclassesByClassId } from './subclasses';
import { getSpellProgression, getLevelUpSpellChanges, getSpellSlots } from './spellcasting';
import { getClassProgression, getFeaturesAtLevel, getAsiLevels, getResourceValue, getProficiencyBonus, getClassResources, getResourceMax, getResourceDie } from './progression';
import { getStartingEquipment, getClassPreset, getEquipmentPreset } from './equipment-preset';
import { getAbilityModifier } from './abilities';
import { calculateMulticlassSpellSlots } from './multiclass';
import type {
  Ability,
  AbilityAbbreviation,
  AbilityScores,
  EffectRaw,
  SkillName,
  ClassName,
  ArmorType,
  WeaponType,
  Character,
  CharacterClass,
  CharacterResource,
  CharacterSenses,
  CharacterDefenses,
  CharacterSpellcasting,
  CharacterChoices,
  CharacterMoney,
  EquipmentItem,
  FeatCategory,
  FeatChoiceSelection,
  FeatSpellChoice,
  ClassFeatureRaw,
  SpellSlot,
} from '../../types';

/**
 * character-builder.ts — Orchestratore per creazione e livellamento PG.
 * Combina tutti i moduli rules/ in un flusso sequenziale.
 */

// ── Step 1: Scegli razza ───────────────────────────────────────

export interface RaceChoice {
  /** ID della razza (races.id) */
  raceId?: number;
  /** Nome della razza (es. 'Umano') */
  raceName?: string;
  /** ID della lineage/sottorazza (races.lineages[].id) */
  lineageId?: number;
}

export interface RaceChoiceResult {
  success: boolean;
  error?: string;
  data?: {
    race: RaceDefinition;
    lineage?: { id: number; name: string } | null;
    effects: EffectRaw[];
    effectIds: number[];
  };
}

/** Applica i dati razziali a un personaggio in costruzione */
export function applyRace(choice: RaceChoice): RaceChoiceResult {
  const race = choice.raceId != null
    ? getRaceById(choice.raceId)
    : choice.raceName
      ? getRace(choice.raceName)
      : undefined;

  if (!race) {
    return { success: false, error: `Razza "${choice.raceName ?? choice.raceId}" non trovata` };
  }

  if (hasLineages(race.id) && choice.lineageId == null) {
    return { success: false, error: 'Sottorazza (lineage) richiesta ma non specificata' };
  }

  const lineage = choice.lineageId != null ? getLineageById(race.id, choice.lineageId) : undefined;

  return {
    success: true,
    data: {
      race,
      lineage: lineage ? { id: lineage.id, name: lineage.name } : null,
      effects: getRaceEffects(race.id, choice.lineageId),
      effectIds: getRaceEffectIds(race.id, choice.lineageId),
    },
  };
}

// ── Step 2: Scegli classe ─────────────────────────────────────

export interface ClassChoice {
  /** ID della classe (classes.id) */
  classId?: number;
  /** Nome della classe (chiave inglese, nome inglese o etichetta italiana) */
  className?: string;
  /** ID della sottoclasse (subclasses.id) */
  subclassId?: number;
  level: number;
}

export interface ClassApplyResult {
  success: boolean;
  error?: string;
  data?: {
    classDef: NonNullable<ReturnType<typeof getClass>>;
    level: number;
    subclass?: ReturnType<typeof getSubclass>;
    features: { level: number; features: string[] }[];
    hitDie: number;
    primaryAbilities: Ability[];
    spellcasting?: { type?: string; ability?: Ability };
    spellProgression?: ReturnType<typeof getSpellProgression>;
    asiLevels: number[];
    subclassLevels: number[];
    subclassLabel?: string;
    resources: Record<string, unknown>;
  };
}

/** Applica i dati di classe a un personaggio */
export function applyClass(choice: ClassChoice): ClassApplyResult {
  const classDef = choice.classId != null
    ? getClassById(choice.classId)
    : choice.className
      ? getClass(choice.className)
      : undefined;

  if (!classDef) {
    return { success: false, error: `Classe "${choice.className ?? choice.classId}" non trovata` };
  }

  // Validazione livello (1–20)
  if (!Number.isInteger(choice.level) || choice.level < 1 || choice.level > 20) {
    return { success: false, error: `Livello non valido per la classe: ${choice.level}` };
  }

  // Validazione sottoclasse: deve appartenere alla classe scelta
  if (choice.subclassId != null) {
    const subclass = getSubclass(choice.subclassId);
    if (!subclass) {
      return { success: false, error: `Sottoclasse ID ${choice.subclassId} non trovata` };
    }
    if (subclass.classId !== classDef.id) {
      return { success: false, error: `La sottoclasse "${subclass.name}" non appartiene a "${classDef.labelIt}"` };
    }
  }

  const progression = getClassProgression(classDef.name);
  const features = getClassFeaturesFromProgression(classDef.name, choice.level);

  return {
    success: true,
    data: {
      classDef,
      level: choice.level,
      subclass: choice.subclassId != null ? getSubclass(choice.subclassId) : undefined,
      features,
      hitDie: classDef.hitDie,
      primaryAbilities: classDef.primaryAbilities,
      spellcasting: classDef.isSpellcaster ? {
        type: classDef.spellcastingType,
        ability: classDef.spellAbility,
      } : undefined,
      spellProgression: classDef.isSpellcaster
        ? getSpellProgression(classDef.name, choice.level)
        : undefined,
      asiLevels: progression ? getAsiLevels(classDef.name) : [],
      subclassLevels: progression?.subclassLevels ?? [],
      subclassLabel: progression?.subclassLabel,
      resources: progression?.resources ?? {},
    },
  };
}

/** Nome della feature ASI come da progression.json (fonte unica) */
const ASI_FEATURE_NAME = 'Aumento dei Punteggi di Caratteristica';

function getClassFeaturesFromProgression(className: string, level: number): { level: number; features: string[] }[] {
  const prog = getClassProgression(className);
  if (!prog) return [];

  const result: { level: number; features: string[] }[] = [];
  for (let lv = 1; lv <= level; lv++) {
    // Filtra l'ASI (gestito a parte) invece di controllare solo il primo elemento
    const feats = (prog.featuresByLevel[String(lv)] ?? []).filter((f) => f !== ASI_FEATURE_NAME);
    if (feats.length > 0) {
      result.push({ level: lv, features: feats });
    }
  }
  return result;
}

// ── Step 3: Scegli background ─────────────────────────────────

export interface BackgroundChoice {
  backgroundId: number;
  chosenSkills?: string[];
}

export interface BackgroundApplyResult {
  success: boolean;
  error?: string;
  data?: {
    background: NonNullable<ReturnType<typeof getBackground>>;
    /** Abilità consentite per i boost (allowedScores) */
    abilityBoosts: AbilityAbbreviation[];
    /** Modalità di distribuzione consentite (distributionModes) */
    distributionModes: string[];
    skills: SkillName[];
    toolProficiency?: { type: string; toolId?: string; category?: string };
    feat: BackgroundFeat;
    featId?: number;
    equipmentPresetId: number;
  };
}

/** Applica un background al personaggio */
export function applyBackground(choice: BackgroundChoice): BackgroundApplyResult {
  const bg = getBackground(choice.backgroundId);
  if (!bg) {
    return { success: false, error: `Background ID ${choice.backgroundId} non trovato` };
  }

  return {
    success: true,
    data: {
      background: bg,
      abilityBoosts: bg.abilityScoreBoosts.allowedScores,
      distributionModes: bg.abilityScoreBoosts.distributionModes,
      skills: bg.skills,
      toolProficiency: bg.toolProficiency,
      feat: bg.feat,
      featId: bg.feat.featId,
      equipmentPresetId: bg.equipmentPresetId,
    },
  };
}

/** Risolve il feat di un background, validando la scelta quando richiesta */
export function resolveBackgroundFeat(
  backgroundId: number,
  choice?: string
): { success: boolean; error?: string; feat?: BackgroundFeat } {
  const bg = getBackground(backgroundId);
  if (!bg) return { success: false, error: `Background ID ${backgroundId} non trovato` };
  if (bg.feat.requiresChoice && !choice) {
    return { success: false, error: `Il background richiede una scelta per il feat "${bg.feat.name}"` };
  }
  return { success: true, feat: bg.feat };
}

// ── Step 4: Assegna caratteristiche ────────────────────────────

export type AbilityBoostMode = 'PLUS_TWO_PLUS_ONE' | 'THREE_PLUS_ONES';

export interface AbilityBoost {
  ability: Ability;
  amount: 1 | 2;
}

export interface AbilityAssignment {
  method: 'standard' | 'point_buy' | 'manual';
  scores: AbilityScores;
  /** Boost scelti dal giocatore (es. da background) — devono rispettare distributionModes */
  boosts?: AbilityBoost[];
  /** Abilità consentite (allowedScores del background) — per validazione */
  allowedBoosts?: AbilityAbbreviation[];
  /** Modalità di distribuzione consentite (distributionModes del background) — per validazione */
  distributionModes?: string[];
  /** ASI applicati (5.5e: +2 a una caratteristica oppure +1 a due), tetto 20 */
  asiBoosts?: AbilityBoost[];
}

export type AbilityAssignmentResult =
  | { success: true; scores: AbilityScores }
  | { success: false; error: string };

/** Mappa abbreviazioni (italiane e inglesi) → chiave Ability */
const ABILITY_ABBR_TO_KEY: Record<string, Ability> = {
  FOR: 'strength', DES: 'dexterity', COS: 'constitution',
  INT: 'intelligence', SAG: 'wisdom', CAR: 'charisma',
  STR: 'strength', DEX: 'dexterity', CON: 'constitution',
  WIS: 'wisdom', CHA: 'charisma',
};

/**
 * Calcola i punteggi finali applicando i boost scelti dal giocatore.
 * Valida contro distributionModes (PLUS_TWO_PLUS_ONE = +2/+1, THREE_PLUS_ONES = +1+1+1)
 * e allowedScores (abilità consentite dal background), con tetto a 20.
 */
export function calculateFinalAbilities(assignment: AbilityAssignment): AbilityAssignmentResult {
  const scores = { ...assignment.scores };
  const boosts = assignment.boosts ?? [];
  const allowedKeys = (assignment.allowedBoosts ?? [])
    .map((a) => ABILITY_ABBR_TO_KEY[a.toUpperCase()])
    .filter((a): a is Ability => a != null);

  // 1. Validazione della modalità di distribuzione
  if (assignment.distributionModes && assignment.distributionModes.length > 0) {
    const amounts = boosts.map((b) => b.amount).sort((a, b) => b - a);
    const matchesPlusTwoPlusOne =
      assignment.distributionModes.includes('PLUS_TWO_PLUS_ONE') &&
      boosts.length === 2 && amounts[0] === 2 && amounts[1] === 1;
    const matchesThreePlusOnes =
      assignment.distributionModes.includes('THREE_PLUS_ONES') &&
      boosts.length === 3 && amounts.every((a) => a === 1);
    if (!matchesPlusTwoPlusOne && !matchesThreePlusOnes) {
      return { success: false, error: 'Distribuzione dei potenziamenti non valida per questo background' };
    }
  }

  // 2. Applica i boost con validazioni
  for (const boost of boosts) {
    if (boost.amount !== 1 && boost.amount !== 2) {
      return { success: false, error: `Aumento non valido per ${boost.ability}: ${boost.amount}` };
    }
    if (allowedKeys.length > 0 && !allowedKeys.includes(boost.ability)) {
      return { success: false, error: `L'abilità "${boost.ability}" non è tra quelle consentite` };
    }
    if (scores[boost.ability] + boost.amount > 20) {
      return { success: false, error: `L'abilità "${boost.ability}" supererebbe 20` };
    }
    scores[boost.ability] += boost.amount;
  }

  // 3. ASI (5.5e): ogni ASI = +2 a UNA caratteristica OPPURE +1 a DUE.
  // I +1 devono essere in coppia; tetto 20.
  const asiBoosts = assignment.asiBoosts ?? [];
  if (asiBoosts.length > 0) {
    let plusOnes = 0;
    for (const boost of asiBoosts) {
      if (boost.amount !== 1 && boost.amount !== 2) {
        return { success: false, error: `Aumento ASI non valido per ${boost.ability}: ${boost.amount}` };
      }
      if (boost.amount === 1) plusOnes += 1;
      if (scores[boost.ability] + boost.amount > 20) {
        return { success: false, error: `L'abilità "${boost.ability}" supererebbe 20 con l'ASI` };
      }
      scores[boost.ability] += boost.amount;
    }
    if (plusOnes % 2 !== 0) {
      return { success: false, error: "Gli aumenti +1 dell'ASI vanno applicati a coppie (+1 a due caratteristiche)" };
    }
  }

  return { success: true, scores };
}

// ── Step 5: Level Up ──────────────────────────────────────────

export interface LevelUpRequest {
  currentLevel: number;
  newLevel: number;
  className: string;
  conModifier: number;
}

export interface LevelUpResult {
  success: boolean;
  error?: string;
  changes?: {
    newLevel: number;
    hpGained: number;
    newFeatures: { level: number; features: string[] }[];
    asiLevel: boolean;
    subclassLevel: boolean;
    spellChanges?: ReturnType<typeof getLevelUpSpellChanges>;
    resourceChanges: { resource: string; newValue: number | string }[];
  };
}

/** Calcola i cambiamenti quando si sale di livello */
export function calculateLevelUp(request: LevelUpRequest): LevelUpResult {
  const classDef = getClass(request.className);
  if (!classDef) return { success: false, error: 'Classe non trovata' };
  if (request.newLevel <= request.currentLevel) {
    return { success: false, error: 'Il nuovo livello deve essere maggiore del corrente' };
  }

  const progression = getClassProgression(request.className);
  if (!progression) return { success: false, error: 'Progressione non trovata' };

  // HP guadagnati per livello: media del dado vita + mod COS, minimo 1 (regola D&D).
  // NB: il livello 1 dovrebbe dare il dado vita MASSIMO — gestire in createCharacter.
  const hpPerLevel = Math.max(classDef.hitPoints.average + request.conModifier, 1);
  const hpGained = (request.newLevel - request.currentLevel) * hpPerLevel;

  // Nuove feature (escludendo i livelli ASI, gestiti a parte)
  const newFeatures: { level: number; features: string[] }[] = [];
  for (let lv = request.currentLevel + 1; lv <= request.newLevel; lv++) {
    const feats = getFeaturesAtLevel(request.className, lv).filter((f) => f !== ASI_FEATURE_NAME);
    if (feats.length > 0) {
      newFeatures.push({ level: lv, features: feats });
    }
  }

  // ASI?
  const asiLevels = getAsiLevels(request.className);
  const asiLevel = asiLevels.some((l) => l > request.currentLevel && l <= request.newLevel);

  // Sottoclasse?
  const subclassLevel = progression.subclassLevels.some((l) => l > request.currentLevel && l <= request.newLevel);

  // Cambiamenti incantesimi
  let spellChanges: ReturnType<typeof getLevelUpSpellChanges> | undefined;
  if (classDef.isSpellcaster) {
    spellChanges = getLevelUpSpellChanges(classDef.name, request.currentLevel, request.newLevel);
  }

  // Cambiamenti risorse
  const resourceChanges: { resource: string; newValue: number | string }[] = [];
  for (const [key, resource] of Object.entries(progression.resources)) {
    const newVal = getResourceValue(request.className, key, request.newLevel);
    if (newVal !== undefined) {
      resourceChanges.push({ resource: resource.label ?? key, newValue: newVal });
    }
  }

  return {
    success: true,
    changes: {
      newLevel: request.newLevel,
      hpGained,
      newFeatures,
      asiLevel,
      subclassLevel,
      spellChanges,
      resourceChanges,
    },
  };
}

// ── Step 6: Assegna equipaggiamento iniziale ──────────────────

export { getStartingEquipment } from './equipment-preset';

// ── Riepilogo completo ─────────────────────────────────────────

export interface CharacterBuildPlan {
  raceResult: RaceChoiceResult;
  /** Classe primaria (la PRIMA del multiclasse) */
  classResult: ClassApplyResult;
  /** TUTTE le classi (la prima = primaria). Per il single-class coincide con [classResult] */
  classResults: ClassApplyResult[];
  backgroundResult: BackgroundApplyResult;
  abilities: AbilityScores;
  featId?: number;
  feat?: ReturnType<typeof getFeat>;
  /** Concessioni meccaniche del talento di origine (modificatori, strumenti, risorse) */
  featApply?: FeatApplyResult;
  /** Talenti aggiuntivi (generali/epici/stile) applicati — concessioni risolte */
  additionalFeats?: { featId: number; name: string; category: FeatCategory; apply: FeatApplyResult }[];
  /** ASI concessi dai talenti aggiuntivi (già applicati a `abilities`) */
  featAsiBoosts?: AbilityBoost[];
  /** Scelte caratteristica per gli ASI dei talenti (per riproducibilità) */
  featAsiPicks?: Record<number, Ability[]>;
  /** Scelte extra dei talenti generali/epici (choice_config, per feat id) */
  featChoices?: Record<number, FeatChoiceSelection>;
  /** Strumenti scelti per la competenza a scelta del background (CHOICE) */
  bgToolProficiencies?: string[];
  /** Competenze in abilità scelte dalla razza (es. Umano "Pluriabilità", Elfo "Sensi Acuti") */
  raceSkills?: SkillName[];
  /** Id del talento delle origini scelto dalla razza (es. Umano "Versatile") */
  raceFeatId?: number;
  startingEquipment?: { name: string; itemId: number; quantity: number }[];
  /** Boost abilità applicati (per registrare la scelta in `choices.abilityBoosts`) */
  boosts?: AbilityBoost[];
  /** Metodo di generazione punteggi usato (standard | point_buy | manual) */
  abilityMethod?: AbilityAssignment['method'];
  /** Skill di classe scelte (competenze) */
  classSkills?: SkillName[];
  /** ASI applicati (5.5e) */
  asiBoosts?: AbilityBoost[];
  /** Tiro del dado vita al 1° livello (se assente, si usa il dado MAX) */
  hpRoll?: number;
}

/** Costruisce un PG completo dal livello 1 */
export function buildCharacter(params: {
  race: RaceChoice;
  classChoice: ClassChoice;
  /** Classi per il MULTICLASSE (la prima = primaria). Se assente usa `classChoice` */
  classes?: ClassChoice[];
  background: BackgroundChoice;
  abilities: AbilityAssignment;
  /** Skill di classe scelte dal giocatore (competenze) */
  classSkills?: SkillName[];
  /** Strumenti scelti per la competenza a scelta del background (CHOICE) */
  bgToolChoices?: string[];
  /** Strumenti scelti per il choice_config del talento (tool_proficiency) */
  featToolChoices?: string[];
  /** Abilità scelte per il talento "Abile" (hybrid_proficiency) */
  featSkillChoices?: SkillName[];
  /** Scelta incantesimi per il talento "Iniziato alla Magia" (spellcasting) */
  featSpellChoice?: FeatSpellChoice;
  /** Id dei talenti generali scelti (uno per livello ASI) */
  generalFeatIds?: number[];
  /** Id dello stile di combattimento (Fighter/Paladin/Ranger) */
  fightingStyleId?: number;
  /** Id del dono epico (livello 19+) */
  epicBoonId?: number;
  /** Scelte caratteristica per gli ASI concessi dai talenti (chiave = feat id) */
  featAsiPicks?: Record<number, Ability[]>;
  /** Scelte extra dei talenti generali/epici (choice_config, per feat id) */
  featChoices?: Record<number, FeatChoiceSelection>;
  /** Competenze in abilità scelte dalla razza (es. Umano "Pluriabilità") */
  raceSkillChoices?: SkillName[];
  /** Id del talento delle origini scelto dalla razza (es. Umano "Versatile") */
  raceFeatId?: number;
  /** Tiro del dado vita al 1° livello (opzionale) */
  hpRoll?: number;
}): CharacterBuildPlan | { success: false; error: string } {
  const raceResult = applyRace(params.race);
  if (!raceResult.success) return { success: false, error: raceResult.error! };

  // Multiclasse: applica TUTTE le classi (la PRIMA = classe primaria)
  const classChoices =
    params.classes && params.classes.length > 0 ? params.classes : [params.classChoice];
  const classResults: ClassApplyResult[] = [];
  for (const cc of classChoices) {
    const cr = applyClass(cc);
    if (!cr.success) return { success: false, error: cr.error! };
    classResults.push(cr);
  }
  const classResult = classResults[0];

  const backgroundResult = applyBackground(params.background);
  if (!backgroundResult.success) return { success: false, error: backgroundResult.error! };

  const abilitiesResult = calculateFinalAbilities({
    ...params.abilities,
    allowedBoosts: params.abilities.allowedBoosts ?? backgroundResult.data?.abilityBoosts,
    distributionModes: params.abilities.distributionModes ?? backgroundResult.data?.distributionModes,
  });
  if (!abilitiesResult.success) return { success: false, error: abilitiesResult.error };
  const scores: AbilityScores = { ...abilitiesResult.scores };

  const featId = backgroundResult.data?.featId;
  const feat = featId ? getFeat(featId) : undefined;

  // Equipaggiamento iniziale = CLASSE + BACKGROUND (dedup per itemId, somma quantità)
  const classPreset = getClassPreset(classResult.data?.classDef?.id ?? -1);
  const bgEquipment = backgroundResult.data
    ? getStartingEquipment(backgroundResult.data.equipmentPresetId)
    : [];
  const equipmentMap = new Map<number, { name: string; itemId: number; quantity: number }>();
  for (const it of [...(classPreset?.items ?? []), ...bgEquipment]) {
    const existing = equipmentMap.get(it.itemId);
    if (existing) existing.quantity += it.quantity;
    else equipmentMap.set(it.itemId, { ...it });
  }
  const equipment = equipmentMap.size > 0 ? Array.from(equipmentMap.values()) : undefined;

  // Talento di origine → concessioni meccaniche (modificatori, competenze, incantesimi, risorse)
  const featApply = feat
    ? applyFeat(feat, {
        toolChoices: params.featToolChoices,
        skillChoices: params.featSkillChoices,
        spellChoice: params.featSpellChoice,
      })
    : undefined;

  // Talenti aggiuntivi (generali / stile di combattimento / dono epico)
  const additionalFeats: NonNullable<CharacterBuildPlan['additionalFeats']> = [];
  const featAsiBoosts: AbilityBoost[] = [];
  const additionalIds = [
    ...(params.generalFeatIds ?? []),
    ...(params.fightingStyleId != null ? [params.fightingStyleId] : []),
    ...(params.epicBoonId != null ? [params.epicBoonId] : []),
    ...(params.raceFeatId != null ? [params.raceFeatId] : []),
  ];
  for (const id of additionalIds) {
    const extraFeat = getFeat(id);
    if (!extraFeat) continue;
    // Se il talento ha UNA sola caratteristica consentita, la scelta è automatica
    const singleAsi =
      !params.featAsiPicks?.[id] && getFeatAsiOptions(extraFeat).length === 1
        ? getFeatAsiOptions(extraFeat)
        : undefined;
    // Scelte spellcasting (Iniziato alla Magia) → FeatSpellChoice per applyFeat
    const featChoice = params.featChoices?.[id];
    const spellChoice =
      featChoice?.spellAbility != null &&
      Array.isArray(featChoice.cantrips) &&
      Array.isArray(featChoice.spells)
        ? {
            ability: featChoice.spellAbility,
            cantrips: featChoice.cantrips,
            spells: featChoice.spells,
          }
        : undefined;
    const apply = applyFeat(extraFeat, {
      asiChoices: singleAsi ?? params.featAsiPicks?.[id],
      choice: featChoice,
      spellChoice,
    });
    additionalFeats.push({
      featId: id,
      name: extraFeat.name,
      category: extraFeat.category,
      apply,
    });
    // ASI concessi dal talento (asi_config) → applicati ai punteggi finali (cap = max_cap)
    for (const b of apply.asiBoosts) {
      const cap = getFeatAsiCap(extraFeat);
      scores[b.ability] = Math.min((scores[b.ability] ?? 10) + b.amount, cap);
      featAsiBoosts.push(b);
    }
  }

  // Competenza strumenti del background (type CHOICE → pool di strumenti, ne sceglie 1)
  const bgToolProficiencies: string[] = [];
  const bgTool = backgroundResult.data?.toolProficiency;
  if (bgTool?.type === 'CHOICE' && bgTool.category) {
    const options = getToolOptions(bgTool.category);
    const picked = (params.bgToolChoices ?? []).filter((t) =>
      options.some((o) => o.slug === t),
    );
    bgToolProficiencies.push(...picked.slice(0, 1));
  }

  // Competenze in abilità scelte dalla razza (effetti choice_type skill_proficiency)
  const raceSkillEffects =
    raceResult.data?.effects.filter(
      (e) => e.type === 'choice' && e.choice_type === 'skill_proficiency',
    ) ?? [];
  const raceSkillOptionsAll = raceSkillEffects.flatMap((e) =>
    Array.isArray(e.options) && e.options.length > 0 ? (e.options as SkillName[]) : [],
  );
  const raceSkillTotal = raceSkillEffects.reduce((n, e) => n + (e.count ?? 0), 0);
  const raceSkills = (params.raceSkillChoices ?? [])
    .filter((s) => raceSkillOptionsAll.length === 0 || raceSkillOptionsAll.includes(s))
    .slice(0, raceSkillTotal);

  return {
    raceResult,
    classResult,
    classResults,
    backgroundResult,
    abilities: scores,
    featId,
    feat,
    featApply,
    additionalFeats: additionalFeats.length > 0 ? additionalFeats : undefined,
    featAsiBoosts: featAsiBoosts.length > 0 ? featAsiBoosts : undefined,
    featAsiPicks: params.featAsiPicks,
    featChoices: params.featChoices,
    bgToolProficiencies: bgToolProficiencies.length > 0 ? bgToolProficiencies : undefined,
    raceSkills: raceSkills.length > 0 ? raceSkills : undefined,
    raceFeatId: params.raceFeatId,
    startingEquipment: equipment,
    boosts: params.abilities.boosts,
    abilityMethod: params.abilities.method,
    classSkills: params.classSkills,
    asiBoosts: params.abilities.asiBoosts,
    hpRoll: params.hpRoll,
  };
}

// ═══════════════════════════════════════════════════════════════
//  MOTORE MULTI-CLASSE
//  Statistiche DERIVATE calcolate dall'insieme delle classi
//  (level, PB, PF, feature, slot, risorse, competenze). Usato sia
//  dalla creazione (wizard) sia dal level-up, così entrambe le
//  feature condividono la stessa fonte di verità.
// ═══════════════════════════════════════════════════════════════

/** Riepilogo applicato di una singola classe (esito di `applyClass`) */
export type ClassSummary = NonNullable<ClassApplyResult['data']>;

/** Applica più classi e ne produce i riepiloghi (la PRIMA = classe primaria) */
export function buildClassSummaries(
  classes: Array<{ className?: string; classId?: number; level: number; subclassId?: number }>
): { success: true; summaries: ClassSummary[] } | { success: false; error: string } {
  const summaries: ClassSummary[] = [];
  for (const c of classes) {
    const result = applyClass(c);
    if (!result.success || !result.data) {
      return { success: false, error: result.error ?? 'Classe non valida' };
    }
    summaries.push(result.data);
  }
  return { success: true, summaries };
}

/** Statistiche DERIVATE dalle sole classi (non tocca razza/background/talenti) */
export interface ClassDerived {
  /** Livello totale (somma dei livelli di tutte le classi) */
  level: number;
  proficiencyBonus: number;
  /** PF massimi: 1ª classe lv1 = dado MAX (o tiro), poi media+CON per ogni livello extra */
  maxHp: number;
  /** Dado vita della classe primaria (es. 'd12') */
  hitDie: string;
  classFeatures: { level: number; name: string; description?: string; table?: string }[];
  subclassFeatures: ClassFeatureRaw[];
  /** Slot incantesimi (caster level combinato + Pact Magic del Warlock) */
  spellSlots: Record<number, SpellSlot>;
  /** Risorse di CLASSE (merge su tutte le classi, senza risorse da razza/talenti) */
  resources: Record<string, CharacterResource>;
  /** Tiri salvezza della classe primaria */
  savingThrows: Ability[];
  /** Competenze armature/armi/strumenti (unione di tutte le classi) */
  armor: ArmorType[];
  weapons: WeaponType[];
  tools: string[];
}

/** Calcola le statistiche derivate a partire dai riepiloghi delle classi. */
export function computeClassDerived(
  summaries: ClassSummary[],
  abilities: AbilityScores,
  opts?: { hpRoll?: number }
): ClassDerived {
  const [primary, ...rest] = summaries;
  const conMod = getAbilityModifier(abilities.constitution);
  const level = summaries.reduce((n, s) => n + s.level, 0);
  const proficiencyBonus = getProficiencyBonus(level);

  // PF: 1ª classe lv1 = dado MAX (o tiro) + CON; poi media+CON (min 1) per ogni livello extra
  let maxHp = (opts?.hpRoll ?? primary.hitDie) + conMod;
  for (let i = 2; i <= primary.level; i++) {
    maxHp += Math.max(primary.classDef.hitPoints.average + conMod, 1);
  }
  for (const cls of rest) {
    // Il 1° livello di una classe aggiunta conta come livello normale (media, non max)
    for (let i = 1; i <= cls.level; i++) {
      maxHp += Math.max(cls.classDef.hitPoints.average + conMod, 1);
    }
  }

  // Feature di classe (unione, con descrizione/tabella da classes.json)
  const classFeatures: { level: number; name: string; description?: string; table?: string }[] = [];
  for (const sum of summaries) {
    for (const lvl of sum.features) {
      for (const name of lvl.features) {
        const cf = sum.classDef.featuresByLevel[lvl.level]?.find((f) => f.name === name);
        classFeatures.push({ level: lvl.level, name, description: cf?.description, table: cf?.table });
      }
    }
  }

  // Feature di sottoclasse (unione, fino al livello della singola classe)
  const subclassFeatures: ClassFeatureRaw[] = [];
  for (const sum of summaries) {
    if (sum.subclass?.id != null) {
      subclassFeatures.push(...getSubclassFeaturesUpToLevel(sum.subclass.id, sum.level));
    }
  }

  // Slot incantesimi: con UNA sola classe si usa la tabella della classe
  // (half/third caster usano la propria tabella, NON full_caster); con più
  // classi vale la regola del multiclasse (caster level combinato → full_caster)
  // + la Pact Magic del Warlock separata.
  const characterClasses: CharacterClass[] = summaries.map((s) => ({
    className: s.classDef.name as ClassName,
    level: s.level,
  }));
  const spellSlots =
    summaries.length === 1
      ? getSpellSlots(primary.classDef.name, primary.level)
      : calculateMulticlassSpellSlots(characterClasses);

  // Risorse di classe (merge su tutte le classi)
  const resources: Record<string, CharacterResource> = {};
  for (const sum of summaries) {
    for (const [key, res] of Object.entries(getClassResources(sum.classDef.name))) {
      const max = getResourceMax(
        sum.classDef.name,
        key,
        sum.level,
        (ability) => getAbilityModifier((abilities as Record<string, number>)[ability] ?? 10)
      );
      if (typeof max !== 'number') continue;
      let label = res.label;
      const die = getResourceDie(sum.classDef.name, key, sum.level);
      if (die) label = `${label} (${die})`;
      resources[key] = {
        label,
        max,
        current: max,
        resetOn: typeof res.recovery === 'string' ? res.recovery : 'long_rest',
        description: res.description,
      };
    }
  }

  // Competenze (unione) + tiri salvezza (solo classe primaria)
  const armor: ArmorType[] = [];
  const weapons: WeaponType[] = [];
  const tools: string[] = [];
  const pushUnique = <T,>(arr: T[], v: T) => {
    if (!arr.includes(v)) arr.push(v);
  };
  for (const sum of summaries) {
    for (const a of sum.classDef.proficiencies.armor
      .map((x) => ARMOR_TYPE_MAP[x])
      .filter((x): x is ArmorType => x != null)) pushUnique(armor, a);
    for (const w of sum.classDef.proficiencies.weapons
      .map((x) => WEAPON_TYPE_MAP[x])
      .filter((x): x is WeaponType => x != null)) pushUnique(weapons, w);
    for (const t of sum.classDef.proficiencies.tools) pushUnique(tools, t);
  }
  const savingThrows = primary.classDef.savingThrows;

  return {
    level,
    proficiencyBonus,
    maxHp,
    hitDie: `d${primary.hitDie}`,
    classFeatures,
    subclassFeatures,
    spellSlots,
    resources,
    savingThrows,
    armor,
    weapons,
    tools,
  };
}

// ── Level up ───────────────────────────────────────────────────

/** Riepilogo dei cambiamenti quando si sale di livello (funzione PURA, nessuna mutazione) */
export type LevelUpPreview =
  | {
      success: true;
      className: string;
      classLabel: string;
      currentClassLevel: number;
      newClassLevel: number;
      /** Nuovo livello TOTALE del personaggio */
      totalLevel: number;
      /** PF guadagnati con la MEDIA (senza tiro): media dado + CON, min 1 */
      averageHpGained: number;
      /** Dado vita della classe da livellare */
      hitDie: number;
      /** Nuove feature della classe al livello raggiunto (ASI escluse) */
      newFeatures: { level: number; features: string[] }[];
      /** Livelli ASI della classe attraversati (di solito al più uno) */
      asiLevels: number[];
      /** True se il livello raggiunto sblocca la sottoclasse della classe */
      subclassUnlocked: boolean;
      /** Sottoclassi disponibili quando subclassUnlocked (per il picker) */
      subclasses: { id: number; name: string }[];
      /** Nuovi slot guadagnati (delta max) per livello incantesimo */
      newSpellSlots: Record<number, number>;
      /** Slot totali dopo il level-up */
      totalSpellSlots: Record<number, SpellSlot>;
      /** Risorse che cambiano max */
      resourceChanges: { resource: string; newValue: number }[];
    }
  | { success: false; error: string };

export function calculateLevelUpPreview(character: Character, className: string): LevelUpPreview {
  const clsIndex = character.classes.findIndex((c) => c.className === className);
  if (clsIndex === -1) return { success: false, error: 'Classe non trovata' };
  const cls = character.classes[clsIndex];
  if (cls.level >= 20) return { success: false, error: 'Livello massimo raggiunto (20)' };

  const classDef = getClass(className);
  if (!classDef) return { success: false, error: 'Classe non trovata' };

  const oldClasses = character.classes.map((c) => ({
    className: c.className,
    level: c.level,
    subclassId: c.subclassId,
  }));
  const newClasses = character.classes.map((c) => ({
    className: c.className,
    level: c.level,
    subclassId: c.subclassId,
  }));
  newClasses[clsIndex] = { ...newClasses[clsIndex], level: cls.level + 1 };

  const oldSum = buildClassSummaries(oldClasses);
  const newSum = buildClassSummaries(newClasses);
  if (!oldSum.success || !newSum.success) return { success: false, error: 'Classi non valide' };

  const oldDerived = computeClassDerived(oldSum.summaries, character.abilities);
  const newDerived = computeClassDerived(newSum.summaries, character.abilities);
  if (newDerived.level > 20) {
    return { success: false, error: 'Livello massimo del personaggio raggiunto (20)' };
  }

  const conMod = getAbilityModifier(character.abilities.constitution);
  const averageHpGained = Math.max(classDef.hitPoints.average + conMod, 1);

  // Feature nuove della classe al livello raggiunto
  const newFeatures: { level: number; features: string[] }[] = [];
  for (const lvl of newSum.summaries[clsIndex].features) {
    if (lvl.level > cls.level) newFeatures.push(lvl);
  }

  // ASI della classe attraversati (di norma uno per salita di livello)
  const asiLevels = getAsiLevels(className).filter((l) => l > cls.level && l <= cls.level + 1);

  // La sottoclasse si SCEGLIE solo al primo livello di sottoclasse (di solito 3°),
  // quando la classe non ne ha ancora una. Ai livelli successivi (6, 10, 14, …) si
  // ricevono solo le FEATURE di sottoclasse, che il motore aggiunge automaticamente
  // se `subclassId` è già presente sul personaggio.
  const alreadyHasSubclass = character.classes[clsIndex].subclassId != null;
  const subclassUnlocked =
    newSum.summaries[clsIndex].subclassLevels.includes(cls.level + 1) && !alreadyHasSubclass;
  const subclasses = subclassUnlocked
    ? getSubclassesByClassId(classDef.id).map((sc) => ({ id: sc.id, name: sc.name }))
    : [];

  // Delta slot (multiclasse-aware)
  const newSpellSlots: Record<number, number> = {};
  for (const [lvl, slot] of Object.entries(newDerived.spellSlots)) {
    const n = Number(lvl);
    const oldMax = oldDerived.spellSlots[n]?.max ?? 0;
    if (slot.max > oldMax) newSpellSlots[n] = slot.max - oldMax;
  }

  // Risorse che cambiano max
  const resourceChanges: { resource: string; newValue: number }[] = [];
  for (const [key, res] of Object.entries(newDerived.resources)) {
    const oldMax = oldDerived.resources[key]?.max;
    if (oldMax == null || oldMax !== res.max) {
      resourceChanges.push({ resource: res.label, newValue: res.max });
    }
  }

  return {
    success: true,
    className,
    classLabel: classDef.labelIt ?? className,
    currentClassLevel: cls.level,
    newClassLevel: cls.level + 1,
    totalLevel: newDerived.level,
    averageHpGained,
    hitDie: classDef.hitDie,
    newFeatures,
    asiLevels,
    subclassUnlocked,
    subclasses,
    newSpellSlots,
    totalSpellSlots: newDerived.spellSlots,
    resourceChanges,
  };
}

// ── Step 7: Piano → modello salvabile (Character) ──────────────

/** Mappa le etichette armature del JSON (classes.json) → ArmorType */
const ARMOR_TYPE_MAP: Record<string, ArmorType> = {
  'armature leggere': 'light',
  'armature medie': 'medium',
  'armature pesanti': 'heavy',
  'scudi': 'shield',
};

/** Mappa le etichette armi del JSON (classes.json) → WeaponType */
const WEAPON_TYPE_MAP: Record<string, WeaponType> = {
  'armi semplici': 'simple',
  'armi da guerra': 'martial',
};

/** Estrae i sensi (scurovisione, ecc.) dagli effetti di razza/lineage */
function extractSenses(effects: EffectRaw[]): CharacterSenses | undefined {
  const senses: { darkvision?: number; blindsight?: number; truesight?: number; tremorsense?: number } = {};
  let unit = 'meters';
  for (const eff of effects) {
    if (eff.type === 'sense_grant' && typeof eff.sense === 'string') {
      const key = eff.sense as keyof typeof senses;
      if (key in senses && typeof eff.value === 'number') {
        senses[key] = eff.value;
      }
      if (typeof eff.unit === 'string') unit = eff.unit;
    }
  }
  const hasAny = Object.values(senses).some((v) => v != null);
  return hasAny ? { ...senses, unit } : undefined;
}

/** Estrae resistenze/immunità dagli effetti (resistance_grant, condition_immunity, …) */
function extractDefenses(effects: EffectRaw[]): CharacterDefenses {
  const defenses: CharacterDefenses = {
    resistances: [],
    immunities: [],
    vulnerabilities: [],
    conditionImmunities: [],
  };
  for (const eff of effects) {
    if (eff.type === 'resistance_grant' && typeof eff.damage_type === 'string') {
      defenses.resistances.push(eff.damage_type);
    } else if (eff.type === 'damage_immunity' && typeof eff.damage_type === 'string') {
      defenses.immunities.push(eff.damage_type);
    } else if (eff.type === 'vulnerability_grant' && typeof eff.damage_type === 'string') {
      defenses.vulnerabilities.push(eff.damage_type);
    } else if (eff.type === 'condition_immunity' && typeof eff.condition === 'string') {
      defenses.conditionImmunities.push(eff.condition);
    }
  }
  return defenses;
}

/**
 * Converte un `CharacterBuildPlan` (esito di `buildCharacter`)
 * nel modello `Character` salvabile — riempie lo scheletro completo.
 */
export function buildCharacterSheet(
  plan: CharacterBuildPlan,
  meta: { id: string; name: string }
): Character {
  const raceData = plan.raceResult.data!;
  const bgData = plan.backgroundResult.data!;

  // TUTTE le classi (la prima = primaria). Per single-class coincide con [classResult]
  const classResults =
    plan.classResults && plan.classResults.length > 0 ? plan.classResults : [plan.classResult];
  const summaries = classResults.map((r) => r.data!);
  const classData = summaries[0];
  const classDef = classData.classDef;

  const abilities = plan.abilities;
  const dexMod = getAbilityModifier(abilities.dexterity);

  // Statistiche DERIVATE dalla/e classe/i (motore condiviso con il level-up)
  const derived = computeClassDerived(summaries, abilities, { hpRoll: plan.hpRoll });
  const level = derived.level;
  const proficiencyBonus = derived.proficiencyBonus;
  const maxHp = derived.maxHp;
  const conMod = getAbilityModifier(abilities.constitution);

  // Competenze: armature/armi/strumenti = UNIONE di tutte le classi (dal motore);
  // tiri salvezza = solo classe primaria
  const armor = [...derived.armor];
  const weapons = [...derived.weapons];
  const tools = [...derived.tools];
  // Competenze in armature/armi concesse dai TALENTI (armor_proficiency/weapon_proficiency)
  if (plan.featApply) {
    for (const a of plan.featApply.armorProficiencies ?? []) if (!armor.includes(a)) armor.push(a);
    for (const w of plan.featApply.weaponProficiencies ?? []) if (!weapons.includes(w)) weapons.push(w);
  }
  for (const af of plan.additionalFeats ?? []) {
    for (const a of af.apply.armorProficiencies ?? []) if (!armor.includes(a)) armor.push(a);
    for (const w of af.apply.weaponProficiencies ?? []) if (!weapons.includes(w)) weapons.push(w);
  }
  if (bgData.toolProficiency?.toolId) tools.push(bgData.toolProficiency.toolId);
  // Strumenti scelti dal background (CHOICE) e dal talento di origine
  for (const t of plan.bgToolProficiencies ?? []) if (!tools.includes(t)) tools.push(t);
  for (const t of plan.featApply?.toolProficiencies ?? []) if (!tools.includes(t)) tools.push(t);
  for (const af of plan.additionalFeats ?? [])
    for (const t of af.apply.toolProficiencies ?? []) if (!tools.includes(t)) tools.push(t);
  // Skill: background + scelte di classe + abilità del talento (Abile) + scelte della razza + talenti aggiuntivi
  const skills: SkillName[] = [];
  for (const s of [
    ...bgData.skills,
    ...(plan.classSkills ?? []),
    ...(plan.featApply?.skills ?? []),
    ...(plan.raceSkills ?? []),
    ...(plan.additionalFeats ?? []).flatMap((af) => af.apply.skills ?? []),
  ] as SkillName[]) {
    if (!skills.includes(s)) skills.push(s);
  }
  const savingThrows: Ability[] = [...derived.savingThrows];
  const expertise: SkillName[] = [];
  for (const af of plan.additionalFeats ?? []) {
    for (const s of af.apply.expertise ?? []) if (!expertise.includes(s)) expertise.push(s);
    for (const st of af.apply.savingThrows ?? []) if (!savingThrows.includes(st)) savingThrows.push(st);
  }

  // Effetti risolti (razza + lineage)
  const effects = raceData.effects;

  // Resistenze dai talenti (energy_resistance_choice, es. Dono della Resistenza Energetica)
  const featResistances: string[] = [];
  for (const af of plan.additionalFeats ?? []) {
    for (const r of af.apply.resistances ?? []) if (!featResistances.includes(r)) featResistances.push(r);
  }
  const defenses = extractDefenses(effects);
  if (featResistances.length > 0) defenses.resistances = [...defenses.resistances, ...featResistances];

  // Feature di classe + sottoclasse (motore condiviso)
  const classFeatures = derived.classFeatures;
  const subclassFeatures = derived.subclassFeatures;

  // Slot incantesimi (max = disponibili), incl. Pact Magic del Warlock
  const spellSlots = derived.spellSlots;

  // Risorse (Ira, Ki, …): di classe (motore condiviso) + effetti con risorsa
  const resources: Record<string, CharacterResource> = { ...derived.resources };
  for (const eff of effects) {
    const hasResource = eff.type === 'resource_grant' || eff.type === 'action_grant';
    if (hasResource && typeof eff.key === 'string') {
      const rawMax =
        eff.max_uses === 'proficiency_bonus'
          ? proficiencyBonus
          : typeof eff.max_uses === 'number'
            ? eff.max_uses
            : typeof eff.value === 'number'
              ? eff.value
              : 1;
      resources[eff.key] = {
        label: eff.name,
        max: rawMax,
        current: rawMax,
        resetOn: typeof eff.reset_on === 'string' ? eff.reset_on : 'long_rest',
        description: eff.description,
      };
    }
  }
  // Risorse dai talenti (granted_resource, es. Punti Fortuna)
  for (const grant of plan.featApply?.resources ?? []) {
    if (resources[grant.key]) continue;
    const max = grant.max === 'proficiency_bonus' ? proficiencyBonus : grant.max;
    if (typeof max === 'number') {
      resources[grant.key] = {
        label: grant.label,
        max,
        current: max,
        resetOn: grant.resetOn,
        description: grant.description,
      };
    }
  }
  for (const af of plan.additionalFeats ?? []) {
    for (const grant of af.apply.resources ?? []) {
      if (resources[grant.key]) continue;
      const max = grant.max === 'proficiency_bonus' ? proficiencyBonus : grant.max;
      if (typeof max === 'number') {
        resources[grant.key] = {
          label: grant.label,
          max,
          current: max,
          resetOn: grant.resetOn,
          description: grant.description,
        };
      }
    }
  }

  // Incantesimi
  // Magie da fonti AUTOMATICHE: talento del background (Iniziato alla Magia) +
  // effetti razza/lineage (spell_grant) con req_level <= livello attuale.
  const autoSpells: string[] = [];
  const pushAutoSpell = (name?: string) => {
    if (name && !autoSpells.includes(name)) autoSpells.push(name);
  };
  for (const cantrip of plan.featApply?.spellcasting?.cantrips ?? []) pushAutoSpell(cantrip);
  for (const spell of plan.featApply?.spellcasting?.spells ?? []) pushAutoSpell(spell);
  for (const af of plan.additionalFeats ?? []) {
    for (const cantrip of af.apply.spellcasting?.cantrips ?? []) pushAutoSpell(cantrip);
    for (const spell of af.apply.spellcasting?.spells ?? []) pushAutoSpell(spell);
    // Incantesimi da scelte dei talenti (spell_selection, ritual_spells_gain)
    for (const spellName of af.apply.spells ?? []) pushAutoSpell(spellName);
  }
  for (const eff of effects) {
    if (eff.type !== 'spell_grant') continue;
    const granted = eff.spells;
    if (!Array.isArray(granted)) continue;
    for (const sp of granted as Array<{ name?: string; req_level?: number }>) {
      if (sp.name && (sp.req_level ?? 1) <= level) pushAutoSpell(sp.name);
    }
  }

  // Spellcasting: se ALMENO una classe lancia, usa la prima incantatrice
  // (abilità, progressione) — gli slot restano quelli combinati del multiclasse
  let spellcasting: CharacterSpellcasting | undefined;
  const casterSummary = summaries.find((s) => s.spellcasting);
  if (casterSummary) {
    spellcasting = {
      ability: casterSummary.spellcasting?.ability ?? 'intelligence',
      progression: casterSummary.spellProgression,
      slotDetails: spellSlots,
      // Incantesimi da fonti automatiche (talento background + razza/lineage)
      knownSpells: [...autoSpells],
      preparedSpells: [...autoSpells],
      favoriteSpells: [],
    };
  }

  // Equipaggiamento e denaro
  const equipment: EquipmentItem[] = (plan.startingEquipment ?? []).map((it) => ({
    itemId: it.itemId,
    name: it.name,
    quantity: it.quantity,
    equipped: false,
  }));
  const money: CharacterMoney = {
    mo:
      (getClassPreset(classDef.id)?.startingGold ?? 0) +
      (getEquipmentPreset(plan.backgroundResult?.data?.equipmentPresetId ?? -1)?.startingGold ?? 0),
    ma: 0,
    mr: 0,
  };

  // Scelte di creazione (per riproducibilità)
  const choices: CharacterChoices = {
    abilityBoosts: plan.boosts,
    asiBoosts: plan.asiBoosts ?? [],
    skillChoices: [
      ...(plan.classSkills ?? []),
      ...(plan.featApply?.skills ?? []),
      ...(plan.raceSkills ?? []),
    ],
    toolChoices:
      bgData.toolProficiency?.type === 'CHOICE' ||
      (plan.featApply?.toolProficiencies.length ?? 0) > 0
        ? [...(plan.bgToolProficiencies ?? []), ...(plan.featApply?.toolProficiencies ?? [])]
        : undefined,
    featChoice: plan.featApply?.spellcasting
      ? plan.featApply.spellcasting
      : bgData.feat.requiresChoice
        ? ''
        : undefined,
    generalFeatIds: plan.additionalFeats
      ?.filter((f) => f.category === 'general')
      .map((f) => f.featId),
    fightingStyleId: plan.additionalFeats?.find((f) => f.category === 'fighting_style')?.featId,
    epicBoonId: plan.additionalFeats?.find((f) => f.category === 'epic_boon')?.featId,
    originFeatChoice:
      plan.raceFeatId != null ? getFeat(plan.raceFeatId)?.name : undefined,
    featAsiPicks: plan.featAsiPicks,
    featChoices: plan.featChoices,
  };

  return {
    id: meta.id,
    name: meta.name,
    level,
    classes: summaries.map((sum) => ({
      className: sum.classDef.name as ClassName,
      level: sum.level,
      subclass: sum.subclass?.name,
      subclassId: sum.subclass?.id,
      hitDie: sum.classDef.hitDie,
    })),
    race: raceData.race.name,
    raceId: raceData.race.id,
    lineage: raceData.lineage?.name,
    lineageId: raceData.lineage?.id,
    background: bgData.background.name,
    backgroundId: bgData.background.id,
    abilities,
    hitPoints: {
      max: maxHp,
      current: maxHp,
      temporary: 0,
      hitDiceMax: level,
      hitDiceCurrent: level,
      hitDie: derived.hitDie,
    },
    proficiencyBonus,
    armorClass: 10 + dexMod,
    initiative: dexMod,
    speed: raceData.race.baseSpeed,
    size: raceData.race.sizeOptions[0] ?? 'Medium',
    senses: extractSenses(effects),
    defenses,
    proficiencies: {
      armor,
      weapons,
      tools,
      skills,
      savingThrows,
      languages: [],
      expertise: expertise.length > 0 ? expertise : undefined,
    },
    feats: [
      bgData.feat.name,
      ...(plan.additionalFeats ?? [])
        .filter(
          (f) =>
            f.category === 'general' ||
            f.category === 'fighting_style' ||
            f.category === 'origin',
        )
        .map((f) => f.name),
    ],
    epicBoons: (plan.additionalFeats ?? [])
      .filter((f) => f.category === 'epic_boon')
      .map((f) => f.name),
    featModifiers: [
      ...(plan.featApply?.modifiers ?? []),
      ...(plan.additionalFeats ?? []).flatMap((af) => af.apply.modifiers ?? []),
    ],
    classFeatures,
    subclassFeatures,
    effects,
    spellcasting,
    spellSlots,
    preparedSpells: [...autoSpells],
    favoriteSpells: [],
    resources: Object.keys(resources).length > 0 ? resources : undefined,
    equipment,
    money,
    choices,
    notes: '',
  };
}
