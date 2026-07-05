// ── Raw JSON Data Types ────────────────────────────────────────

export interface FeatPrerequisite {
  type: 'ability_score' | 'weapon_proficiency' | 'spellcasting' | 'level';
  field?: string;
  value?: number | string;
}

export interface FeatAsiConfig {
  choices_count: number;
  allowed_scores: string[];
  bonus_value: number;
  max_cap: number;
  description: string;
}

export interface FeatChoiceConfig {
  type: string;
  pool?: string;
  count: number;
  description: string;
  cantrips_count?: number;
  first_level_spells_count?: number;
  spell_list?: string;
  spell_casting_ability_choices?: string[];
}

export interface FeatGrantedResource {
  name: string;
  scale_with?: string;
  reset_on?: string;
  description: string;
}

export interface FeatModifier {
  type: string;
  description: string;
  [key: string]: unknown;
}

export interface FeatRawData {
  id: number;
  name: string;
  name_en: string;
  category: 'origin' | 'general' | 'epic_boon';
  level_requirement: number;
  description: string;
  prerequisites: FeatPrerequisite[];
  has_choices: boolean;
  asi_config: FeatAsiConfig | null;
  choice_config?: FeatChoiceConfig | null;
  granted_resource?: FeatGrantedResource;
  granted_modifiers: FeatModifier[];
}

// ── Converted Definition ───────────────────────────────────────

export interface FeatDefinition {
  id: number;
  name: string;
  nameEn: string;
  category: 'origin' | 'general' | 'epic_boon';
  levelRequirement: number;
  description: string;
  prerequisites: FeatPrerequisite[];
  hasChoices: boolean;
  asiConfig: FeatAsiConfig | null;
  choiceConfig?: FeatChoiceConfig | null;
  grantedResource?: FeatGrantedResource;
  grantedModifiers: FeatModifier[];
}
