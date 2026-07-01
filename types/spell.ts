import spellsData from '../assets/spells.json';

export type Spell = (typeof spellsData)[number];

/** Solo classi che possono lanciare incantesimi */
export type SpellCastingClass =
  | 'wizard'
  | 'sorcerer'
  | 'bard'
  | 'cleric'
  | 'druid'
  | 'paladin'
  | 'ranger'
  | 'warlock';

export interface SpellProgression {
  cantrips: number;
  spellsKnown: number | null;
  spellsPreparable?: number;
  wizardSpellbookSize?: number;
  preparedModifier?: 'int' | 'wis' | 'cha';
  spellSlots: Record<number, number>;
  pactMagic?: {
    slots: number;
    level: number;
    mysticArcanum?: number[];
  };
}
