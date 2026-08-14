import subclassesData from '../data/subclasses.json';
import type { ClassFeatureRaw, SubclassRaw } from '../../types';

/**
 * subclasses.ts — Gestione delle sottoclassi (subclasses.json).
 * 48 sottoclassi (4 per classe). `class_id` → classes.id.
 */

export interface SubclassDefinition {
  id: number;
  classId: number;
  name: string;
  nameEn: string;
  description: string;
  features: ClassFeatureRaw[];
}

function convertRawSubclass(raw: SubclassRaw): SubclassDefinition {
  return {
    id: raw.id,
    classId: raw.class_id,
    name: raw.name,
    nameEn: raw.name_en,
    description: raw.description,
    features: raw.features,
  };
}

export const SUBCLASSES_DATA: SubclassDefinition[] = (subclassesData as SubclassRaw[]).map(convertRawSubclass);

/** Cerca una sottoclasse per ID */
export function getSubclass(id: number): SubclassDefinition | undefined {
  return SUBCLASSES_DATA.find((s) => s.id === id);
}

/** Cerca una sottoclasse per nome (case-insensitive) */
export function getSubclassByName(name: string): SubclassDefinition | undefined {
  return SUBCLASSES_DATA.find((s) => s.name.toLowerCase() === name.toLowerCase());
}

/** Restituisce tutte le sottoclassi di una classe (per class_id) */
export function getSubclassesByClassId(classId: number): SubclassDefinition[] {
  return SUBCLASSES_DATA.filter((s) => s.classId === classId);
}

/** Restituisce tutte le sottoclassi */
export function getAllSubclasses(): SubclassDefinition[] {
  return SUBCLASSES_DATA;
}

/** Feature di una sottoclasse a un dato livello */
export function getSubclassFeaturesAtLevel(subclassId: number, level: number): SubclassDefinition['features'] {
  const sub = getSubclass(subclassId);
  if (!sub) return [];
  return sub.features.filter((f) => f.level === level);
}

/** Tutte le feature di una sottoclasse fino a un dato livello */
export function getSubclassFeaturesUpToLevel(subclassId: number, level: number): SubclassDefinition['features'] {
  const sub = getSubclass(subclassId);
  if (!sub) return [];
  return sub.features.filter((f) => f.level <= level);
}
