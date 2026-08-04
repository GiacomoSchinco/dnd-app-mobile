import { getClass, getClassById } from './classes';
import { getRace, getRaceById, getLineageById, getRaceEffects, getRaceEffectIds, hasLineages, type RaceDefinition } from './races';
import { getBackground, type BackgroundFeat } from './backgrounds';
import { getFeat } from './feats';
import { getSubclass } from './subclasses';
import { getSpellProgression, getLevelUpSpellChanges } from './spellcasting';
import { getClassProgression, getFeaturesAtLevel, getAsiLevels, getResourceValue, getProficiencyBonus, getClassResources } from './progression';
import { getStartingEquipment, getClassPreset } from './equipment-preset';
import { getAbilityModifier } from './abilities';
import type {
  Ability,
  AbilityAbbreviation,
  AbilityScores,
  EffectRaw,
  SkillName,
  ClassName,
  ArmorType,
  WeaponType,
  SpellSlot,
  Character,
  CharacterResource,
  CharacterSenses,
  CharacterDefenses,
  CharacterSpellcasting,
  CharacterChoices,
  CharacterMoney,
  EquipmentItem,
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
  classResult: ClassApplyResult;
  backgroundResult: BackgroundApplyResult;
  abilities: AbilityScores;
  featId?: number;
  feat?: ReturnType<typeof getFeat>;
  startingEquipment?: { name: string; itemId: number; quantity: number }[];
  /** Boost abilità applicati (per registrare la scelta in `choices.abilityBoosts`) */
  boosts?: AbilityBoost[];
  /** Metodo di generazione punteggi usato (standard | point_buy | manual) */
  abilityMethod?: AbilityAssignment['method'];
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

  const abilitiesResult = calculateFinalAbilities({
    ...params.abilities,
    allowedBoosts: params.abilities.allowedBoosts ?? backgroundResult.data?.abilityBoosts,
    distributionModes: params.abilities.distributionModes ?? backgroundResult.data?.distributionModes,
  });
  if (!abilitiesResult.success) return { success: false, error: abilitiesResult.error };

  const featId = backgroundResult.data?.featId;
  const feat = featId ? getFeat(featId) : undefined;
  const equipment = backgroundResult.data
    ? getStartingEquipment(backgroundResult.data.equipmentPresetId)
    : undefined;

  return {
    raceResult,
    classResult,
    backgroundResult,
    abilities: abilitiesResult.scores,
    featId,
    feat,
    startingEquipment: equipment,
    boosts: params.abilities.boosts,
    abilityMethod: params.abilities.method,
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
  const classData = plan.classResult.data!;
  const bgData = plan.backgroundResult.data!;
  const classDef = classData.classDef;

  const abilities = plan.abilities;
  const level = classData.level;
  const conMod = getAbilityModifier(abilities.constitution);
  const dexMod = getAbilityModifier(abilities.dexterity);
  const proficiencyBonus = getProficiencyBonus(level);

  // PF: 1° livello = dado vita MAX + CON; livelli successivi = media + CON
  const maxHp = classDef.hitDie + conMod + (level - 1) * Math.max(classDef.hitPoints.average + conMod, 1);

  // Competenze
  const armor = classDef.proficiencies.armor
    .map((a) => ARMOR_TYPE_MAP[a])
    .filter((a): a is ArmorType => a != null);
  const weapons = classDef.proficiencies.weapons
    .map((w) => WEAPON_TYPE_MAP[w])
    .filter((w): w is WeaponType => w != null);
  const tools = [...classDef.proficiencies.tools];
  if (bgData.toolProficiency?.toolId) tools.push(bgData.toolProficiency.toolId);
  const skills: SkillName[] = [...bgData.skills];
  const savingThrows: Ability[] = classDef.savingThrows;

  // Effetti risolti (razza + lineage)
  const effects = raceData.effects;

  // Slot incantesimi (max = disponibili)
  const spellSlots: Record<number, SpellSlot> = {};
  const progSlots = classData.spellProgression?.spellSlots;
  if (progSlots) {
    for (const [lvl, max] of Object.entries(progSlots)) {
      spellSlots[Number(lvl)] = { max, current: max };
    }
  }

  // Risorse (Ira, Ki, …) da progression.json + effetti con risorsa
  const resources: Record<string, CharacterResource> = {};
  for (const [key, res] of Object.entries(getClassResources(classDef.name))) {
    const max = getResourceValue(classDef.name, key, level);
    if (typeof max === 'number') {
      resources[key] = {
        label: res.label,
        max,
        current: max,
        resetOn: typeof res.recovery === 'string' ? res.recovery : 'long_rest',
      };
    }
  }
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
      };
    }
  }

  // Incantesimi
  let spellcasting: CharacterSpellcasting | undefined;
  if (classData.spellcasting) {
    spellcasting = {
      ability: classData.spellcasting.ability ?? 'intelligence',
      progression: classData.spellProgression,
      slotDetails: spellSlots,
      knownSpells: [],
      preparedSpells: [],
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
    mo: getClassPreset(classDef.id)?.startingGold ?? 0,
    ma: 0,
    mr: 0,
  };

  // Scelte di creazione (per riproducibilità)
  const choices: CharacterChoices = {
    abilityBoosts: plan.boosts,
    skillChoices: [],
    toolChoices: bgData.toolProficiency?.type === 'CHOICE' ? [] : undefined,
    featChoice: bgData.feat.requiresChoice ? '' : undefined,
  };

  return {
    id: meta.id,
    name: meta.name,
    level,
    classes: [{
      className: classDef.name as ClassName,
      level,
      subclass: classData.subclass?.name,
      subclassId: classData.subclass?.id,
      hitDie: classDef.hitDie,
    }],
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
      hitDie: `d${classDef.hitDie}`,
    },
    proficiencyBonus,
    armorClass: 10 + dexMod,
    initiative: dexMod,
    speed: raceData.race.baseSpeed,
    size: raceData.race.sizeOptions[0] ?? 'Medium',
    senses: extractSenses(effects),
    defenses: extractDefenses(effects),
    proficiencies: { armor, weapons, tools, skills, savingThrows, languages: [] },
    feats: [bgData.feat.name],
    epicBoons: [],
    effects,
    spellcasting,
    spellSlots,
    preparedSpells: [],
    favoriteSpells: [],
    resources: Object.keys(resources).length > 0 ? resources : undefined,
    equipment,
    money,
    choices,
    notes: '',
  };
}
