import classesData from '../data/classes.json';
import type { Ability, ClassRaw, ClassSpellcastingRaw, SpellCastingType } from '../../types';

/**
 * classes.ts — Gestione delle classi (classes.json).
 * 12 classi. `name` è in inglese (Barbarian, Bard, ...);
 * le etichette italiane sono disponibili via `labelIt` / progression.json.
 */

export interface ClassFeatureDefinition {
  name: string;
  level: number;
  description: string;
}

export interface ClassDefinition {
  id: number;
  /** Chiave inglese minuscola (es. 'barbarian') */
  name: string;
  /** Nome inglese dal JSON (es. 'Barbarian') */
  label: string;
  /** Etichetta italiana (es. 'Barbaro') */
  labelIt: string;
  progressionKey: string;
  description: string;
  hitDie: 6 | 8 | 10 | 12;
  primaryAbilities: Ability[];
  savingThrows: Ability[];
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    skills: { count: number; options: string[] };
  };
  isSpellcaster: boolean;
  /** Dati grezzi di spellcasting dal JSON (snake_case) */
  spellcasting?: ClassSpellcastingRaw;
  spellcastingType?: SpellCastingType;
  spellAbility?: Ability;
  features: ClassFeatureDefinition[];
  featuresByLevel: Record<number, ClassFeatureDefinition[]>;
  hitPoints: { average: number; description: string };
  /** Solo Fighter, Paladin, Ranger → array di feats.id (categoria fighting_style) */
  fightingStyles?: number[];
}

const CLASS_LABEL_ITALIAN: Record<string, string> = {
  barbarian: 'Barbaro',
  bard: 'Bardo',
  cleric: 'Chierico',
  druid: 'Druido',
  fighter: 'Guerriero',
  monk: 'Monaco',
  paladin: 'Paladino',
  ranger: 'Ranger',
  rogue: 'Ladro',
  sorcerer: 'Stregone',
  warlock: 'Warlock',
  wizard: 'Mago',
};

const CASTER_TYPE_MAP: Record<string, SpellCastingType> = {
  bard: 'full',
  cleric: 'full',
  druid: 'full',
  sorcerer: 'full',
  wizard: 'full',
  paladin: 'half',
  ranger: 'half',
  warlock: 'pact',
};

function convertRawClass(raw: ClassRaw): ClassDefinition {
  const name = raw.name.toLowerCase();
  const isSpellcaster = raw.spellcasting != null;
  const featuresByLevel: Record<number, ClassFeatureDefinition[]> = {};
  for (const f of raw.features) {
    const def: ClassFeatureDefinition = { name: f.name, level: f.level, description: f.description };
    (featuresByLevel[f.level] ??= []).push(def);
  }

  return {
    id: raw.id,
    name,
    label: raw.name,
    labelIt: CLASS_LABEL_ITALIAN[name] ?? raw.name,
    progressionKey: raw.progression_key,
    description: raw.description,
    hitDie: parseInt(raw.hit_die.replace('d', ''), 10) as 6 | 8 | 10 | 12,
    primaryAbilities: raw.primary_ability,
    savingThrows: raw.saving_throws,
    proficiencies: raw.proficiencies,
    isSpellcaster,
    spellcasting: raw.spellcasting ?? undefined,
    spellcastingType: isSpellcaster ? CASTER_TYPE_MAP[name] : undefined,
    spellAbility: raw.spellcasting?.ability,
    features: raw.features.map((f) => ({ name: f.name, level: f.level, description: f.description })),
    featuresByLevel,
    hitPoints: raw.hit_points,
    fightingStyles: raw.fighting_styles,
  };
}

export const CLASSES_DATA: ClassDefinition[] = (classesData as ClassRaw[]).map(convertRawClass);

// ── Helper Functions ──────────────────────────────────────────

/** Cerca una classe per ID (classes.id) */
export function getClassById(id: number): ClassDefinition | undefined {
  return CLASSES_DATA.find((c) => c.id === id);
}

/**
 * Cerca una classe per nome.
 * Accetta chiave inglese ('barbarian'), nome inglese ('Barbarian')
 * o etichetta italiana ('Barbaro'), case-insensitive.
 */
export function getClass(name: string): ClassDefinition | undefined {
  const lower = name.toLowerCase();
  return CLASSES_DATA.find(
    (c) => c.name === lower || c.label.toLowerCase() === lower || c.labelIt.toLowerCase() === lower
  );
}

/** Cerca una classe per progression_key (es. 'barbarian') */
export function getClassByProgressionKey(key: string): ClassDefinition | undefined {
  return CLASSES_DATA.find((c) => c.progressionKey === key);
}

/** Restituisce tutte le classi */
export function getAllClasses(): ClassDefinition[] {
  return CLASSES_DATA;
}

/** Restituisce le classi con capacità di incantesimo */
export function getSpellcastingClasses(): ClassDefinition[] {
  return CLASSES_DATA.filter((c) => c.isSpellcaster);
}

/** Filtra classi per tipo di incantatore */
export function getClassesBySpellcastingType(type: SpellCastingType): ClassDefinition[] {
  return CLASSES_DATA.filter((c) => c.spellcastingType === type);
}

/** Nome italiano di una classe (es. 'barbarian' → 'Barbaro') */
export function getClassNameItalian(name: string): string {
  return CLASS_LABEL_ITALIAN[name.toLowerCase()] ?? name;
}

/** Verifica se una classe è in grado di lanciare incantesimi */
export function isSpellcaster(className: string): boolean {
  return getClass(className)?.isSpellcaster ?? false;
}

/** Restituisce il dado vita di una classe (es. 'd12') */
export function getHitDie(className: string): string | null {
  const cls = getClass(className);
  return cls ? `d${cls.hitDie}` : null;
}

/** Calcola i PF medi al 1° livello */
export function getAverageHpAtFirstLevel(className: string, conModifier: number): number | null {
  const cls = getClass(className);
  if (!cls) return null;
  return cls.hitPoints.average + conModifier;
}

/** Feature di una classe a un dato livello */
export function getFeaturesAtLevel(className: string, level: number): ClassFeatureDefinition[] {
  return getClass(className)?.featuresByLevel[level] ?? [];
}

/** Tutte le feature di una classe (fino a un livello, opzionale) */
export function getClassFeatures(className: string, upToLevel?: number): ClassFeatureDefinition[] {
  const cls = getClass(className);
  if (!cls) return [];
  const levels = Object.keys(cls.featuresByLevel)
    .map(Number)
    .filter((l) => upToLevel == null || l <= upToLevel);
  return levels.flatMap((l) => cls.featuresByLevel[l] ?? []);
}
