import racesData from '../../assets/data/races.json';
import type { RaceName, RaceDefinition, RaceRawData } from '../../types/race';

// ── Mappe di conversione ──────────────────────────────────────

const RACE_NAME_MAP: Record<string, RaceName> = {
  human: 'human',
  elf: 'elf',
  dwarf: 'dwarf',
  halfling: 'halfling',
  gnome: 'gnome',
  dragonborn: 'dragonborn',
  tiefling: 'tiefling',
  aasimar: 'aasimar',
  goliath: 'goliath',
  orc: 'orc',
};

const RACE_LABEL_ITALIAN: Record<string, string> = {
  human: 'Umano',
  elf: 'Elfo',
  dwarf: 'Nano',
  halfling: 'Halfling',
  gnome: 'Gnomo',
  dragonborn: 'Dragonide',
  tiefling: 'Tiefling',
  aasimar: 'Aasimar',
  goliath: 'Goliath',
  orc: 'Orco',
};

// ── Conversione razza ──────────────────────────────────────────

function convertRawRace(rawRace: RaceRawData): RaceDefinition {
  const name = rawRace.name.toLowerCase() as RaceName;

  return {
    name,
    label: rawRace.name,
    labelItalian: RACE_LABEL_ITALIAN[name] || rawRace.name,
    description: rawRace.description,
    speed: rawRace.speed,
    size: rawRace.size,
    traits: rawRace.traits.map((trait) => ({
      name: trait.name,
      description: trait.description,
    })),
    subraces: rawRace.subraces,
    darkvision: rawRace.darkvision,
    resistances: rawRace.resistances,
    immunities: rawRace.immunities,
    proficiencies: rawRace.proficiencies,
    tools: rawRace.tools,
    languages: rawRace.languages,
    extraLanguage: rawRace.extra_language,
    extraSkills: rawRace.extra_skills,
    hpPerLevel: rawRace.hp_per_level,
  };
}

// ── Dati esportati ──────────────────────────────────────────

export const RACES_DATA = (racesData as RaceRawData[]).reduce((acc, rawRace) => {
  const converted = convertRawRace(rawRace);
  acc[converted.name] = converted;
  return acc;
}, {} as Record<RaceName, RaceDefinition>);

// ── Helper Functions ──────────────────────────────────────────

/** Cerca una razza per nome (case-insensitive) */
export function getRace(raceName: RaceName): RaceDefinition | undefined {
  return RACES_DATA[raceName];
}

/** Restituisce tutte le razze */
export function getAllRaces(): RaceDefinition[] {
  return Object.values(RACES_DATA);
}

/** Restituisce il nome italiano di una razza */
export function getRaceNameItalian(name: string): string {
  return RACE_LABEL_ITALIAN[name.toLowerCase()] || name;
}

/** Verifica se una razza ha scurovisione */
export function hasDarkvision(raceName: RaceName): boolean {
  const race = getRace(raceName);
  return race?.darkvision != null && race.darkvision > 0;
}

/** Ottiene la distanza della scurovisione (0 se non presente) */
export function getDarkvisionRange(raceName: RaceName): number {
  return getRace(raceName)?.darkvision ?? 0;
}

/** Restituisce le sottorazze di una razza (o null) */
export function getSubraces(raceName: RaceName): string[] | null {
  return getRace(raceName)?.subraces ?? null;
}

/** Verifica se una razza ha sottorazze */
export function hasSubraces(raceName: RaceName): boolean {
  const subraces = getSubraces(raceName);
  return subraces != null && subraces.length > 0;
}

/** Restituisce le competenze aggiuntive concesse dalla razza */
export function getRaceProficiencies(raceName: RaceName): string[] {
  return getRace(raceName)?.proficiencies ?? [];
}

/** Restituisce le lingue concesse dalla razza */
export function getRaceLanguages(raceName: RaceName): string[] {
  return getRace(raceName)?.languages ?? [];
}

/** Restituisce le resistenze concesse dalla razza */
export function getRaceResistances(raceName: RaceName): string[] {
  return getRace(raceName)?.resistances ?? [];
}

/** Restituisce le immunità concesse dalla razza */
export function getRaceImmunities(raceName: RaceName): string[] {
  return getRace(raceName)?.immunities ?? [];
}

/** Calcola i PF bonus per livello dati dalla razza (es. Nano → +1 PF/livello) */
export function getBonusHpPerLevel(raceName: RaceName): number {
  return getRace(raceName)?.hpPerLevel ?? 0;
}

/** Calcola i PF bonus totali dati dalla razza a un determinato livello */
export function getTotalBonusHp(raceName: RaceName, level: number): number {
  return getBonusHpPerLevel(raceName) * level;
}

/** Verifica se una razza concede skill aggiuntive da scegliere */
export function hasExtraSkillChoices(raceName: RaceName): boolean {
  return (getRace(raceName)?.extraSkills ?? 0) > 0;
}

/** Restituisce il numero di skill aggiuntive sceglibili dalla razza */
export function getExtraSkillCount(raceName: RaceName): number {
  return getRace(raceName)?.extraSkills ?? 0;
}

/** Restituisce il numero di lingue aggiuntive sceglibili dalla razza */
export function getExtraLanguageCount(raceName: RaceName): number {
  return getRace(raceName)?.extraLanguage ?? 0;
}

/** Restituisce la velocità della razza */
export function getRaceSpeed(raceName: RaceName): number {
  return getRace(raceName)?.speed ?? 30;
}

/** Restituisce la taglia della razza */
export function getRaceSize(raceName: RaceName): 'Small' | 'Medium' {
  return getRace(raceName)?.size ?? 'Medium';
}

/** Filtra le razze per taglia */
export function getRacesBySize(size: 'Small' | 'Medium'): RaceDefinition[] {
  return Object.values(RACES_DATA).filter((race) => race.size === size);
}

/** Filtra le razze con scurovisione */
export function getRacesWithDarkvision(): RaceDefinition[] {
  return Object.values(RACES_DATA).filter((race) => race.darkvision != null && race.darkvision > 0);
}
