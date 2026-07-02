import skillsData from '../../assets/data/skills.json';
import type { SkillName, SkillDefinition, SkillRawData } from '../../types/skill';
import type { Ability } from '../../types/character';

// ── Mappe di conversione ──────────────────────────────────────

const SKILL_NAME_MAP: Record<string, SkillName> = {
  acrobatics: 'acrobatics',
  animal_handling: 'animal_handling',
  arcana: 'arcana',
  athletics: 'athletics',
  deception: 'deception',
  history: 'history',
  insight: 'insight',
  intimidation: 'intimidation',
  investigation: 'investigation',
  medicine: 'medicine',
  nature: 'nature',
  perception: 'perception',
  performance: 'performance',
  persuasion: 'persuasion',
  religion: 'religion',
  sleight_of_hand: 'sleight_of_hand',
  stealth: 'stealth',
  survival: 'survival',
};

/** Associazione abilità → skill keys */
const ABILITY_SKILLS_MAP: Record<Ability, SkillName[]> = {
  strength: ['athletics'],
  dexterity: ['acrobatics', 'sleight_of_hand', 'stealth'],
  constitution: [],
  intelligence: ['arcana', 'history', 'investigation', 'nature', 'religion'],
  wisdom: ['animal_handling', 'insight', 'medicine', 'perception', 'survival'],
  charisma: ['deception', 'intimidation', 'performance', 'persuasion'],
};

// ── Conversione skill ──────────────────────────────────────────

function convertRawSkill(rawSkill: SkillRawData): SkillDefinition {
  return {
    name: SKILL_NAME_MAP[rawSkill.name] || (rawSkill.name as SkillName),
    labelItalian: rawSkill.name_it,
    ability: rawSkill.ability,
    description: rawSkill.description,
  };
}

// ── Dati esportati ──────────────────────────────────────────

export const SKILLS_DATA = (skillsData as SkillRawData[]).reduce((acc, rawSkill) => {
  const converted = convertRawSkill(rawSkill);
  acc[converted.name] = converted;
  return acc;
}, {} as Record<SkillName, SkillDefinition>);

// ── Helper Functions ──────────────────────────────────────────

/** Cerca una skill per nome */
export function getSkill(skillName: SkillName): SkillDefinition | undefined {
  return SKILLS_DATA[skillName];
}

/** Restituisce tutte le skill */
export function getAllSkills(): SkillDefinition[] {
  return Object.values(SKILLS_DATA);
}

/** Restituisce il nome italiano di una skill */
export function getSkillNameItalian(name: string): string {
  return SKILLS_DATA[name as SkillName]?.labelItalian ?? name;
}

/** Restituisce l'abilità associata a una skill */
export function getSkillAbility(skillName: SkillName): Ability | undefined {
  return getSkill(skillName)?.ability;
}

/** Restituisce tutte le skill associate a una data abilità */
export function getSkillsByAbility(ability: Ability): SkillDefinition[] {
  const names = ABILITY_SKILLS_MAP[ability] ?? [];
  return names.map((name) => SKILLS_DATA[name]).filter(Boolean);
}

/** Verifica se una skill esiste */
export function isValidSkill(name: string): name is SkillName {
  return name in SKILLS_DATA;
}

/** Restituisce le skill raggruppate per abilità */
export function getSkillsGroupedByAbility(): Record<Ability, SkillDefinition[]> {
  const abilities: Ability[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  return abilities.reduce((acc, ability) => {
    acc[ability] = getSkillsByAbility(ability);
    return acc;
  }, {} as Record<Ability, SkillDefinition[]>);
}
