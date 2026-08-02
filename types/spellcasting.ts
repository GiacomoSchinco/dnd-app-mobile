// ── Spellcasting (spellcasting.json) ────────────────────────────

export type SpellCastingType = 'full' | 'half' | 'third' | 'pact';

export interface SpellcastingDataRaw {
  cantrips: Record<string, Record<string, number>>;
  spells_known: Record<string, Record<string, number>>;
  spells_preparable: Record<string, Record<string, number>>;
  prepared_modifier: Record<string, string>;
  spell_slots: {
    full_caster: Record<string, Record<string, number>>;
    half_caster: Record<string, Record<string, number>>;
  };
  pact_magic: Record<string, { slots: number; level: number; mystic_arcanum?: number[] }>;
  wizard_spellbook: { initial_spells: number; spells_per_level_up: number };
  caster_types: Record<string, 'full' | 'half' | 'pact'>;
}

/** Slot incantesimi disponibili (per livello incantesimo 1–9) */
export interface SpellSlots {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  level6: number;
  level7: number;
  level8: number;
  level9: number;
}

/** Stato di un singolo slot (max = disponibili, current = usati) */
export interface SpellSlot {
  max: number;
  current: number;
}

/** Progressione incantesimi di un personaggio */
export interface SpellProgression {
  cantrips: number;
  spellsKnown: number | null;
  spellsPreparable?: number;
  preparedModifier?: string;
  wizardSpellbookSize?: number;
  spellSlots: Record<number, number>;
  pactMagic?: {
    slots: number;
    level: number;
    mysticArcanum?: number[];
  };
}

/** Tabelle di progressione incantesimi (per tipo di incantatore) */
export interface SpellcastingProgression {
  fullCaster: Record<number, SpellSlots>;
  halfCaster: Record<number, SpellSlots>;
  thirdCaster: Record<number, SpellSlots>;
  pactMagic: Record<number, { slots: number; level: number }>;
}
