import spellcastingData from '../data/spellcasting.json';
import { getAbilityModifier, getAbilityAbbreviation } from './abilities';
import { getClass, type ClassFeatureDefinition } from './classes';
import { getSpellProgression } from './spellcasting';
import type { Ability, AbilityScores, Character, CharacterClass, SpellcastingDataRaw, SpellSlot, SpellSlots } from '../../types';

/**
 * multiclass.ts — Regole per il multiclasse (D&D 2024).
 * Calcolo del caster level combinato, slot incantesimi, preparazione,
 * prerequisiti (13+ nelle caratteristiche primarie) e feature.
 */

const DATA = spellcastingData as SpellcastingDataRaw;

// ── Prerequisiti (D&D 2024: 13 nella/e caratteristica/e primaria) ──

export function getClassPrerequisites(className: string): Partial<Record<Ability, number>> {
  const def = getClass(className);
  if (!def) return {};
  const prereqs: Partial<Record<Ability, number>> = {};
  for (const ability of def.primaryAbilities) {
    prereqs[ability] = 13;
  }
  return prereqs;
}

// ── Utility ────────────────────────────────────────────────────

export function getTotalLevel(classes: CharacterClass[]): number {
  return classes.reduce((sum, cls) => sum + cls.level, 0);
}

// ── Multiclass Caster Level ────────────────────────────────────

/** Livello da incantatore combinato per il multiclasse */
export function calculateCasterLevel(classes: CharacterClass[]): number {
  let totalLevel = 0;

  for (const cls of classes) {
    const classDef = getClass(cls.className);
    if (!classDef?.isSpellcaster) continue;

    switch (classDef.spellcastingType) {
      case 'full':
        totalLevel += cls.level;
        break;
      case 'half':
        totalLevel += Math.floor(cls.level / 2);
        break;
      case 'third':
        totalLevel += Math.floor(cls.level / 3);
        break;
      case 'pact':
        // Warlock non contribuisce al caster level standard
        break;
    }
  }

  return Math.min(totalLevel, 20);
}

function emptySpellSlots(): SpellSlots {
  return {
    level1: 0, level2: 0, level3: 0, level4: 0,
    level5: 0, level6: 0, level7: 0, level8: 0, level9: 0,
  };
}

/** Slot incantesimi disponibili (tabella full_caster di spellcasting.json) */
export function calculateSpellSlots(character: Character): SpellSlots {
  const casterLevel = calculateCasterLevel(character.classes);
  const row = DATA.spell_slots.full_caster[String(casterLevel)] ?? {};
  const slots = emptySpellSlots();
  for (const [key, count] of Object.entries(row)) {
    const n = Number(key);
    if (n >= 1 && n <= 9) {
      slots[`level${n}` as keyof SpellSlots] = count;
    }
  }
  return slots;
}

/**
 * Slot incantesimi di un multiclasse nel formato del modello `Character`
 * (`Record<livello, SpellSlot>`, max = disponibili).
 *
 * Combina:
 * - gli slot standard dal Caster Level combinato (tabella full_caster);
 * - la Pact Magic del Warlock (slots + Mistico Arcano) per OGNI classe warlock,
 *   separata dagli slot normali ma nello stesso record per livello.
 *
 * Con una singola classe equivale a `getSpellSlots` di spellcasting.ts
 * (full caster → tabella, warlock → solo Pact Magic).
 */
export function calculateMulticlassSpellSlots(classes: CharacterClass[]): Record<number, SpellSlot> {
  const casterLevel = calculateCasterLevel(classes);
  const row = DATA.spell_slots.full_caster[String(casterLevel)] ?? {};
  const slots: Record<number, SpellSlot> = {};
  for (const [key, count] of Object.entries(row)) {
    const n = Number(key);
    if (n >= 1 && n <= 9) {
      slots[n] = { max: count, current: count };
    }
  }

  // Pact Magic (Warlock) + Mistico Arcano: per ogni classe warlock
  for (const cls of classes) {
    const classDef = getClass(cls.className);
    if (classDef?.spellcastingType !== 'pact') continue;
    const prog = getSpellProgression(cls.className, cls.level);
    if (!prog.pactMagic) continue;

    const existing = slots[prog.pactMagic.level];
    slots[prog.pactMagic.level] = {
      max: Math.max(existing?.max ?? 0, prog.pactMagic.slots),
      current: Math.max(existing?.current ?? 0, prog.pactMagic.slots),
    };
    for (const arcanumLevel of prog.pactMagic.mysticArcanum ?? []) {
      if (!slots[arcanumLevel]) {
        slots[arcanumLevel] = { max: 1, current: 1 };
      }
    }
  }

  return slots;
}

