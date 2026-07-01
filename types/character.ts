// ── Base Types ──────────────────────────────────────────────────

export type ClassName =
  | 'barbarian'
  | 'bard'
  | 'cleric'
  | 'druid'
  | 'fighter'
  | 'monk'
  | 'paladin'
  | 'ranger'
  | 'rogue'
  | 'sorcerer'
  | 'warlock'
  | 'wizard';

export type Ability =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma';

export type ArmorType = 'light' | 'medium' | 'heavy' | 'shield';
export type WeaponType = 'simple' | 'martial';

// ── Ability Scores ─────────────────────────────────────────────

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

// ── Class Definitions ──────────────────────────────────────────

/** Base per future implementazioni di sottoclassi (es. Paladino → Giuramento di Fedeltà) */
export interface SubclassDefinition {
  name: string;
  className: ClassName;
  description?: string;
  source?: string;
}

/** Base per futuri talenti (feats) */
export interface Feat {
  name: string;
  description?: string;
  prerequisites?: string[];
  source?: string;
}

export interface ClassFeature {
  name: string;
  level: number;
  description: string;
  scalingType?: 'characterLevel' | 'classLevel' | 'proficiencyBonus';
}

export interface ClassDefinition {
  name: ClassName;
  label: string;
  hitDie: 6 | 8 | 10 | 12;
  primaryAbility: Ability;
  prerequisites: Partial<Record<Ability, number>>;
  isSpellcaster: boolean;
  spellcastingType?: 'full' | 'half' | 'third' | 'pact';
  spellAbility?: Ability;
  spellPreparation?: 'always' | 'longRest';
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    savingThrows: Ability[];
    skills: number;
  };
  levelFeatures: Record<number, ClassFeature[]>;
  hitPoints: {
    average: number;
    description: string;
  };
}

// ── Spell Slots ─────────────────────────────────────────────────

export interface SpellSlot {
  max: number;
  current: number;
}

/** Slot incantesimi per livello (usato per progressione e tabelle) */
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

export interface SpellcastingProgression {
  fullCaster: Record<number, SpellSlots>;
  halfCaster: Record<number, SpellSlots>;
  thirdCaster: Record<number, SpellSlots>;
  pactMagic: Record<number, { slots: number; level: number }>;
}

// ── Character ──────────────────────────────────────────────────

export interface CharacterClass {
  className: ClassName;
  level: number;
  subclass?: string;
}

export interface Character {
  id: string;
  name: string;
  classes: CharacterClass[];
  /** Livello totale (somma dei livelli di tutte le classi) */
  level: number;
  race?: string;
  background?: string;
  abilities: AbilityScores;
  proficiencies: {
    armor: ArmorType[];
    weapons: WeaponType[];
    tools: string[];
    skills: string[];
    savingThrows: Ability[];
  };
  preparedSpells: string[];
  favoriteSpells: string[];
  spellSlots: Record<number, SpellSlot>;
  feats?: string[];
  epicBoons?: string[];
}

// ── Store Types ─────────────────────────────────────────────────

export interface CharacterState {
  characters: Character[];
  activeCharacterId: string | null;

  createCharacter: (name: string, className: ClassName, level?: number) => void;
  deleteCharacter: (id: string) => void;
  setActiveCharacterId: (id: string | null) => void;
  updateCharacter: (id: string, updates: Partial<Omit<Character, 'id'>>) => void;

  togglePreparedSpell: (spellSlug: string) => void;
  toggleFavoriteSpell: (spellSlug: string) => void;
  useSpellSlot: (level: number) => void;
  restoreSpellSlots: (level?: number) => void;
}

export interface ActiveCharacterActions {
  activeChar: Character | null;
  characters: Character[];
  activeCharacterId: string | null;
  setActiveCharacterId: (id: string | null) => void;
  togglePreparedSpell: (slug: string) => void;
  toggleFavoriteSpell: (slug: string) => void;
  useSpellSlot: (level: number) => void;
  restoreSpellSlots: (level?: number) => void;
  createCharacter: (name: string, className: ClassName, level?: number) => void;
  deleteCharacter: (id: string) => void;
  updateCharacter: (id: string, updates: Partial<Omit<Character, 'id'>>) => void;
}
