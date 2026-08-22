import abilitiesData from '../data/abilities.json';
import type { Ability, AbilityAbbreviation, AbilityModifier, AbilityModifierTarget, AbilityRaw, AbilityScores } from '../../types';

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

/** Abilità coinvolte da un target di modificatore ([] = tutte, per 'all') */
function getModifierTargetAbilities(target: AbilityModifierTarget): Ability[] {
  if (target === 'all') return [];
  return Array.isArray(target) ? target : [target];
}

/**
 * Punteggio effettivo di un'abilità = punteggio base + somma dei modificatori
 * manuali (correzioni utente). Valgono i modificatori con target 'all' o che
 * includono l'abilità.
 */
export function getEffectiveAbilityScore(
  abilities: AbilityScores,
  ability: Ability,
  modifiers: AbilityModifier[] = [],
): number {
  const base = abilities[ability] ?? 10;
  return (
    base +
    modifiers
      .filter((m) => {
        const targets = getModifierTargetAbilities(m.ability);
        return targets.length === 0 || targets.includes(ability);
      })
      .reduce((sum, m) => sum + m.value, 0)
  );
}

/** Punteggi effettivi per tutte le 6 abilità (base + modificatori manuali) */
export function getEffectiveAbilityScores(
  abilities: AbilityScores,
  modifiers: AbilityModifier[] = [],
): AbilityScores {
  return Object.fromEntries(
    ABILITIES_LIST.map((a) => [a, getEffectiveAbilityScore(abilities, a, modifiers)]),
  ) as AbilityScores;
}

/** Somma dei valori dei modificatori che toccano l'abilità data */
export function getAbilityModifierTotal(modifiers: AbilityModifier[], ability: Ability): number {
  return modifiers
    .filter((m) => {
      const targets = getModifierTargetAbilities(m.ability);
      return targets.length === 0 || targets.includes(ability);
    })
    .reduce((sum, m) => sum + m.value, 0);
}

/** Etichetta del destinatario di un modificatore ('all' → 'Tutte', array → sigle) */
export function getModifierTargetLabel(target: AbilityModifierTarget): string {
  const targets = getModifierTargetAbilities(target);
  return targets.length === 0 ? 'Tutte le abilità' : targets.map((a) => getAbilityAbbreviation(a)).join(' · ');
}

/** Punteggio base standard (array per metodo di acquisto punti) */
export const STANDARD_ARRAY: number[] = [15, 14, 13, 12, 10, 8];

/** Ordine canonico delle 6 caratteristiche (FOR → CAR) */
const CANONICAL_ABILITY_ORDER: Ability[] = [
  'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
];

/**
 * Suggerisce una distribuzione automatica dello standard array basata sulle
 * abilità principali della classe: il valore più alto va sulla prima abilità
 * principale, poi la seconda (se c'è), poi Costituzione, quindi le restanti
 * in ordine canonico. Restituisce l'assegnazione COMPLETA delle 6 caratteristiche.
 * Vale per entrambi i metodi: lo standard array costa esattamente 27 punti.
 */
export function suggestScoreAssignment(primaryAbilities: Ability[] = []): Partial<Record<Ability, number>> {
  const order: Ability[] = [];
  const push = (a: Ability) => {
    if (a && !order.includes(a)) order.push(a);
  };
  primaryAbilities.forEach(push);
  push('constitution');
  CANONICAL_ABILITY_ORDER.forEach(push);
  const values = [...STANDARD_ARRAY].sort((a, b) => b - a);
  const result: Partial<Record<Ability, number>> = {};
  order.slice(0, 6).forEach((a, i) => {
    result[a] = values[i];
  });
  return result;
}

/** Costo in punti per acquisto punti (D&D 2024): lo standard array costa esattamente 27 */
export const POINT_BUY_COST: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

/** Punteggio massimo acquistabile con punto acquisto */
export const POINT_BUY_MAX = 15;

/** Punteggio minimo acquistabile con punto acquisto */
export const POINT_BUY_MIN = 8;

/** Punti totali disponibili per acquisto punti */
export const POINT_BUY_TOTAL = 27;

/** Valori acquistabili con il punto acquisto (dal più alto al più basso: 15…8) */
export function getPointBuyValues(): number[] {
  const values: number[] = [];
  for (let v = POINT_BUY_MIN; v <= POINT_BUY_MAX; v++) values.push(v);
  return values.reverse();
}
