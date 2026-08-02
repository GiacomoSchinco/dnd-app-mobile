// ── Talenti (feats.json) ────────────────────────────────────────

export type FeatCategory = 'origin' | 'general' | 'epic_boon' | 'fighting_style';

export interface FeatModifierRaw {
  type: string;
  source?: string;
  description: string;
  [key: string]: unknown;
}

export interface FeatPrerequisiteRaw {
  type: string;
  field?: string;
  value?: unknown;
  [key: string]: unknown;
}

export interface FeatRaw {
  id: number;
  name: string;
  name_en: string;
  category: FeatCategory;
  level_requirement: number;
  description: string;
  prerequisites: FeatPrerequisiteRaw[];
  has_choices: boolean;
  asi_config: Record<string, unknown> | null;
  choice_config?: Record<string, unknown> | null;
  granted_resource?: Record<string, unknown> | null;
  granted_modifiers: FeatModifierRaw[];
}
