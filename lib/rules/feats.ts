import featsData from '../../assets/data/feats.json';
import type { FeatRawData, FeatDefinition, FeatPrerequisite } from '../../types';

// ── Conversione ────────────────────────────────────────────────

function convertRawFeat(raw: FeatRawData): FeatDefinition {
  return {
    id: raw.id,
    name: raw.name,
    nameEn: raw.name_en,
    category: raw.category as 'origin' | 'general' | 'epic_boon',
    levelRequirement: raw.level_requirement,
    description: raw.description,
    prerequisites: raw.prerequisites ?? [],
    hasChoices: raw.has_choices,
    asiConfig: raw.asi_config,
    choiceConfig: raw.choice_config,
    grantedResource: raw.granted_resource,
    grantedModifiers: raw.granted_modifiers ?? [],
  };
}

// ── Dati esportati ──────────────────────────────────────────

export const FEATS_DATA = (featsData as FeatRawData[]).map(convertRawFeat);

/** Cerca un talento per ID */
export function getFeat(id: number): FeatDefinition | undefined {
  return FEATS_DATA.find(f => f.id === id);
}

/** Cerca un talento per nome (case-insensitive) */
export function getFeatByName(name: string): FeatDefinition | undefined {
  return FEATS_DATA.find(f => f.name.toLowerCase() === name.toLowerCase());
}

/** Restituisce tutti i talenti */
export function getAllFeats(): FeatDefinition[] {
  return FEATS_DATA;
}

/** Filtra talenti per categoria */
export function getFeatsByCategory(category: 'origin' | 'general' | 'epic_boon'): FeatDefinition[] {
  return FEATS_DATA.filter(f => f.category === category);
}

/** Restituisce i talenti di origine (livello 1) */
export function getOriginFeats(): FeatDefinition[] {
  return getFeatsByCategory('origin');
}

/** Restituisce i talenti generali (ASI) */
export function getGeneralFeats(): FeatDefinition[] {
  return getFeatsByCategory('general');
}

/** Restituisce i doni epici (livello 20) */
export function getEpicBoons(): FeatDefinition[] {
  return getFeatsByCategory('epic_boon');
}

/** Verifica se un talento ha ASI config (quindi può aumentare caratteristiche) */
export function hasAsiBonus(featId: number): boolean {
  const feat = getFeat(featId);
  return feat?.asiConfig !== null && feat?.asiConfig !== undefined;
}

/** Verifica se un talento è disponibile a un dato livello (senza considerare prerequisiti) */
export function isFeatAvailableAtLevel(featId: number, level: number): boolean {
  const feat = getFeat(featId);
  if (!feat) return false;
  return level >= feat.levelRequirement;
}

/** Verifica se i prerequisiti di un talento sono soddisfatti */
export function checkFeatPrerequisites(
  featId: number,
  abilities: Record<string, number>,
  proficiencies: string[],
  characterLevel: number
): { valid: boolean; missing: string[] } {
  const feat = getFeat(featId);
  if (!feat) return { valid: false, missing: ['Feat not found'] };

  const missing: string[] = [];

  for (const prereq of feat.prerequisites) {
    if (prereq.type === 'ability_score' && prereq.field && prereq.value) {
      const score = abilities[prereq.field.toLowerCase()] ?? 0;
      if (score < (prereq.value as number)) {
        missing.push(`${prereq.field} ${prereq.value} (hai ${score})`);
      }
    }
    if (prereq.type === 'level' && prereq.value) {
      if (characterLevel < (prereq.value as number)) {
        missing.push(`Livello ${prereq.value}`);
      }
    }
    if (prereq.type === 'weapon_proficiency' && prereq.value) {
      if (!proficiencies.includes(prereq.value as string)) {
        missing.push(`Competenza: ${prereq.value}`);
      }
    }
  }

  return { valid: missing.length === 0, missing };
}
