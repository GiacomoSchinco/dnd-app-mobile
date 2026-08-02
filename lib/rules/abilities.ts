import abilitiesData from '../data/abilities.json';
import type { Ability, AbilityAbbreviation, AbilityRaw } from '../../types';

/**
 * abilities.ts — Gestione delle caratteristiche (abilities.json).
 * Le 6 caratteristiche: FOR / DES / COS / INT / SAG / CAR.
 */

export interface AbilityDefinition {
  id: number;
  name: Ability;
  nameIt: string;
  abbreviation: AbilityAbbreviation;
  description: string;
}

const ABILITIES_LIST: Ability[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
];

function convertRawAbility(raw: AbilityRaw): AbilityDefinition {
  return {
    id: raw.id,
    name: raw.name,
    nameIt: raw.name_it,
    abbreviation: raw.abbreviation,
    description: raw.description,
  };
}

export const ABILITIES_DATA: AbilityDefinition[] = (abilitiesData as AbilityRaw[]).map(convertRawAbility);

// ── Helper Functions ──────────────────────────────────────────

/** Cerca un'abilità per nome (es. 'strength') */
export function getAbility(ability: Ability): AbilityDefinition | undefined {
  return ABILITIES_DATA.find((a) => a.name === ability);
}

/** Cerca un'abilità per abbreviazione italiana (es. 'FOR') */
export function getAbilityByAbbreviation(abbr: string): AbilityDefinition | undefined {
  const upper = abbr.toUpperCase();
  return ABILITIES_DATA.find((a) => a.abbreviation === upper);
}

/** Restituisce tutte le abilità */
export function getAllAbilities(): AbilityDefinition[] {
  return ABILITIES_LIST.map((a) => getAbility(a)).filter((a): a is AbilityDefinition => Boolean(a));
}

/** Nome italiano di un'abilità (es. 'strength' → 'Forza') */
export function getAbilityLabel(ability: Ability): string {
  return getAbility(ability)?.nameIt ?? ability;
}

/** Abbreviazione italiana di un'abilità (es. 'strength' → 'FOR') */
export function getAbilityAbbreviation(ability: Ability): string {
  return getAbility(ability)?.abbreviation ?? ability.toUpperCase().slice(0, 3);
}

/** Converte un'abbreviazione in Ability (es. 'FOR' → 'strength') */
export function parseAbilityFromAbbreviation(abbr: string): Ability | undefined {
  return getAbilityByAbbreviation(abbr)?.name;
}

/** Converte un nome italiano in Ability (es. 'Forza' → 'strength') */
export function parseAbilityFromItalian(name: string): Ability | undefined {
  const lower = name.toLowerCase();
  return ABILITIES_DATA.find((a) => a.nameIt.toLowerCase() === lower)?.name;
}

/** Calcola il modificatore da un punteggio abilità */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/** Formatta il modificatore con segno (es. +3, -1) */
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/** Punteggio base standard (array per metodo di acquisto punti) */
export const STANDARD_ARRAY: number[] = [15, 14, 13, 12, 10, 8];

/** Costo in punti per acquisto punti (D&D 2024) */
export const POINT_BUY_COST: Record<number, number> = {
  3: 0,
  4: 1,
  5: 2,
  6: 3,
  7: 4,
  8: 5,
  9: 6,
  10: 7,
  11: 8,
  12: 9,
  13: 10,
  14: 11,
  15: 12,
  16: 14,
  17: 16,
  18: 18,
};

/** Punteggio massimo acquistabile con punto acquisto */
export const POINT_BUY_MAX = 15;

/** Punteggio minimo acquistabile con punto acquisto */
export const POINT_BUY_MIN = 8;

/** Punti totali disponibili per acquisto punti */
export const POINT_BUY_TOTAL = 27;
