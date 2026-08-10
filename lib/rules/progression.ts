import progressionData from '../data/progression.json';
import type { ProgressionClassRaw, ProgressionDataRaw, ProgressionResourceRaw } from '../../types';

/**
 * progression.ts — Gestione della progressione delle classi (progression.json).
 * Feature per livello, livelli sottoclasse/ASI, risorse per livello e dati
 * condivisi (bonus di competenza, ASI, dono epico).
 */

export interface ProgressionResource extends ProgressionResourceRaw {}

export interface ClassProgression {
  label: string;
  subclassLabel: string;
  subclassLevels: number[];
  bonusAsiLevels?: number[];
  featuresByLevel: Record<string, string[]>;
  resources: Record<string, ProgressionResource>;
}

const DATA = progressionData as ProgressionDataRaw;

// ── Dati condivisi ─────────────────────────────────────────

export const SHARED_PROGRESSION = {
  proficiencyBonus: DATA.shared.proficiency_bonus,
  asiLevels: DATA.shared.asi_levels,
  epicBoonLevel: DATA.shared.epic_boon_level,
};

// ── Helper ─────────────────────────────────────────────────────

function getClassKey(className: string): string {
  return className.toLowerCase();
}

/** Ottiene la progressione di una classe */
export function getClassProgression(className: string): ClassProgression | undefined {
  const key = getClassKey(className);
  const cls = DATA.classes[key];
  if (!cls) return undefined;

  return {
    label: cls.label,
    subclassLabel: cls.subclass_label,
    subclassLevels: cls.subclass_levels,
    bonusAsiLevels: (cls as ProgressionClassRaw & { bonus_asi_levels?: number[] }).bonus_asi_levels,
    featuresByLevel: cls.features_by_level,
    resources: cls.resources ?? {},
  };
}

/** Feature sbloccate a un dato livello per una classe */
export function getFeaturesAtLevel(className: string, level: number): string[] {
  const prog = getClassProgression(className);
  if (!prog) return [];
  return prog.featuresByLevel[String(level)] ?? [];
}

/** Tutte le feature di una classe dal livello 1 fino al livello specificato */
export function getAllFeaturesUpToLevel(className: string, level: number): { level: number; features: string[] }[] {
  const prog = getClassProgression(className);
  if (!prog) return [];

  const result: { level: number; features: string[] }[] = [];
  for (let lv = 1; lv <= level; lv++) {
    const features = prog.featuresByLevel[String(lv)];
    if (features && features.length > 0) {
      result.push({ level: lv, features });
    }
  }
  return result;
}

/** Verifica se una classe sblocca la sottoclasse a un dato livello */
export function isSubclassLevel(className: string, level: number): boolean {
  const prog = getClassProgression(className);
  if (!prog) return false;
  return prog.subclassLevels.includes(level);
}

/** Livelli in cui c'è un ASI (inclusi quelli bonus) */
export function getAsiLevels(className: string): number[] {
  const prog = getClassProgression(className);
  const baseAsi = SHARED_PROGRESSION.asiLevels;
  if (!prog?.bonusAsiLevels) return baseAsi;
  return [...baseAsi, ...prog.bonusAsiLevels].sort((a, b) => a - b);
}

/** Bonus di competenza per un dato livello del personaggio */
export function getProficiencyBonus(characterLevel: number): number {
  return SHARED_PROGRESSION.proficiencyBonus[String(characterLevel)] ?? 2;
}

/** Verifica se un livello è un livello di Dono Epico */
export function isEpicBoonLevel(level: number): boolean {
  return level === SHARED_PROGRESSION.epicBoonLevel;
}

/** Risorse di una classe (Rage, Ki, ecc.) */
export function getClassResources(className: string): Record<string, ProgressionResource> {
  const prog = getClassProgression(className);
  return prog?.resources ?? {};
}

/** Valore di una risorsa per una classe e livello (es. rage count al livello 3) */
export function getResourceValue(className: string, resourceKey: string, level: number): number | string | undefined {
  const resources = getClassResources(className);
  const resource = resources[resourceKey];
  if (!resource?.per_level) return undefined;
  return resource.per_level[String(level)];
}

/**
 * Massimo di usi di una risorsa per classe e livello.
 * Gestisce anche il formato `uses_per_rest` (es. Ispirazione Bardica =
 * modificatore di Carisma) che `getResourceValue` non copre, perché
 * `bardic_inspiration` in progression.json NON ha `per_level`.
 */
export function getResourceMax(
  className: string,
  resourceKey: string,
  level: number,
  getModifier?: (ability: string) => number
): number | string | undefined {
  const resources = getClassResources(className);
  const resource = resources[resourceKey];
  if (!resource) return undefined;
  if (resource.per_level) return resource.per_level[String(level)];
  if (resource.uses_per_rest === 'charisma_modifier') {
    return getModifier ? getModifier('charisma') : undefined;
  }
  return undefined;
}

/** Dado associato a una risorsa per un livello (es. Ispirazione Bardica → 'd6' al lv 1) */
export function getResourceDie(className: string, resourceKey: string, level: number): string | undefined {
  const resource = getClassResources(className)[resourceKey];
  if (!resource) return undefined;
  const die = resource.die_size;
  if (typeof die === 'string') return die;
  if (die && typeof die === 'object') {
    const d = (die as Record<string, string>)[String(level)];
    if (typeof d === 'string') return d;
  }
  return undefined;
}
