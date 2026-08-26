import type { Ability, AbilityAbbreviation, AbilityScores } from './ability';
import type { ClassFeatureRaw } from './class';
import type { SkillName } from './skill';
import type { EffectRaw } from './effects';
import type { FeatModifierRaw } from './feat';
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
  /** Skill con Maestria (Expertise): bonus di competenza raddoppiato */
  expertise?: SkillName[];
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
  /** Spiegazione di cosa fa la risorsa (regole) */
  description?: string;
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

/** Scelta incantesimi del talento "Iniziato alla Magia" */
export interface FeatSpellChoice {
  /** Caratteristica da incantatore scelta (INT/SAG/CAR) */
  ability: Ability;
  /** Trucchetti imparati (nomi incantesimo) */
  cantrips: string[];
  /** Incantesimo di 1° livello imparato */
  spells: string[];
}

/** Badge manuale scelto dall'utente per una magia (colore + etichetta) */
export interface ManualSpellBadge {
  color: string;
  label: string;
}

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
  /** Scelta per i feat: stringa per quelli semplici, oggetto per "Iniziato alla Magia" */
  featChoice?: string | FeatSpellChoice;
  /** Id dei talenti generali scelti (per riproducibilità) */
  generalFeatIds?: number[];
  /** Id dello stile di combattimento scelto */
  fightingStyleId?: number;
  /** Id del dono epico scelto */
  epicBoonId?: number;
  /** Scelte caratteristica per gli ASI dei talenti */
  featAsiPicks?: Record<number, Ability[]>;
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
  /** Modificatori MANUALI alle abilità (correzioni utente per errori nei dati) */
  abilityModifiers?: AbilityModifier[];
  /** Modificatori MANUALI alle skill (correzioni utente per errori nei dati) */
  skillModifiers?: SkillModifier[];

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
  /** Modificatori concessi dai talenti (granted_modifiers aggregati) */
  featModifiers?: FeatModifierRaw[];

  // Caratteristiche di classe / sottoclasse
  /** Feature di classe per livello (da progression.json/classes.json, ASI esclusi) */
  classFeatures?: { level: number; name: string; description?: string; table?: string }[];
  /** Feature della sottoclasse (da subclasses.json, con descrizione) */
  subclassFeatures?: ClassFeatureRaw[];

  // Tratti (effetti risolti: razza + lineage + talenti)
  effects?: EffectRaw[];

  // Incantesimi
  spellcasting?: CharacterSpellcasting;
  spellSlots: Record<number, SpellSlot>;
  preparedSpells: string[];
  favoriteSpells: string[];
  /** Badge manuali sulle magie (nome incantesimo → colore + etichetta) */
  spellBadges?: Record<string, ManualSpellBadge>;

  // Risorse di classe (Ira, Ki, …)
  resources?: Record<string, CharacterResource>;

  // Equipaggiamento e denaro
  equipment?: EquipmentItem[];
  money?: CharacterMoney;

  // Scelte di creazione
  choices?: CharacterChoices;

  // Note / storia
  notes?: string;
  /** Todo-list di appunti (note prese durante il gioco) */
  notesList?: NoteItem[];

  /** L'utente ha chiuso la card "Regole da verificare" per questo PG */
  manualCheckDismissed?: boolean;
}

// ── Appunti / todo-list ────────────────────────────────────────

/** Singolo appunto della todo-list del PG */
export interface NoteItem {
  id: string;
  text: string;
  done: boolean;
}

// ── Modificatori abilità (correzione manuale) ──────────────────

/** Destinatario di un modificatore: una o più abilità, oppure TUTTE ('all') */
export type AbilityModifierTarget = Ability | Ability[] | 'all';

/** Modificatore manuale a un'abilità: aggiunto dall'utente per correggere i dati */
export interface AbilityModifier {
  id: string;
  /** Etichetta libera (es. 'Correzione DM', 'Pozione di forza') */
  label: string;
  /**
   * Abilità a cui si applica (una o più), oppure 'all' per TUTTE (es. '+1 a tutto').
   * Esempi: 'strength' = solo FOR; ['strength','charisma'] = FOR+CAR; 'all' = tutte.
   */
  ability: AbilityModifierTarget;
  /** Valore del modificatore (anche negativo) */
  value: number;
}

// ── Modificatori skill (correzione manuale) ────────────────────

/** Destinatario di un modificatore di skill: una o più skill, oppure TUTTE ('all') */
export type SkillModifierTarget = SkillName | SkillName[] | 'all';

