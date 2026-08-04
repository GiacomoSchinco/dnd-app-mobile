import type { Ability, AbilityAbbreviation, AbilityScores } from './ability';
import type { SkillName } from './skill';
import type { EffectRaw } from './effects';
import type { SpellSlot, SpellProgression } from './spellcasting';

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

// ═══════════════════════════════════════════════════════════════
//  MODELLO COMPLETO DEL PERSONAGGIO — "scheletro di tutto".
//  Ogni sezione riflette i dati/regole in `lib/data/*.json` +
//  `lib/rules/*.ts`. I campi nuovi sono opzionali per non rompere
//  il salvataggio esistente; `lib/rules/character-builder.ts`
//  li valorizza via `buildCharacterSheet()`.
// ═══════════════════════════════════════════════════════════════

// ── Classi (classes.json + progression.json + subclasses.json) ─

/** Una singola classe nel personaggio (es. Mago 5) */
export interface CharacterClass {
  className: ClassName;
  level: number;
  /** Nome della sottoclasse (es. 'Scuola dell'Evocazione') */
  subclass?: string;
  /** Id della sottoclasse nei dati (subclasses.id) */
  subclassId?: number;
  /** Dado vita della classe (6 | 8 | 10 | 12) — da classes.json */
  hitDie?: number;
}

// ── Razza / Lineage (races.json + effects.json) ────────────────

export interface CharacterRace {
  raceId: number;
  raceName: string;
  lineageId?: number;
  lineageName?: string;
  size: string;
  speed: number;
  speedUnit: string;
  /** Effetti risolti (razza + lineage) da effects.json */
  effects: EffectRaw[];
}

// ── Background (backgrounds.json) ──────────────────────────────

export interface CharacterBackground {
  backgroundId: number;
  name: string;
  skills: SkillName[];
  toolProficiency?: { type: string; toolId?: string; category?: string };
  featId?: number;
  featName?: string;
  equipmentPresetId?: number;
}

// ── Competenze (proficiencies) ─────────────────────────────────

export interface CharacterProficiencies {
  armor: ArmorType[];
  weapons: WeaponType[];
  tools: string[];
  skills: SkillName[];
  savingThrows: Ability[];
  languages: string[];
}

// ── Punti ferita ───────────────────────────────────────────────

export interface HitPoints {
  /** PF massimi (1° livello = dado vita max + mod COS, poi media + mod COS) */
  max: number;
  current: number;
  temporary: number;
  /** Dadi vita totali (uno per livello di classe) e residui dopo i riposi */
  hitDiceMax: number;
  hitDiceCurrent: number;
  /** Es. 'd12' — dado vita della classe principale */
  hitDie: string;
}

// ── Risorse di classe (Ira, Ki, Ispirazione Bardica, Punti Fortuna…) ──

export interface CharacterResource {
  label: string;
  max: number;
  current: number;
  /** Quando si recupera: 'short_rest' | 'long_rest' | 'none' | custom */
  resetOn?: string;
}

// ── Sensi / Difese (effetti risolti) ───────────────────────────

export interface CharacterSenses {
  darkvision?: number;
  blindsight?: number;
  truesight?: number;
  tremorsense?: number;
  /** Unità di misura (es. 'meters') */
  unit: string;
}

export interface CharacterDefenses {
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];
  conditionImmunities: string[];
}

// ── Incantesimi (spellcasting.json + spells.json) ──────────────

export interface CharacterSpellcasting {
  /** Caratteristica da incantatore (es. 'charisma') */
  ability: Ability;
  /** Progressione calcolata (trucchetti, incantesimi noti, slot, pact magic…) */
  progression?: SpellProgression;
  /** Slot per livello incantesimo (max = disponibili, current = usati) */
  slotDetails: Record<number, SpellSlot>;
  /** Incantesimi noti / nel libro (Mago) */
  knownSpells: string[];
  /** Incantesimi preparati */
  preparedSpells: string[];
  /** Incantesimi preferiti (bookmark UI) */
  favoriteSpells: string[];
}

// ── Equipaggiamento / Denaro (equipment_preset.json + items.json) ──

export interface EquipmentItem {
  itemId: number;
  name: string;
  quantity: number;
  equipped: boolean;
}

export interface CharacterMoney {
  /** Monete d'oro */
  mo: number;
  /** Monete d'argento */
  ma: number;
  /** Monete di rame */
  mr: number;
}

