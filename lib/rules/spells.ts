import spellsData from '../data/spells.json';
import type { SpellRaw, SpellSchool } from '../../types';

/**
 * spells.ts — Gestione degli incantesimi (spells.json).
 *
 * Convenzioni dei dati:
 *  - `school` e `classes` sono in inglese (per filtri nel codice).
 *  - `level` 0 = trucchetto (cantrip).
 *  - Descrizioni e testi sono in italiano.
 */

export const SPELLS_DATA: SpellRaw[] = spellsData as SpellRaw[];

/** Cerca un incantesimo per nome (case-insensitive) */
export function getSpell(name: string): SpellRaw | undefined {
  const lower = name.toLowerCase();
  return SPELLS_DATA.find((s) => s.name.toLowerCase() === lower);
}

/** Restituisce tutti gli incantesimi */
export function getAllSpells(): SpellRaw[] {
  return SPELLS_DATA;
}

/** Cerca incantesimi per nome (case-insensitive, parziale) */
export function getSpellsByName(name: string): SpellRaw[] {
  const lower = name.toLowerCase();
  return SPELLS_DATA.filter((s) => s.name.toLowerCase().includes(lower));
}

/** Filtra gli incantesimi per livello */
export function getSpellsByLevel(level: number): SpellRaw[] {
  return SPELLS_DATA.filter((s) => s.level === level);
}

/** Filtra gli incantesimi per scuola (in inglese) */
export function getSpellsBySchool(school: SpellSchool): SpellRaw[] {
  return SPELLS_DATA.filter((s) => s.school === school);
}

/** Filtra gli incantesimi per classe (in inglese: 'wizard', 'bard', ...) */
export function getSpellsByClass(className: string): SpellRaw[] {
  const key = className.toLowerCase();
  return SPELLS_DATA.filter((s) => s.classes.includes(key));
}

/** Incantesimi di una classe a un dato livello */
export function getClassSpellsAtLevel(className: string, level: number): SpellRaw[] {
  const key = className.toLowerCase();
  return SPELLS_DATA.filter((s) => s.classes.includes(key) && s.level === level);
}

/** Restituisce i trucchetti (level 0) */
export function getCantrips(): SpellRaw[] {
  return getSpellsByLevel(0);
}

/** Verifica se un incantesimo è un rituale */
export function isRitual(spell: SpellRaw): boolean {
  return spell.ritual;
}

/** Verifica se un incantesimo richiede concentrazione */
export function requiresConcentration(spell: SpellRaw): boolean {
  return spell.concentration;
}
