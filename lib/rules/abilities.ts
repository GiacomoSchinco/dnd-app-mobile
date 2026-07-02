import abilitiesData from '../../assets/data/abilities.json';
import type { Ability } from '../../types/character';
import type { AbilityDefinition, AbilityRawData } from '../../types/ability';

// ── Mappe di conversione ──────────────────────────────────────

const ABILITY_MAP: Record<string, Ability> = {
  strength: 'strength',
  dexterity: 'dexterity',
  constitution: 'constitution',
  intelligence: 'intelligence',
  wisdom: 'wisdom',
  charisma: 'charisma',
};

const ABILITY_LABEL_MAP: Record<string, string> = {
  strength: 'Forza',
  dexterity: 'Destrezza',
  constitution: 'Costituzione',
  intelligence: 'Intelligenza',
  wisdom: 'Saggezza',
  charisma: 'Carisma',
};

const ABILITY_ABBREVIATION_MAP: Record<string, string> = {
  strength: 'FOR',
  dexterity: 'DES',
  constitution: 'COS',
  intelligence: 'INT',
  wisdom: 'SAG',
  charisma: 'CAR',
};

const ABILITIES_LIST: Ability[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
];

// ── Conversione ────────────────────────────────────────────────

function convertRawAbility(rawAbility: AbilityRawData): AbilityDefinition {
  return {
    name: ABILITY_MAP[rawAbility.name],
    labelItalian: rawAbility.name_it,
    abbreviation: rawAbility.abbreviation,
    description: rawAbility.description,
  };
}

// ── Dati esportati ──────────────────────────────────────────

export const ABILITIES_DATA = (abilitiesData as AbilityRawData[]).reduce((acc, rawAbility) => {
  const converted = convertRawAbility(rawAbility);
  acc[converted.name] = converted;
  return acc;
}, {} as Record<Ability, AbilityDefinition>);

// ── Helper Functions ──────────────────────────────────────────

/** Cerca un'abilità per nome */
export function getAbility(ability: Ability): AbilityDefinition | undefined {
  return ABILITIES_DATA[ability];
}

/** Restituisce tutte le abilità */
export function getAllAbilities(): AbilityDefinition[] {
  return ABILITIES_LIST.map((a) => ABILITIES_DATA[a]);
}

/** Restituisce il nome italiano di un'abilità */
export function getAbilityLabel(ability: Ability): string {
  return ABILITY_LABEL_MAP[ability] ?? ability;
}

/** Restituisce l'abbreviazione italiana di un'abilità (es. 'FOR') */
export function getAbilityAbbreviation(ability: Ability): string {
  return ABILITY_ABBREVIATION_MAP[ability] ?? ability.toUpperCase().slice(0, 3);
}

/** Calcola il modificatore da un punteggio abilità */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/** Formatta il modificatore con segno (es. +3, -1) */
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/** Converte un nome italiano in Ability (es. 'Forza' → 'strength') */
export function parseAbilityFromItalian(name: string): Ability | undefined {
  const lower = name.toLowerCase();
  for (const [key, label] of Object.entries(ABILITY_LABEL_MAP)) {
    if (label.toLowerCase() === lower) return key as Ability;
  }
  return undefined;
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