// ── Scelte fatte in creazione (per riproducibilità) ────────────

export interface CharacterChoices {
  /** Boost abilità applicati dal background */
  abilityBoosts?: { ability: Ability; amount: 1 | 2 }[];
  /** ASI applicati (5.5e: +2 a una caratteristica oppure +1 a due) */
  asiBoosts?: { ability: Ability; amount: 1 | 2 }[];
  /** Competenze abilità scelte (classe / razza / talenti) */
  skillChoices?: SkillName[];
  /** Competenze strumenti scelte */
  toolChoices?: string[];
  /** Talento origine scelto (es. da effetto "Versatile") */
  originFeatChoice?: string;
  /** Scelta per i feat con requires_choice */
  featChoice?: string;
  /** Incantesimi scelti come noti/preparati */
  spellChoices?: string[];
}

// ── IL MODELLO COMPLETO ────────────────────────────────────────

/** Modello completo di un personaggio (salvato nello store) */
export interface Character {
  id: string;
  name: string;

  // Livello e classi
  /** Livello totale (somma dei livelli di tutte le classi) */
  level: number;
  classes: CharacterClass[];

  // Razza / lineage
  race?: string;
  raceId?: number;
  lineage?: string;
  lineageId?: number;

  // Background
  background?: string;
  backgroundId?: number;

  // Abilità (punteggi finali, boost inclusi)
  abilities: AbilityScores;

  // Statistiche derivate (calcolate in buildCharacterSheet)
  hitPoints?: HitPoints;
  /** Bonus di competenza (da progression.json shared) */
  proficiencyBonus?: number;
  armorClass?: number;
  initiative?: number;
  speed?: number;
  size?: string;
  senses?: CharacterSenses;
  defenses?: CharacterDefenses;

  // Competenze
  proficiencies: CharacterProficiencies;

  // Talenti / Doni epici
  feats?: string[];
  epicBoons?: string[];

  // Tratti (effetti risolti: razza + lineage + talenti)
  effects?: EffectRaw[];

  // Incantesimi
  spellcasting?: CharacterSpellcasting;
  spellSlots: Record<number, SpellSlot>;
  preparedSpells: string[];
  favoriteSpells: string[];

  // Risorse di classe (Ira, Ki, …)
  resources?: Record<string, CharacterResource>;

  // Equipaggiamento e denaro
  equipment?: EquipmentItem[];
  money?: CharacterMoney;

  // Scelte di creazione
  choices?: CharacterChoices;

  // Note / storia
  notes?: string;
}

// ── Bozza di creazione (input del wizard) ──────────────────────

/**
 * Input completi per creare un personaggio (wizard → `createCharacterFull`).
 * Strutturalmente compatibile con RaceChoice/ClassChoice/BackgroundChoice/
 * AbilityAssignment di `lib/rules/character-builder.ts`.
 */
export interface CharacterDraft {
  name: string;
  race: { raceId?: number; raceName?: string; lineageId?: number };
  classChoice: { classId?: number; className?: string; subclassId?: number; level: number };
  background: { backgroundId: number; chosenSkills?: string[] };
  /** Skill di classe scelte (competenze dalla classe) */
  classSkills?: SkillName[];
  /** Tiro del dado vita al 1° livello (opzionale: se assente, PF = dado MAX + CON) */
  hpRoll?: number;
  abilities: {
    method: 'standard' | 'point_buy' | 'manual';
    scores: AbilityScores;
    boosts?: { ability: Ability; amount: 1 | 2 }[];
    asiBoosts?: { ability: Ability; amount: 1 | 2 }[];
    allowedBoosts?: AbilityAbbreviation[];
    distributionModes?: string[];
  };
}

/** Stato dello store dei personaggi */
export interface CharacterState {
  characters: Character[];
  activeCharacterId: string | null;

  createCharacter: (name: string, className: ClassName, level?: number) => void;
  /** Crea un personaggio COMPLETO dal wizard (buildCharacter + buildCharacterSheet) */
  createCharacterFull: (draft: CharacterDraft) => Character | null;
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
  /** Crea un personaggio COMPLETO dal wizard (buildCharacter + buildCharacterSheet) */
  createCharacterFull: (draft: CharacterDraft) => Character | null;
  deleteCharacter: (id: string) => void;
  updateCharacter: (id: string, updates: Partial<Omit<Character, 'id'>>) => void;
}
