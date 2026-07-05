// ── Raw JSON Data Types ────────────────────────────────────────

export interface BackgroundRawData {
  id: number;
  name: string;
  description: string;
  ability_score_boosts: string[];
  skills: string[];
  tool_proficiencies: string[];
  feat_id: number;
  equipment_preset_id: number;
}

// ── Converted Definition ───────────────────────────────────────

export interface BackgroundDefinition {
  id: number;
  name: string;
  description: string;
  abilityScoreBoosts: string[];
  skills: string[];
  toolProficiencies: string[];
  featId: number;
  equipmentPresetId: number;
}
