import type { Ability } from './ability';

// ── Abilità di gioco / Skill (skills.json) ─────────────────────

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

export interface SkillRaw {
  id: number;
  name: SkillName;
  name_it: string;
  ability: Ability;
  description: string;
}
