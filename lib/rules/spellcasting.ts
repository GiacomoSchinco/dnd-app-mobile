import type { SpellCastingClass, SpellProgression } from '../../types';
import spellcastingData from '../../assets/data/spellcasting.json';

// ── Tipi dal JSON ──────────────────────────────────────────────

type SpellcastingJSON = typeof spellcastingData;
type CasterType = 'full' | 'half' | 'pact';

/** Tutte le classi che usano magia. */
export const SPELLCASTING_CLASSES: SpellCastingClass[] = [
  'wizard', 'sorcerer', 'bard', 'cleric', 'druid', 'paladin', 'ranger', 'warlock',
];

/** Classi che preparano incantesimi (escluso Mago che prepara dal grimorio). */
export const PREPARER_CLASSES = ['cleric', 'druid', 'paladin'] as const;

/** Classi che preparano al level-up (include il Mago). */
export const PREPARER_CLASSES_LEVELUP = ['cleric', 'druid', 'paladin', 'wizard'] as const;

/** Classi che conoscono incantesimi E possono sostituirne uno al level-up. */
export const SWAP_CLASSES = ['bard', 'sorcerer', 'ranger', 'warlock'] as const;

// ── Helpers ────────────────────────────────────────────────────

function getCasterType(cls: SpellCastingClass): CasterType | null {
  return (spellcastingData.caster_types as Record<string, CasterType>)[cls] ?? null;
}

function toNumberKeys(record: Record<string, any>): Record<number, any> {
  const result: Record<number, any> = {};
  for (const [k, v] of Object.entries(record)) {
    result[Number(k)] = v;
  }
  return result;
}

// ── Funzione principale ────────────────────────────────────────

export function getSpellProgression(className: string, level: number): SpellProgression {
  const casterType = getCasterType(className as SpellCastingClass);
  if (!casterType) {
    return { cantrips: 0, spellsKnown: null, spellSlots: {} };
  }

  const cls = className as SpellCastingClass;
  const levelKey = String(level);
  const progression: SpellProgression = {
    cantrips: 0,
    spellsKnown: null,
    spellSlots: {},
  };

  // 1. Cantrips
  const cantripsByClass = spellcastingData.cantrips as Record<string, Record<string, number>>;
  progression.cantrips = cantripsByClass[cls]?.[levelKey] ?? 0;

  // 2. Spells Known / Spells Preparable
  const preparerClasses = Object.keys(spellcastingData.spells_preparable as Record<string, any>);
  const knownClasses = Object.keys(spellcastingData.spells_known as Record<string, any>);

  if (preparerClasses.includes(cls)) {
    progression.spellsKnown = null;
    const preparable = spellcastingData.spells_preparable as Record<string, Record<string, number>>;
    progression.spellsPreparable = preparable[cls]?.[levelKey] ?? 0;

    const preparedMod = spellcastingData.prepared_modifier as Record<string, string>;
    progression.preparedModifier = preparedMod[cls] as 'int' | 'wis' | 'cha';

    if (cls === 'wizard') {
      const spellbook = spellcastingData.wizard_spellbook;
      progression.wizardSpellbookSize = spellbook.initial_spells + (level - 1) * spellbook.spells_per_level_up;
    }
  }

  if (knownClasses.includes(cls)) {
    const known = spellcastingData.spells_known as Record<string, Record<string, number>>;
    progression.spellsKnown = known[cls]?.[levelKey] ?? 0;
  }

  // 3. Slot incantesimi e Pact Magic
  if (casterType === 'pact') {
    const pact = spellcastingData.pact_magic as Record<string, { slots: number; level: number; mystic_arcanum?: number[] }>;
    const pactData = pact[levelKey] ?? { slots: 0, level: 1 };
    progression.pactMagic = {
      slots: pactData.slots,
      level: pactData.level,
    };
    if (pactData.mystic_arcanum) {
      progression.pactMagic.mysticArcanum = pactData.mystic_arcanum;
    }
  } else {
    const slotsKey = casterType === 'full' ? 'full_caster' : 'half_caster';
    const slots = spellcastingData.spell_slots as Record<string, Record<string, Record<string, number>>>;
    progression.spellSlots = toNumberKeys(slots[slotsKey]?.[levelKey] ?? {});
  }

  return progression;
}

// --------------------------------------------------------------
// 5. FUNZIONE PER IL LEVEL UP - AGGIORNATA 2024
// --------------------------------------------------------------
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

  // Calcolo dei nuovi slot guadagnati (delta)
  const newSpellSlots: Record<number, number> = {};
  for (const [lvl, count] of Object.entries(newProg.spellSlots)) {
    const delta = (count as number) - (oldProg.spellSlots[Number(lvl)] ?? 0);
    if (delta > 0) newSpellSlots[Number(lvl)] = delta;
  }

  const changes: any = {
    newCantrips: newProg.cantrips - oldProg.cantrips,
    newSpellsKnown: (newProg.spellsKnown ?? 0) - (oldProg.spellsKnown ?? 0),
    newSpellsPreparable: (newProg.spellsPreparable ?? 0) - (oldProg.spellsPreparable ?? 0),
    newSpellSlots,
    totalSpellSlots: newProg.spellSlots,
    newPactMagic: newProg.pactMagic,
  };

  // Se è un mago, calcola quanti incantesimi gratuiti inserisce nel grimorio salendo di livello
  if (className === 'wizard') {
    changes.wizardSpellbookAdded = (newLevel - oldLevel) * 2;
  }

  return changes;
}