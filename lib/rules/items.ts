import itemsData from '../../assets/data/items.json';
import type { ItemRawData, ItemDefinition, ItemProperties } from '../../types';

// ── Parsing properties ─────────────────────────────────────────

function parseProperties(raw: string | ItemProperties): ItemProperties {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as ItemProperties;
    } catch {
      return {};
    }
  }
  return raw;
}

// ── Conversione ────────────────────────────────────────────────

function convertRawItem(raw: ItemRawData): ItemDefinition {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type as ItemDefinition['type'],
    weight: raw.weight,
    value: raw.value,
    currency: raw.currency as ItemDefinition['currency'],
    rarity: raw.rarity,
    requiresAttunement: raw.requires_attunement,
    category: raw.category,
    description: raw.description,
    properties: parseProperties(raw.properties),
  };
}

// ── Dati esportati ──────────────────────────────────────────

export const ITEMS_DATA = (itemsData as ItemRawData[]).map(convertRawItem);

/** Cerca un oggetto per ID */
export function getItem(id: number): ItemDefinition | undefined {
  return ITEMS_DATA.find(i => i.id === id);
}

/** Cerca oggetti per nome (case-insensitive, parziale) */
export function getItemsByName(name: string): ItemDefinition[] {
  const lower = name.toLowerCase();
  return ITEMS_DATA.filter(i => i.name.toLowerCase().includes(lower));
}

/** Restituisce tutti gli oggetti */
export function getAllItems(): ItemDefinition[] {
  return ITEMS_DATA;
}

/** Filtra oggetti per tipo */
export function getItemsByType(type: ItemDefinition['type']): ItemDefinition[] {
  return ITEMS_DATA.filter(i => i.type === type);
}

/** Filtra oggetti per categoria (es. 'sword', 'light armor') */
export function getItemsByCategory(category: string): ItemDefinition[] {
  return ITEMS_DATA.filter(i => i.category === category);
}

/** Ottiene le proprietà weapn di un oggetto (se è un'arma) */
export function getWeaponProperties(item: ItemDefinition): { damage?: string; damageType?: string; properties?: string[] } | null {
  if (item.type !== 'weapon') return null;
  const props = item.properties as Record<string, unknown>;
  return {
    damage: props.damage as string | undefined,
    damageType: props.damageType as string | undefined,
    properties: props.properties as string[] | undefined,
  };
}

/** Ottiene le proprietà armatura di un oggetto (se è un'armatura) */
export function getArmorProperties(item: ItemDefinition): { armorClass?: number; armorType?: string; maxDexBonus?: number } | null {
  if (item.type !== 'armor') return null;
  const props = item.properties as Record<string, unknown>;
  return {
    armorClass: props.armorClass as number | undefined,
    armorType: props.armorType as string | undefined,
    maxDexBonus: props.maxDexBonus as number | undefined,
  };
}
