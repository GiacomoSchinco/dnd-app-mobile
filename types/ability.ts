// ── Abilità (abilities.json) ────────────────────────────────────

export type Ability =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma';

export type AbilityAbbreviation = 'FOR' | 'DES' | 'COS' | 'INT' | 'SAG' | 'CAR';

export interface AbilityRaw {
  id: number;
  name: Ability;
  name_it: string;
  abbreviation: AbilityAbbreviation;
  description: string;
}

/** Punteggi delle sei abilità di un personaggio */
export type AbilityScores = Record<Ability, number>;
