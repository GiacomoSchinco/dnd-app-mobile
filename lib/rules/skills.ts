import skillsData from '../data/skills.json';
import type { Ability, SkillModifier, SkillModifierTarget, SkillName, SkillRaw } from '../../types';

/**
 * skills.ts — Gestione delle abilità di gioco (skills.json).
 * 18 skill, ciascuna associata a una caratteristica (`ability`).
 */

export interface SkillDefinition {
  id: number;
  name: SkillName;
  nameIt: string;
  ability: Ability;
  description: string;
}

function convertRawSkill(raw: SkillRaw): SkillDefinition {
  return {
    id: raw.id,
    name: raw.name,
    nameIt: raw.name_it,
    ability: raw.ability,
    description: raw.description,
  };
}

export const SKILLS_DATA: SkillDefinition[] = (skillsData as SkillRaw[]).map(convertRawSkill);

// ── Helper Functions ──────────────────────────────────────────

/** Cerca una skill per nome */
export function getSkill(skillName: SkillName): SkillDefinition | undefined {
  return SKILLS_DATA.find((s) => s.name === skillName);
}

/** Restituisce tutte le skill */
export function getAllSkills(): SkillDefinition[] {
  return SKILLS_DATA;
}

/** Nome italiano di una skill (es. 'acrobatics' → 'Acrobazia') */
export function getSkillNameItalian(name: string): string {
  return getSkill(name as SkillName)?.nameIt ?? name;
}

/** Converte un nome italiano in SkillName (es. 'Atletica' → 'athletics') */
export function parseSkillFromItalian(name: string): SkillName | undefined {
  const lower = name.toLowerCase();
  return SKILLS_DATA.find((s) => s.nameIt.toLowerCase() === lower)?.name;
}

/** Restituisce l'abilità associata a una skill */
export function getSkillAbility(skillName: SkillName): Ability | undefined {
  return getSkill(skillName)?.ability;
}

/** Restituisce tutte le skill associate a una data abilità */
export function getSkillsByAbility(ability: Ability): SkillDefinition[] {
  return SKILLS_DATA.filter((s) => s.ability === ability);
}

/** Restituisce le skill raggruppate per abilità */
export function getSkillsGroupedByAbility(): Record<Ability, SkillDefinition[]> {
  const abilities: Ability[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  return abilities.reduce((acc, ability) => {
    acc[ability] = getSkillsByAbility(ability);
    return acc;
  }, {} as Record<Ability, SkillDefinition[]>);
}

/** Verifica se una skill esiste */
export function isValidSkill(name: string): name is SkillName {
  return SKILLS_DATA.some((s) => s.name === name);
}

// ── Modificatori manuali alle skill (correzioni utente) ────────

/** Skill coinvolte da un target di modificatore ([] = tutte, per 'all') */
function getSkillModifierTargetSkills(target: SkillModifierTarget): SkillName[] {
  if (target === 'all') return [];
  return Array.isArray(target) ? target : [target];
}

/** Somma dei valori dei modificatori manuali che toccano la skill data */
export function getSkillModifierTotal(modifiers: SkillModifier[], skill: SkillName): number {
  return modifiers
    .filter((m) => {
      const targets = getSkillModifierTargetSkills(m.skill);
      return targets.length === 0 || targets.includes(skill);
    })
    .reduce((sum, m) => sum + m.value, 0);
}

/** Etichetta del destinatario di un modificatore di skill ('all' → 'Tutte le skill') */
export function getSkillModifierTargetLabel(target: SkillModifierTarget): string {
  const targets = getSkillModifierTargetSkills(target);
  return targets.length === 0
    ? 'Tutte le skill'
    : targets.map((s) => getSkillNameItalian(s)).join(' · ');
}
