// ── Incantesimi (spells.json) ───────────────────────────────────

export type SpellSchool =
  | 'abjuration'
  | 'conjuration'
  | 'divination'
  | 'enchantment'
  | 'evocation'
  | 'illusion'
  | 'necromancy'
  | 'transmutation'
  | (string & {});

export interface SpellRaw {
  name: string;
  school: SpellSchool;
  level: number;
  classes: string[];
  casting: string;
  ritual: boolean;
  range: string;
  components: string[];
  materials: string | null;
  duration: string;
  concentration: boolean;
  source: string;
  description: string;
  /** Potenziamento a slot superiori — non sempre presente */
  upgrade?: string;
}

/** Tipo runtime di un incantesimo = SpellRaw (allineato al JSON) */
export type Spell = SpellRaw;

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
