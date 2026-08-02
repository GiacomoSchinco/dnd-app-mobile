import backgroundsData from '../data/backgrounds.json';
import type { AbilityAbbreviation, BackgroundRaw, SkillName } from '../../types';

/**
 * backgrounds.ts — Gestione dei background (backgrounds.json).
 * 16 background. `skills` sono nomi inglesi; `ability_score_boosts.allowed_scores`
 * sono abbreviazioni italiane (FOR, DES, ...).
 */

export interface BackgroundToolProficiency {
  type: 'FIXED' | 'CHOICE';
  toolId?: string;
  category?: string;
}

export interface BackgroundFeat {
  featId: number;
  name: string;
  requiresChoice: boolean;
  spellcastingAbilityOptions?: AbilityAbbreviation[];
  choiceType?: string;
  count?: number;
}

export interface BackgroundDefinition {
  id: number;
  name: string;
  description: string;
  abilityScoreBoosts: {
    allowedScores: AbilityAbbreviation[];
    distributionModes: string[];
  };
  skills: SkillName[];
  toolProficiency: BackgroundToolProficiency;
  feat: BackgroundFeat;
  equipmentPresetId: number;
}

function convertRawBackground(raw: BackgroundRaw): BackgroundDefinition {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    abilityScoreBoosts: {
      allowedScores: raw.ability_score_boosts.allowed_scores,
      distributionModes: raw.ability_score_boosts.distribution_modes,
    },
    skills: raw.skills,
    toolProficiency: {
      type: raw.tool_proficiency.type,
      toolId: raw.tool_proficiency.tool_id,
      category: raw.tool_proficiency.category,
    },
    feat: {
      featId: raw.feat.feat_id,
      name: raw.feat.name,
      requiresChoice: raw.feat.requires_choice,
      spellcastingAbilityOptions: raw.feat.spellcasting_ability_options,
      choiceType: raw.feat.choice_type,
      count: raw.feat.count,
    },
    equipmentPresetId: raw.equipment_preset_id,
  };
}

export const BACKGROUNDS_DATA: BackgroundDefinition[] = (backgroundsData as BackgroundRaw[]).map(convertRawBackground);

/** Cerca un background per ID */
export function getBackground(id: number): BackgroundDefinition | undefined {
  return BACKGROUNDS_DATA.find((b) => b.id === id);
}

/** Cerca un background per nome (case-insensitive) */
export function getBackgroundByName(name: string): BackgroundDefinition | undefined {
  return BACKGROUNDS_DATA.find((b) => b.name.toLowerCase() === name.toLowerCase());
}

/** Restituisce tutti i background */
export function getAllBackgrounds(): BackgroundDefinition[] {
  return BACKGROUNDS_DATA;
}

/** Skill concesse da un background */
export function getBackgroundSkills(id: number): SkillName[] {
  return getBackground(id)?.skills ?? [];
}

/** feat_id associato a un background */
export function getBackgroundFeatId(id: number): number | undefined {
  return getBackground(id)?.feat.featId;
}

/** Ability score boosts concessi da un background (abbreviazioni es. FOR, DES, COS) */
export function getBackgroundAbilityBoosts(id: number): AbilityAbbreviation[] {
  return getBackground(id)?.abilityScoreBoosts.allowedScores ?? [];
}

/** Competenza strumenti concessa da un background */
export function getBackgroundToolProficiency(id: number): BackgroundToolProficiency | undefined {
  return getBackground(id)?.toolProficiency;
}

/** equipment_preset_id associato a un background */
export function getBackgroundEquipmentPresetId(id: number): number | undefined {
  return getBackground(id)?.equipmentPresetId;
}
