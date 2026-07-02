import type { Ability } from './character';

// ── Skill Names ─────────────────────────────────────────────────

export type SkillName =
  | 'acrobatics'
  | 'animal_handling'
  | 'arcana'
  | 'athletics'
  | 'deception'
  | 'history'
  | 'insight'
  | 'intimidation'
  | 'investigation'
  | 'medicine'
  | 'nature'
  | 'perception'
  | 'performance'
  | 'persuasion'
  | 'religion'
  | 'sleight_of_hand'
  | 'stealth'
  | 'survival';

// ── Raw JSON Data Types ────────────────────────────────────────

export interface SkillRawData {
  id: number;
  name: string;
  name_it: string;
  ability: Ability;
  description: string;
}

// ── Converted Definition ───────────────────────────────────────

export interface SkillDefinition {
  /** Nome chiave inglese (es. 'sleight_of_hand') */
  name: SkillName;
  /** Nome in italiano */
  labelItalian: string;
  /** Abilità associata */
  ability: Ability;
  /** Descrizione */
  description: string;
}
