import type { Ability, ClassFeature } from './character';

export interface ClassSkillProficiencies {
  count: number;
  options: string[];
}

export interface ClassProficiencies {
  armor: string[];
  weapons: string[];
  tools: string[];
  skills: ClassSkillProficiencies;
}

export interface ClassSpellcastingData {
  ability: Ability;
  spell_slots?: Record<string, number>;
  spells_known?: number;
  cantrips_known?: number;
}

export type { ClassFeature };

export interface HitPointsData {
  average: number;
  description: string;
}

export interface CharacterClassData {
  id: number;
  name: string;
  description: string;
  hit_die: string;
  primary_ability: Ability[];
  saving_throws: string[];
  proficiencies: ClassProficiencies;
  spellcasting: ClassSpellcastingData | null;
  features: ClassFeature[];
  hit_points: HitPointsData;
}
