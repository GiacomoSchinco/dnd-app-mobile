import featsData from '../data/feats.json';
import { getAbilityByAbbreviation, parseAbilityFromAbbreviation } from './abilities';
import type { Ability, FeatCategory, FeatRaw } from '../../types';

/**
 * feats.ts — Gestione dei talenti (feats.json).
 * 86 talenti. Categorie: origin, general, epic_boon, fighting_style.
 */

export type FeatDefinition = FeatRaw;

export const FEATS_DATA: FeatRaw[] = featsData as FeatRaw[];

/** Cerca un talento per ID */
export function getFeat(id: number): FeatRaw | undefined {
  return FEATS_DATA.find((f) => f.id === id);
}

/** Cerca un talento per nome (case-insensitive) */
export function getFeatByName(name: string): FeatRaw | undefined {
  return FEATS_DATA.find((f) => f.name.toLowerCase() === name.toLowerCase());
}

/** Restituisce tutti i talenti */
export function getAllFeats(): FeatRaw[] {
  return FEATS_DATA;
}

/** Filtra talenti per categoria */
export function getFeatsByCategory(category: FeatCategory): FeatRaw[] {
  return FEATS_DATA.filter((f) => f.category === category);
}

/** Talenti di origine (livello 1) */
export function getOriginFeats(): FeatRaw[] {
  return getFeatsByCategory('origin');
}

/** Talenti generali (ASI) */
export function getGeneralFeats(): FeatRaw[] {
  return getFeatsByCategory('general');
}

/** Doni epici (livello 19/20) */
export function getEpicBoons(): FeatRaw[] {
  return getFeatsByCategory('epic_boon');
}

/** Stili di combattimento (Fighter / Paladin / Ranger) */
export function getFightingStyles(): FeatRaw[] {
  return getFeatsByCategory('fighting_style');
}

/** Verifica se un talento ha ASI config (quindi può aumentare caratteristiche) */
export function hasAsiBonus(featId: number): boolean {
  const feat = getFeat(featId);
  return feat?.asi_config != null;
}

/** Verifica se un talento è disponibile a un dato livello (senza considerare prerequisiti) */
export function isFeatAvailableAtLevel(featId: number, level: number): boolean {
  const feat = getFeat(featId);
  if (!feat) return false;
  return level >= feat.level_requirement;
}

/** Verifica se i prerequisiti di un talento sono soddisfatti */
export function checkFeatPrerequisites(
  featId: number,
  abilities: Partial<Record<string, number>>,
  proficiencies: string[],
  characterLevel: number
): { valid: boolean; missing: string[] } {
  const feat = getFeat(featId);
  if (!feat) return { valid: false, missing: ['Feat not found'] };

  const missing: string[] = [];

  for (const prereq of feat.prerequisites) {
    if (prereq.type === 'ability_score' && prereq.field && typeof prereq.value === 'number') {
      // `field` può essere un'abbreviazione italiana (CAR, FOR, ...) o un nome inglese
      const ability = getAbilityByAbbreviation(prereq.field)?.name ?? prereq.field.toLowerCase();
      const score = abilities[ability] ?? abilities[prereq.field.toLowerCase()] ?? 0;
      if (score < prereq.value) {
        missing.push(`${prereq.field} ${prereq.value} (hai ${score})`);
      }
    }
    if (prereq.type === 'level' && typeof prereq.value === 'number') {
      if (characterLevel < prereq.value) {
        missing.push(`Livello ${prereq.value}`);
      }
    }
    if (prereq.type === 'weapon_proficiency' && typeof prereq.value === 'string') {
      if (!proficiencies.includes(prereq.value)) {
        missing.push(`Competenza: ${prereq.value}`);
      }
    }
  }

  return { valid: missing.length === 0, missing };
}

/** Contesto per verificare se un talento è selezionabile nello step dedicato */
export interface FeatAvailabilityContext {
  /** Livello del personaggio */
  level: number;
  /** Punteggi FINALI (per i prerequisiti ability_score) */
  scores?: Partial<Record<string, number>>;
  /** Se il personaggio lancia incantesimi (prerequisito feature: spellcasting) */
  isSpellcaster?: boolean;
}

/**
 * Verifica se un talento è selezionabile: livello + prerequisiti valutabili
 * (ability_score/level/weapon_proficiency/feature-spellcasting; le altre feature
 * sono considerate soddisfatte — non valutabili qui).
 */
export function isFeatAvailable(feat: FeatRaw, ctx: FeatAvailabilityContext): boolean {
  if (!isFeatAvailableAtLevel(feat.id, ctx.level)) return false;
  for (const pre of feat.prerequisites) {
    if (pre.type === 'feature' && pre.value === 'spellcasting' && !ctx.isSpellcaster) {
      return false;
    }
  }
  if (ctx.scores) {
    const res = checkFeatPrerequisites(feat.id, ctx.scores, [], ctx.level);
    if (!res.valid) return false;
  }
  return true;
}

/**
 * Opzioni caratteristica consentite per gli ASI di un talento (asi_config.allowed_scores).
 * NB: nel JSON sono abbreviazioni italiane (FOR/DES/...) → convertite in slug Ability.
 */
export function getFeatAsiOptions(feat: FeatRaw): Ability[] {
  const cfg = feat.asi_config as { allowed_scores?: string[] } | null | undefined;
  if (!cfg || !Array.isArray(cfg.allowed_scores)) return [];
  return cfg.allowed_scores
    .map((a) => parseAbilityFromAbbreviation(a))
    .filter((a): a is Ability => a != null);
}

/** Cap massimo per gli ASI concessi da un talento (asi_config.max_cap, default 20) */
export function getFeatAsiCap(feat: FeatRaw): number {
  const cfg = feat.asi_config as { max_cap?: number } | null | undefined;
  return typeof cfg?.max_cap === 'number' ? cfg.max_cap : 20;
}

/** Numero di scelte caratteristica concesse dall'ASI di un talento (default 1) */
export function getFeatAsiCount(feat: FeatRaw | null | undefined): number {
  const cfg = feat?.asi_config as { choices_count?: number } | null | undefined;
  return cfg?.choices_count ?? 1;
}
