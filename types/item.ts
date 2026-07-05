// ── Raw JSON Data Types ────────────────────────────────────────

export interface ItemRange {
  long: number;
  normal: number;
}

export interface WeaponProperties {
  damage?: string;
  itemType: 'weapon';
  damageType: string;
  properties?: string[];
  range?: ItemRange;
  versatileDamage?: string;
}

export interface ArmorProperties {
  itemType: 'armor';
  armorType: 'light' | 'medium' | 'heavy' | 'shield';
  armorClass: number;
  addsDexModifier?: boolean;
  maxDexBonus?: number;
}

export type ItemProperties = WeaponProperties | ArmorProperties | Record<string, unknown>;

export interface ItemRawData {
  id: number;
  name: string;
  type: 'weapon' | 'armor' | 'gear' | 'consumable' | 'magic' | 'tool';
  weight: number;
  value: number;
  currency: 'po' | 'mo' | 'ma';
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary';
  requires_attunement: boolean;
  category: string;
  description: string;
  properties: string | ItemProperties;
}

// ── Converted Definition ───────────────────────────────────────

export interface ItemDefinition {
  id: number;
  name: string;
  type: 'weapon' | 'armor' | 'gear' | 'consumable' | 'magic' | 'tool';
  weight: number;
  value: number;
  currency: 'po' | 'mo' | 'ma';
  rarity: string;
  requiresAttunement: boolean;
  category: string;
  description: string;
  properties: ItemProperties;
}
