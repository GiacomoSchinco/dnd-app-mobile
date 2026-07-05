import backgroundsData from '../../assets/data/backgrounds.json';
import type { BackgroundRawData, BackgroundDefinition } from '../../types';

// ── Conversione ────────────────────────────────────────────────

function convertRawBackground(raw: BackgroundRawData): BackgroundDefinition {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    abilityScoreBoosts: raw.ability_score_boosts,
    skills: raw.skills,
    toolProficiencies: raw.tool_proficiencies,
    featId: raw.feat_id,
    equipmentPresetId: raw.equipment_preset_id,
  };
}

// ── Dati esportati ──────────────────────────────────────────

export const BACKGROUNDS_DATA = (backgroundsData as BackgroundRawData[]).map(convertRawBackground);

/** Cerca un background per ID */
export function getBackground(id: number): BackgroundDefinition | undefined {
  return BACKGROUNDS_DATA.find(b => b.id === id);
}

/** Cerca un background per nome (case-insensitive) */
export function getBackgroundByName(name: string): BackgroundDefinition | undefined {
  return BACKGROUNDS_DATA.find(b => b.name.toLowerCase() === name.toLowerCase());
}

/** Restituisce tutti i background */
export function getAllBackgrounds(): BackgroundDefinition[] {
  return BACKGROUNDS_DATA;
}

/** Restituisce le skill concesse da un background */
export function getBackgroundSkills(id: number): string[] {
  return getBackground(id)?.skills ?? [];
}

/** Restituisce il feat_id associato a un background */
export function getBackgroundFeatId(id: number): number | undefined {
  return getBackground(id)?.featId;
}

/** Restituisce gli ability score boosts concessi da un background (abbreviazioni es. FOR, DES, COS) */
export function getBackgroundAbilityBoosts(id: number): string[] {
  return getBackground(id)?.abilityScoreBoosts ?? [];
}
