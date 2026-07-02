// ── Race Names ──────────────────────────────────────────────────

export type RaceName =
  | 'human'
  | 'elf'
  | 'dwarf'
  | 'halfling'
  | 'gnome'
  | 'dragonborn'
  | 'tiefling'
  | 'aasimar'
  | 'goliath'
  | 'orc';

// ── Raw JSON Data Types ────────────────────────────────────────

export interface RaceTrait {
  name: string;
  description: string;
}

export interface RaceRawData {
  id: number;
  name: string;
  description: string;
  speed: number;
  size: 'Small' | 'Medium';
  traits: RaceTrait[];
  subraces: string[] | null;
  darkvision: number | null;
  resistances: string[];
  immunities: string[];
  proficiencies: string[];
  tools: string[];
  languages: string[];
  extra_language: number;
  extra_skills: number;
  hp_per_level: number;
}

// ── Converted Definition ───────────────────────────────────────

export interface RaceDefinition {
  /** Nome chiave in inglese minuscolo (es. 'half-orc' → 'halfOrc') */
  name: RaceName;
  /** Nome originale inglese (es. 'Half-Orc') */
  label: string;
  /** Nome in italiano */
  labelItalian: string;
  description: string;
  speed: number;
  size: 'Small' | 'Medium';
  traits: RaceTrait[];
  subraces: string[] | null;
  darkvision: number | null;
  resistances: string[];
  immunities: string[];
  proficiencies: string[];
  tools: string[];
  languages: string[];
  extraLanguage: number;
  extraSkills: number;
  hpPerLevel: number;
}
