import { getClass, getClassById } from './classes';
import { getRace, getRaceById, getLineageById, getRaceEffects, getRaceEffectIds, hasLineages, type RaceDefinition } from './races';
import { getBackground } from './backgrounds';
import { getFeat } from './feats';
import { getSubclass } from './subclasses';
import { getSpellProgression, getLevelUpSpellChanges } from './spellcasting';
import { getClassProgression, getFeaturesAtLevel, getAsiLevels, getResourceValue } from './progression';
import { getStartingEquipment } from './equipment-preset';
import type { Ability, AbilityScores, EffectRaw } from '../../types';

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

function getClassFeaturesFromProgression(className: string, level: number): { level: number; features: string[] }[] {
  const prog = getClassProgression(className);
  if (!prog) return [];

  const result: { level: number; features: string[] }[] = [];
  for (let lv = 1; lv <= level; lv++) {
    const feats = prog.featuresByLevel[String(lv)];
    if (feats && feats.length > 0 && feats[0] !== 'Aumento dei Punteggi di Caratteristica') {
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
    abilityBoosts: string[];
    skills: string[];
    toolProficiency?: { type: string; toolId?: string; category?: string };
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
      skills: bg.skills,
      toolProficiency: bg.toolProficiency,
      featId: bg.feat.featId,
      equipmentPresetId: bg.equipmentPresetId,
    },
  };
}

// ── Step 4: Assegna caratteristiche ────────────────────────────

export interface AbilityAssignment {
  method: 'standard' | 'point_buy' | 'manual';
  scores: AbilityScores;
  backgroundBoosts?: string[];
}

/** Calcola i punteggi finali applicando i boost del background */
export function calculateFinalAbilities(assignment: AbilityAssignment): AbilityScores {
  const scores = { ...assignment.scores };
  const boosts = assignment.backgroundBoosts ?? [];

  for (const boost of boosts) {
    const abilityMap: Record<string, Ability> = {
      'FOR': 'strength', 'DES': 'dexterity', 'COS': 'constitution',
      'INT': 'intelligence', 'SAG': 'wisdom', 'CAR': 'charisma',
      'STR': 'strength', 'DEX': 'dexterity', 'CON': 'constitution',
      'WIS': 'wisdom', 'CHA': 'charisma',
    };
    const ab = abilityMap[boost.toUpperCase()];
    if (ab && scores[ab] < 20) {
      scores[ab] += 1;
    }
  }

  return scores;
}

// ── Step 5: Level Up ──────────────────────────────────────────

export interface LevelUpRequest {
  currentLevel: number;
  newLevel: number;
  className: string;
  conModifier: number;
  currentHp: number;
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

  // HP guadagnati: media del dado vita + mod COS
  const hpGained = (request.newLevel - request.currentLevel) * (classDef.hitPoints.average + Math.max(request.conModifier, 0));

  // Nuove feature
  const newFeatures: { level: number; features: string[] }[] = [];
  for (let lv = request.currentLevel + 1; lv <= request.newLevel; lv++) {
    const feats = getFeaturesAtLevel(request.className, lv);
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
  classResult: ClassApplyResult;
  backgroundResult: BackgroundApplyResult;
  abilities: AbilityScores;
  featId?: number;
  feat?: ReturnType<typeof getFeat>;
  startingEquipment?: { name: string; itemId: number; quantity: number }[];
}

/** Costruisce un PG completo dal livello 1 */
export function buildCharacter(params: {
  race: RaceChoice;
  classChoice: ClassChoice;
  background: BackgroundChoice;
  abilities: AbilityAssignment;
}): CharacterBuildPlan | { success: false; error: string } {
  const raceResult = applyRace(params.race);
  if (!raceResult.success) return { success: false, error: raceResult.error! };

  const classResult = applyClass(params.classChoice);
  if (!classResult.success) return { success: false, error: classResult.error! };

  const backgroundResult = applyBackground(params.background);
  if (!backgroundResult.success) return { success: false, error: backgroundResult.error! };

  const abilities = calculateFinalAbilities({
    ...params.abilities,
    backgroundBoosts: backgroundResult.data?.abilityBoosts,
  });

  const featId = backgroundResult.data?.featId;
  const feat = featId ? getFeat(featId) : undefined;
  const equipment = backgroundResult.data
    ? getStartingEquipment(backgroundResult.data.equipmentPresetId)
    : undefined;

  return {
    raceResult,
    classResult,
    backgroundResult,
    abilities,
    featId,
    feat,
    startingEquipment: equipment,
  };
}
