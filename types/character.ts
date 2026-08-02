import type { Ability, AbilityScores } from './ability';
import type { SpellSlots, SpellSlot } from './spellcasting';

// ── Classi di personaggio (className) ──────────────────────────

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

export type ArmorType = 'light' | 'medium' | 'heavy' | 'shield';
export type WeaponType = 'simple' | 'martial';

// ── Modello del personaggio (runtime) ───────────────────────────

/** Una singola classe nel personaggio (es. Mago 5) */
export interface CharacterClass {
  className: ClassName;
  level: number;
  /** Nome della sottoclasse (es. 'Scuola dell'Evocazione') */
  subclass?: string;
  /** Id della sottoclasse nei dati */
  subclassId?: number;
}

/** Modello completo di un personaggio (salvato nello store) */
export interface Character {
  id: string;
  name: string;
  classes: CharacterClass[];
  /** Livello totale (somma dei livelli di tutte le classi) */
  level: number;
  race?: string;
  background?: string;
  raceId?: number;
  backgroundId?: number;
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

/** Stato dello store dei personaggi */
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

/** Azioni esposte per il personaggio attivo */
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
