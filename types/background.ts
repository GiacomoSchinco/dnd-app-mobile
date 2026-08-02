import type { AbilityAbbreviation } from './ability';
import type { SkillName } from './skill';

// ── Background (backgrounds.json) ───────────────────────────────

export interface BackgroundRaw {
  id: number;
  name: string;
  description: string;
  ability_score_boosts: {
    allowed_scores: AbilityAbbreviation[];
    distribution_modes: string[];
  };
  skills: SkillName[];
  tool_proficiency: {
    type: 'FIXED' | 'CHOICE';
    tool_id?: string;
    category?: string;
  };
  feat: {
    feat_id: number;
    name: string;
    requires_choice: boolean;
    spellcasting_ability_options?: AbilityAbbreviation[];
    choice_type?: string;
    count?: number;
  };
  equipment_preset_id: number;
}
