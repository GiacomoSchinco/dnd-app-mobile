// ── Oggetti (items.json) ────────────────────────────────────────

export type ItemType = 'weapon' | 'armor' | 'gear' | 'consumable' | (string & {});

export type Currency = 'mo' | 'ma' | 'mr' | (string & {});

export interface ItemRaw {
  id: number;
  name: string;
  type: ItemType;
  weight: number;
  value: number;
  currency: Currency;
  rarity: string;
  requires_attunement: boolean;
  category: string;
  description: string;
  properties: Record<string, unknown>;
}

export interface ItemRange {
  long?: number;
  normal: number;
}

export interface WeaponProperties {
  itemType: 'weapon';
  damage?: string;
  damageType?: string;
  properties?: string[];
  range?: ItemRange;
  versatileDamage?: string;
  /** Padronanza dell'arma (regole 2024) — es. 'prosciugamento', 'vessazione' */
  mastery?: string;
  magicBonus?: number;
  extraDamage?: string;
}

export interface ArmorProperties {
  itemType: 'armor';
  armorType?: string;
  /** Classe armatura: { base, type } con type 'dex' se somma DES, 'base' altrimenti */
  ac?: { base: number; type?: string };
  /** 'svantaggio' se l'armatura penalizza la furtività */
  stealth?: string;
  strength?: number;
}

export interface AmmunitionProperties {
  itemType: 'ammunition';
  ammunitionType?: string;
  damageBonus?: string;
  magicBonus?: number;
}

export interface ConsumableProperties {
  itemType: 'consumable';
  effect?: string;
}

export interface GearProperties {
  itemType: 'gear';
  capacity?: string;
}

export type ItemTypeName =
  | 'weapon'
  | 'armor'
  | 'gear'
  | 'consumable'
  | 'magic'
  | 'tool'
  | 'ammunition'
  | 'currency'
  | (string & {});

export type ItemProperties =
  | WeaponProperties
  | ArmorProperties
  | AmmunitionProperties
  | ConsumableProperties
  | GearProperties
  | Record<string, unknown>;

/** Definizione di un oggetto pronta per l'uso nella UI */
export interface ItemDefinition {
  id: number;
  name: string;
  type: ItemTypeName;
  weight: number;
  value: number;
  currency: 'mo' | 'ma' | 'mr' | (string & {});
  rarity: string;
  requiresAttunement: boolean;
  category: string;
  description: string;
  properties: ItemProperties;
}