// ── Spell Preparation ──────────────────────────────────────────

export function canPrepareSpell(character: Character, spellLevel: number): boolean {
  const slots = calculateSpellSlots(character);
  const slotKey = `level${spellLevel}` as keyof SpellSlots;
  return slots[slotKey] > 0;
}

export function getMaxSpellLevel(character: Character): number {
  const slots = calculateSpellSlots(character);
  const slotKeys = ['level9', 'level8', 'level7', 'level6', 'level5', 'level4', 'level3', 'level2', 'level1'];

  for (const key of slotKeys) {
    if (slots[key as keyof SpellSlots] > 0) {
      return parseInt(key.replace('level', ''), 10);
    }
  }
  return 0;
}

/** Incantesimi preparabili dal personaggio (dalla tabella spells_preparable di spellcasting.json) */
export function calculatePreparedSpells(character: Character): number {
  let total = 0;
  const preparable = DATA.spells_preparable;

  for (const cls of character.classes) {
    const classDef = getClass(cls.className);
    if (!classDef?.isSpellcaster || !classDef.spellAbility) continue;

    const tableVal = preparable[classDef.name]?.[String(cls.level)];
    if (tableVal != null) {
      total += tableVal;
    } else {
      // Fallback: livello + modificatore caratteristica
      total += cls.level + getAbilityModifier(character.abilities[classDef.spellAbility]);
    }
  }

  return total;
}

// ── Prerequisiti ───────────────────────────────────────────────

export function checkMulticlassPrerequisites(
  currentClasses: CharacterClass[],
  newClassName: string,
  abilities: AbilityScores
): { valid: boolean; missing: string[] } {
  const newClass = getClass(newClassName);
  if (!newClass) return { valid: false, missing: ['Class not found'] };

  const missing: string[] = [];

  // Prerequisiti della nuova classe
  for (const [ability, minValue] of Object.entries(getClassPrerequisites(newClassName))) {
    if (abilities[ability as Ability] < minValue) {
      missing.push(`${ability} ${minValue}`);
    }
  }

  // Prerequisiti delle classi esistenti
  for (const cls of currentClasses) {
    const currentClassDef = getClass(cls.className);
    if (!currentClassDef) continue;

    for (const [ability, minValue] of Object.entries(getClassPrerequisites(cls.className))) {
      if (abilities[ability as Ability] < minValue) {
        missing.push(`${ability} ${minValue} (richiesto da ${currentClassDef.label})`);
      }
    }
  }

  return { valid: missing.length === 0, missing };
}

// ── Features & Leveling ────────────────────────────────────────

export function getClassFeatures(character: Character): ClassFeatureDefinition[] {
  const features: ClassFeatureDefinition[] = [];

  for (const cls of character.classes) {
    const classDef = getClass(cls.className);
    if (!classDef) continue;

    for (let level = 1; level <= cls.level; level++) {
      features.push(...(classDef.featuresByLevel[level] ?? []));
    }
  }

  return features;
}

export function canLevelUp(character: Character, className: string): boolean {
  const cls = character.classes.find((c) => c.className === className);
  if (!cls) return false;
  return cls.level < 20;
}

// ── Prerequisiti per la CREAZIONE (multiclasse) ────────────────

/**
 * Prerequisiti del multiclasse per la creazione: ogni classe richiede 13+
 * nelle sue caratteristiche primarie. Ritorna messaggi leggibili (es.
 * "Guerriero: serve FOR 13") per il blocco in creazione.
 */
export function getMulticlassPrerequisiteWarnings(
  classes: Array<{ className: string }>,
  abilities: AbilityScores
): string[] {
  const warnings: string[] = [];
  for (const cls of classes) {
    const def = getClass(cls.className);
    if (!def) continue;
    for (const ability of def.primaryAbilities) {
      if ((abilities[ability] ?? 0) < 13) {
        warnings.push(`${def.labelIt}: serve ${getAbilityAbbreviation(ability)} 13`);
      }
    }
  }
  return warnings;
}

