import subclassesData from '../../assets/data/subclasses.json';
import type { SubclassRawData, SubclassDefinition, SubclassFeatureData } from '../../types';

// ── Conversione ────────────────────────────────────────────────

function convertRawSubclass(raw: SubclassRawData): SubclassDefinition {
  return {
    id: raw.id,
    classId: raw.class_id,
    name: raw.name,
    description: raw.description,
    features: raw.features.map((f: SubclassFeatureData) => ({
      id: f.id,
      name: f.name,
      level: f.level,
      description: f.description,
    })),
  };
}

// ── Dati esportati ──────────────────────────────────────────

export const SUBCLASSES_DATA = (subclassesData as SubclassRawData[]).map(convertRawSubclass);

/** Cerca una sottoclasse per ID */
export function getSubclass(id: number): SubclassDefinition | undefined {
  return SUBCLASSES_DATA.find(s => s.id === id);
}

/** Cerca una sottoclasse per nome (case-insensitive) */
export function getSubclassByName(name: string): SubclassDefinition | undefined {
  return SUBCLASSES_DATA.find(s => s.name.toLowerCase() === name.toLowerCase());
}

/** Restituisce tutte le sottoclassi di una classe (per class_id) */
export function getSubclassesByClassId(classId: number): SubclassDefinition[] {
  return SUBCLASSES_DATA.filter(s => s.classId === classId);
}

/** Restituisce tutte le sottoclassi */
export function getAllSubclasses(): SubclassDefinition[] {
  return SUBCLASSES_DATA;
}

/** Restituisce le feature di una sottoclasse per un dato livello */
export function getSubclassFeaturesAtLevel(subclassId: number, level: number): SubclassDefinition['features'] {
  const sub = getSubclass(subclassId);
  if (!sub) return [];
  return sub.features.filter(f => f.level === level);
}

/** Restituisce tutte le feature di una sottoclasse fino a un dato livello */
export function getSubclassFeaturesUpToLevel(subclassId: number, level: number): SubclassDefinition['features'] {
  const sub = getSubclass(subclassId);
  if (!sub) return [];
  return sub.features.filter(f => f.level <= level);
}
