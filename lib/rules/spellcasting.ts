import spellcastingData from '../data/spellcasting.json';
import type { SpellcastingDataRaw, SpellProgression, SpellSlot } from '../../types';

/**
 * spellcasting.ts — Gestione di slot e incantesimi per classe (spellcasting.json).
 * Organizzato per classe/abilità: cantrips, spells known/preparable, slot, pact magic.
 */

const DATA = spellcastingData as SpellcastingDataRaw;

/** Tutte le classi che usano magia. */
export const SPELLCASTING_CLASSES: string[] = [
  'wizard', 'sorcerer', 'bard', 'cleric', 'druid', 'paladin', 'ranger', 'warlock',
];

/** Classi che preparano incantesimi (escluso Mago che prepara dal grimorio). */
export const PREPARER_CLASSES = ['cleric', 'druid', 'paladin'] as const;

/** Classi che preparano al level-up (include il Mago). */
export const PREPARER_CLASSES_LEVELUP = ['cleric', 'druid', 'paladin', 'wizard'] as const;

/** Classi che conoscono incantesimi E possono sostituirne uno al level-up. */
export const SWAP_CLASSES = ['bard', 'sorcerer', 'ranger', 'warlock'] as const;

// ── Helpers ────────────────────────────────────────────────────

function getCasterType(cls: string): 'full' | 'half' | 'pact' | null {
  return DATA.caster_types[cls] ?? null;
}

function toNumberKeys(record: Record<string, number>): Record<number, number> {
  const result: Record<number, number> = {};
  for (const [k, v] of Object.entries(record)) {
    result[Number(k)] = v;
  }
  return result;
}

// ── Funzione principale ────────────────────────────────────────

/** Progressione di incantesimi di una classe a un dato livello */
export function getSpellProgression(className: string, level: number): SpellProgression {
  const casterType = getCasterType(className);
  if (!casterType) {
    return { cantrips: 0, spellsKnown: null, spellSlots: {} };
  }

  const levelKey = String(level);
  const progression: SpellProgression = {
    cantrips: 0,
    spellsKnown: null,
    spellSlots: {},
  };

  // 1. Cantrips
  progression.cantrips = DATA.cantrips[className]?.[levelKey] ?? 0;

  // 2. Spells Known / Spells Preparable
  const preparerClasses = Object.keys(DATA.spells_preparable);
  const knownClasses = Object.keys(DATA.spells_known);

  if (preparerClasses.includes(className)) {
    progression.spellsKnown = null;
    progression.spellsPreparable = DATA.spells_preparable[className]?.[levelKey] ?? 0;
    progression.preparedModifier = DATA.prepared_modifier[className];

    if (className === 'wizard') {
      const spellbook = DATA.wizard_spellbook;
      progression.wizardSpellbookSize = spellbook.initial_spells + (level - 1) * spellbook.spells_per_level_up;
    }
  }

  if (knownClasses.includes(className)) {
    progression.spellsKnown = DATA.spells_known[className]?.[levelKey] ?? 0;
  }

  // 3. Slot incantesimi e Pact Magic
  if (casterType === 'pact') {
    const pactData = DATA.pact_magic[levelKey] ?? { slots: 0, level: 1 };
    progression.pactMagic = {
      slots: pactData.slots,
      level: pactData.level,
    };
    if (pactData.mystic_arcanum) {
      progression.pactMagic.mysticArcanum = pactData.mystic_arcanum;
    }
  } else {
    const slotsKey = casterType === 'full' ? 'full_caster' : 'half_caster';
    progression.spellSlots = toNumberKeys(DATA.spell_slots[slotsKey]?.[levelKey] ?? {});
  }

  return progression;
}

// ── Level up ───────────────────────────────────────────────────

/** Slot incantesimi a un dato livello, normalizzati in `Record<livello, SpellSlot>`.
 *  Include la Pact Magic del Warlock (gli slot stanno in `pactMagic`) e il
 *  Mistico Arcano (6°–9°, 1 slot per livello dal 11°). */
export function getSpellSlots(
  className: string,
  level: number
): Record<number, SpellSlot> {
  const progression = getSpellProgression(className, level);
  const slots: Record<number, SpellSlot> = {};
  for (const [lvl, max] of Object.entries(progression.spellSlots)) {
    slots[Number(lvl)] = { max, current: max };
  }
  if (progression.pactMagic) {
    slots[progression.pactMagic.level] = {
      max: progression.pactMagic.slots,
      current: progression.pactMagic.slots,
    };
    for (const arcanumLevel of progression.pactMagic.mysticArcanum ?? []) {
      slots[arcanumLevel] = { max: 1, current: 1 };
    }
  }
  return slots;
}

/** Cambiamenti di incantesimi quando si sale di livello */
export function getLevelUpSpellChanges(
  className: string,
  oldLevel: number,
  newLevel: number
): {
  newCantrips: number;
  newSpellsKnown: number;
  newSpellsPreparable: number;
  wizardSpellbookAdded?: number;
  newSpellSlots: Record<number, number>;
  totalSpellSlots: Record<number, number>;
  newPactMagic?: SpellProgression['pactMagic'];
} {
  const oldProg = getSpellProgression(className, oldLevel);
  const newProg = getSpellProgression(className, newLevel);

  // Nuovi slot guadagnati (delta)
  const newSpellSlots: Record<number, number> = {};
  for (const [lvl, count] of Object.entries(newProg.spellSlots)) {
    const delta = count - (oldProg.spellSlots[Number(lvl)] ?? 0);
    if (delta > 0) newSpellSlots[Number(lvl)] = delta;
  }

  const changes: {
    newCantrips: number;
    newSpellsKnown: number;
    newSpellsPreparable: number;
    wizardSpellbookAdded?: number;
    newSpellSlots: Record<number, number>;
    totalSpellSlots: Record<number, number>;
    newPactMagic?: SpellProgression['pactMagic'];
  } = {
    newCantrips: newProg.cantrips - oldProg.cantrips,
    newSpellsKnown: (newProg.spellsKnown ?? 0) - (oldProg.spellsKnown ?? 0),
    newSpellsPreparable: (newProg.spellsPreparable ?? 0) - (oldProg.spellsPreparable ?? 0),
    newSpellSlots,
    totalSpellSlots: newProg.spellSlots,
    newPactMagic: newProg.pactMagic,
  };

  // Mago: incantesimi gratuiti nel grimorio salendo di livello
  if (className === 'wizard') {
    changes.wizardSpellbookAdded = (newLevel - oldLevel) * 2;
  }

  return changes;
}