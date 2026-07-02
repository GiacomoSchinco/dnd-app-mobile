import type { Ability } from './character';

// ── Raw JSON Data Types ────────────────────────────────────────

export interface AbilityRawData {
  id: number;
  name: Ability;
  name_it: string;
  abbreviation: string;
  description: string;
}

// ── Converted Definition ───────────────────────────────────────

export interface AbilityDefinition {
  /** Nome chiave inglese (es. 'strength') */
  name: Ability;
  /** Nome in italiano */
  labelItalian: string;
  /** Abbreviazione italiana (es. 'FOR', 'DES') */
  abbreviation: string;
  /** Descrizione */
  description: string;
}