/** Modificatore manuale a una skill: aggiunto dall'utente per correggere i dati */
export interface SkillModifier {
  id: string;
  /** Etichetta libera (es. 'Talento', 'Correzione DM') */
  label: string;
  /**
   * Skill a cui si applica (una o più), oppure 'all' per TUTTE.
   * Esempi: 'perception' = solo Percezione; ['perception','insight'] = due; 'all' = tutte.
   */
  skill: SkillModifierTarget;
  /** Valore del modificatore (anche negativo) */
  value: number;
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
  /**
   * Classi del personaggio per il MULTICLASSE. La PRIMA è la classe primaria.
   * Se assente si usa `classChoice` (backward-compat, single-class).
   */
  classes?: { classId?: number; className?: string; subclassId?: number; level: number }[];
  background: { backgroundId: number; chosenSkills?: string[] };
  /** Skill di classe scelte (competenze dalla classe) */
  classSkills?: SkillName[];
  /** Strumenti scelti per la competenza a scelta del background (CHOICE) */
  bgToolChoices?: string[];
  /** Strumenti scelti per il choice_config del talento (tool_proficiency) */
  featToolChoices?: string[];
  /** Abilità scelte per il talento "Abile" (hybrid_proficiency) */
  featSkillChoices?: SkillName[];
  /** Scelta incantesimi per il talento "Iniziato alla Magia" (spellcasting) */
  featSpellChoice?: FeatSpellChoice;
  /** Competenze in abilità scelte dalla razza (es. Umano "Pluriabilità", Elfo "Sensi Acuti") */
  raceSkillChoices?: SkillName[];
  /** Id dei talenti generali scelti (uno per livello ASI) */
  generalFeatIds?: number[];
  /** Id dello stile di combattimento (Fighter/Paladin/Ranger) */
  fightingStyleId?: number;
  /** Id del dono epico (livello 19+) */
  epicBoonId?: number;
  /** Scelte caratteristica per gli ASI concessi dai talenti (chiave = feat id) */
  featAsiPicks?: Record<number, Ability[]>;
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

// ── Level up ───────────────────────────────────────────────────

/** Boost di caratteristica per un ASI durante il level-up */
export interface LevelUpAsiBoost {
  ability: Ability;
  amount: 1 | 2;
}

/** Opzioni per l'azione `applyLevelUp` (scelte fatte nel modale di level-up) */
export interface LevelUpOptions {
  /** Tiro del dado vita per il nuovo livello (se assente → media) */
  hpRoll?: number;
  /** Se il livello è un ASI e si sceglie l'ASI: boost +2 / +1+1 da applicare */
  asiBoosts?: LevelUpAsiBoost[];
  /** Se il livello è un ASI e si sceglie un talento generale: id del talento */
  generalFeatId?: number;
  /** Scelte caratteristica per l'ASI del talento scelto */
  featAsiPicks?: Ability[];
  /** Sottoclasse scelta al livello che la sblocca */
  subclassId?: number;
}

/** Stato dello store dei personaggi */
export interface CharacterState {
  characters: Character[];
  activeCharacterId: string | null;

  createCharacter: (name: string, className: ClassName, level?: number) => void;
  /** Crea un personaggio COMPLETO dal wizard (buildCharacter + buildCharacterSheet) */
  createCharacterFull: (draft: CharacterDraft) => Character | null;
  /**
   * Applica un level-up a una classe del personaggio: ricalcola le statistiche
   * derivate dall'insieme delle classi (motore condiviso) PRESERVANDO lo stato
   * runtime (PF attuali, slot consumati, risorse correnti, magie, equip).
   */
  applyLevelUp: (id: string, className: string, options?: LevelUpOptions) => void;
  deleteCharacter: (id: string) => void;
  setActiveCharacterId: (id: string | null) => void;
  updateCharacter: (id: string, updates: Partial<Omit<Character, 'id'>>) => void;

  togglePreparedSpell: (spellSlug: string) => void;
  toggleFavoriteSpell: (spellSlug: string) => void;
  setSpellBadge: (spellName: string, badge: ManualSpellBadge | null) => void;
  useSpellSlot: (level: number) => void;
  recoverSpellSlot: (level: number) => void;
  restoreSpellSlots: (level?: number) => void;

  /** Aggiunge un oggetto all'equipaggiamento del PG attivo (o ne aumenta la quantità) */
  addEquipmentItem: (itemId: number, quantity?: number) => void;
  /** Rimuove completamente un oggetto dall'equipaggiamento del PG attivo */
  removeEquipmentItem: (itemId: number) => void;
  /** Imposta la quantità di un oggetto (min 1; 0 → rimozione) */
  setEquipmentQuantity: (itemId: number, quantity: number) => void;
  /** Equipaggia / smette un oggetto del PG attivo */
  toggleEquippedItem: (itemId: number) => void;
}

/** Azioni esposte per il personaggio attivo */
export interface ActiveCharacterActions {
  activeChar: Character | null;
  characters: Character[];
  activeCharacterId: string | null;
  setActiveCharacterId: (id: string | null) => void;
  togglePreparedSpell: (slug: string) => void;
  toggleFavoriteSpell: (slug: string) => void;
  setSpellBadge: (spellName: string, badge: ManualSpellBadge | null) => void;
  useSpellSlot: (level: number) => void;
  recoverSpellSlot: (level: number) => void;
  restoreSpellSlots: (level?: number) => void;
  addEquipmentItem: (itemId: number, quantity?: number) => void;
  removeEquipmentItem: (itemId: number) => void;
  setEquipmentQuantity: (itemId: number, quantity: number) => void;
  toggleEquippedItem: (itemId: number) => void;
  createCharacter: (name: string, className: ClassName, level?: number) => void;
  /** Crea un personaggio COMPLETO dal wizard (buildCharacter + buildCharacterSheet) */
  createCharacterFull: (draft: CharacterDraft) => Character | null;
  applyLevelUp: (id: string, className: string, options?: LevelUpOptions) => void;
  deleteCharacter: (id: string) => void;
  updateCharacter: (id: string, updates: Partial<Omit<Character, 'id'>>) => void;
}
