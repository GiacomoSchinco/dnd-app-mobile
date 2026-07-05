/**
 * character-builder.ts — Orchestratore per creazione e livellamento PG.
 * Combina tutti i moduli rules/ in un flusso sequenziale.
 */

import type {
  Character, CharacterClass, AbilityScores,
  ClassName, Ability, ClassFeature,
} from '../../types';
import { getClass } from './classes';
import { getRace, hasSubraces } from './races';
import { getAllSkills } from './skills';
import { getBackground, getBackgroundFeatId, getBackgroundAbilityBoosts } from './backgrounds';
import { getFeat, checkFeatPrerequisites, getOriginFeats } from './feats';
import { getAllItems } from './items';
import { getSubclass, getSubclassesByClassId } from './subclasses';
import { getSpellProgression, getLevelUpSpellChanges } from './spellcasting';
import {
  getClassProgression, getFeaturesAtLevel, getAllFeaturesUpToLevel,
  isSubclassLevel, getAsiLevels, getProficiencyBonus, getResourceValue,
} from './progression';

// ── Step 1: Scegli razza ───────────────────────────────────────

export interface RaceChoice {
  raceName: string;
  subrace?: string;
}

/** Applica i dati razziali a un personaggio in costruzione */
export function applyRace(choice: RaceChoice): RaceChoiceResult {
  const race = getRace(choice.raceName as any);
  if (!race) return { success: false, error: `Razza "${choice.raceName}" non trovata` };

  if (hasSubraces(choice.raceName as any) && !choice.subrace) {
    return { success: false, error: 'Sottorazza richiesta ma non specificata' };
  }

  return {
    success: true,
    data: {
      race: choice.raceName,
      subrace: choice.subrace,
      speed: race.speed,
      size: race.size,
      traits: race.traits,
      languages: race.languages,
      darkvision: race.darkvision,
      resistances: race.resistances,
      proficiencies: race.proficiencies,
      hpPerLevel: race.hpPerLevel,
      extraSkills: race.extraSkills,
      extraLanguage: race.extraLanguage,
    },
  };
}

export interface RaceChoiceResult {
  success: boolean;
  error?: string;
  data?: {
    race: string;
    subrace?: string;
    speed: number;
    size: string;
    traits: { name: string; description: string }[];
    languages: string[];
    darkvision: number | null;
    resistances: string[];
    proficiencies: string[];
    hpPerLevel: number;
    extraSkills: number;
    extraLanguage: number;
  };
}

// ── Step 2: Scegli classe ─────────────────────────────────────

export interface ClassChoice {
  className: ClassName;
  subclassId?: number;
  level: number;
}

/** Applica i dati di classe a un personaggio */
export function applyClass(choice: ClassChoice): ClassApplyResult {
  const classDef = getClass(choice.className);
  if (!classDef) return { success: false, error: `Classe "${choice.className}" non trovata` };

  const progression = getClassProgression(choice.className);

  const features = getClassFeaturesFromProgression(choice.className, choice.level);

  return {
    success: true,
    data: {
      classDef,
      level: choice.level,
      features,
      hitDie: classDef.hitDie,
      primaryAbility: classDef.primaryAbility,
      spellcasting: classDef.isSpellcaster ? {
        type: classDef.spellcastingType,
        ability: classDef.spellAbility,
      } : undefined,
      spellProgression: classDef.isSpellcaster
        ? getSpellProgression(choice.className, choice.level)
        : undefined,
      asiLevels: progression ? getAsiLevels(choice.className) : [],
      subclassLevels: progression?.subclassLevels ?? [],
      subclassLabel: progression?.subclassLabel,
      resources: progression?.resources ?? {},
    },
  };
}

export interface ClassApplyResult {
  success: boolean;
  error?: string;
  data?: {
    classDef: ReturnType<typeof getClass>;
    level: number;
    features: { level: number; features: string[] }[];
    hitDie: number;
    primaryAbility: string;
    spellcasting?: { type?: string; ability?: string };
    spellProgression?: ReturnType<typeof getSpellProgression>;
    asiLevels: number[];
    subclassLevels: number[];
    subclassLabel?: string;
    resources: Record<string, any>;
  };
}

function getClassFeaturesFromProgression(className: ClassName, level: number): { level: number; features: string[] }[] {
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

/** Applica un background al personaggio */
export function applyBackground(choice: BackgroundChoice): BackgroundApplyResult {
  const bg = getBackground(choice.backgroundId);
  if (!bg) return { success: false, error: `Background ID ${choice.backgroundId} non trovato` };

  const featId = getBackgroundFeatId(choice.backgroundId);

  return {
    success: true,
    data: {
      background: bg,
      abilityBoosts: bg.abilityScoreBoosts,
      skills: bg.skills,
      toolProficiencies: bg.toolProficiencies,
      featId,
      equipmentPresetId: bg.equipmentPresetId,
    },
  };
}

export interface BackgroundApplyResult {
  success: boolean;
  error?: string;
  data?: {
    background: ReturnType<typeof getBackground>;
    abilityBoosts: string[];
    skills: string[];
    toolProficiencies: string[];
    featId?: number;
    equipmentPresetId: number;
  };
}

// ── Step 4: Assegna caratteristiche ────────────────────────────

export interface AbilityAssignment {
  method: 'standard' | 'point_buy' | 'manual';
  scores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
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
  className: ClassName;
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
  const asiLevel = asiLevels.some(l => l > request.currentLevel && l <= request.newLevel);

  // Sottoclasse?
  const subclassLevel = progression.subclassLevels.some(l => l > request.currentLevel && l <= request.newLevel);

  // Cambiamenti incantesimi
  let spellChanges: ReturnType<typeof getLevelUpSpellChanges> | undefined;
  if (classDef.isSpellcaster) {
    spellChanges = getLevelUpSpellChanges(request.className, request.currentLevel, request.newLevel);
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

export function getStartingEquipment(equipmentPresetId: number): { name: string; itemId: number; quantity: number }[] {
  // L'equipment_preset.json è referenziato via ID
  // Questa funzione fa da ponte verso il lookup
  const allItems = getAllItems();
  const preset = require('../../assets/data/equipment_preset.json')
    .find((e: any) => e.id === equipmentPresetId);

  if (!preset) return [];
  return preset.items.map((item: any) => ({
    name: item.name,
    itemId: item.item_id,
    quantity: item.quantity,
  }));
}

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
