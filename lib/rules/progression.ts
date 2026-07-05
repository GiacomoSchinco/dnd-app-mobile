import progressionData from '../../assets/data/progression.json';

// ── Tipi ───────────────────────────────────────────────────────

export interface ProgressionFeatures {
  /** Feature sbloccate a uno specifico livello */
  featuresByLevel: Record<number, string[]>;
  /** Livelli in cui si ottiene una caratteristica di sottoclasse */
  subclassLevels: number[];
  /** Livelli ASI bonus (es. Fighter ha [6, 14]) */
  bonusAsiLevels?: number[];
}

export interface ProgressionResource {
  /** Etichetta della risorsa (es. "Furia") */
  label: string;
  /** Tipo di risorsa */
  type?: string;
  /** Valori per livello (chiave = livello, valore = quantità) */
  perLevel?: Record<string, number>;
  [key: string]: unknown;
}

export interface ClassProgression {
  label: string;
  subclassLabel: string;
  subclassLevels: number[];
  bonusAsiLevels?: number[];
  featuresByLevel: Record<string, string[]>;
  resources: Record<string, ProgressionResource>;
}

// ── Dati condivisi ─────────────────────────────────────────

export const SHARED_PROGRESSION = {
  proficiencyBonus: progressionData.shared.proficiency_bonus as Record<string, number>,
  asiLevels: progressionData.shared.asi_levels as number[],
  epicBoonLevel: progressionData.shared.epic_boon_level as number,
};

// ── Helper ─────────────────────────────────────────────────────

function getClassKey(className: string): string {
  return className.toLowerCase();
}

/** Ottiene la progressione di una classe */
export function getClassProgression(className: string): ClassProgression | undefined {
  const key = getClassKey(className);
  const cls = (progressionData.classes as Record<string, any>)[key];
  if (!cls) return undefined;

  return {
    label: cls.label,
    subclassLabel: cls.subclass_label,
    subclassLevels: cls.subclass_levels,
    bonusAsiLevels: cls.bonus_asi_levels,
    featuresByLevel: cls.features_by_level as Record<string, string[]>,
    resources: cls.resources ?? {},
  };
}

/** Ottiene le feature sbloccate a un dato livello per una classe */
export function getFeaturesAtLevel(className: string, level: number): string[] {
  const prog = getClassProgression(className);
  if (!prog) return [];
  return prog.featuresByLevel[String(level)] ?? [];
}

/** Ottiene tutte le feature di una classe dal livello 1 fino al livello specificato */
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

/** Ottiene i livelli in cui c'è un ASI (inclusi quelli bonus) */
export function getAsiLevels(className: string): number[] {
  const prog = getClassProgression(className);
  const baseAsi = SHARED_PROGRESSION.asiLevels;
  if (!prog?.bonusAsiLevels) return baseAsi;
  return [...baseAsi, ...prog.bonusAsiLevels].sort((a, b) => a - b);
}

/** Ottiene il bonus di competenza per un dato livello del personaggio */
export function getProficiencyBonus(characterLevel: number): number {
  return SHARED_PROGRESSION.proficiencyBonus[String(characterLevel)] ?? 2;
}

/** Verifica se un livello è un livello di Dono Epico */
export function isEpicBoonLevel(level: number): boolean {
  return level === SHARED_PROGRESSION.epicBoonLevel;
}

/** Ottiene le risorse di una classe (Rage, Ki, ecc.) */
export function getClassResources(className: string): Record<string, ProgressionResource> {
  const prog = getClassProgression(className);
  return prog?.resources ?? {};
}

/** Ottiene una risorsa specifica per una classe e livello (es. rage count al livello 3) */
export function getResourceValue(className: string, resourceKey: string, level: number): number | string | undefined {
  const resources = getClassResources(className);
  const resource = resources[resourceKey];
  if (!resource?.perLevel) return undefined;
  return resource.perLevel[String(level)];
}
