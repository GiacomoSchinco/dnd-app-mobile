import type { Ability } from './ability';

// ── Classi (classes.json) ───────────────────────────────────────

export interface ClassFeatureRaw {
  name: string;
  level: number;
  description: string;
  /** Tabella incassata separata dalla description (liste incantesimi, tabelle privilegi, …) */
  table?: string;
}

export interface ClassSpellcastingRaw {
  ability: Ability;
  spell_slots?: Record<string, number>;
  spells_known?: number;
  cantrips_known?: number;
}

export interface ClassProficienciesRaw {
  armor: string[];
  weapons: string[];
  tools: string[];
  skills: {
    count: number;
    options: string[];
  };
}

export interface ClassRaw {
  id: number;
  name: string;
  progression_key: string;
  description: string;
  hit_die: string;
  primary_ability: Ability[];
  saving_throws: Ability[];
  proficiencies: ClassProficienciesRaw;
  spellcasting: ClassSpellcastingRaw | null;
  features: ClassFeatureRaw[];
  hit_points: {
    average: number;
    description: string;
  };
  /** Presente solo su Fighter, Paladin, Ranger → array di feats.id (categoria fighting_style) */
  fighting_styles?: number[];
}
