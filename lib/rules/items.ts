import itemsData from '../data/items.json';
import type {
  Currency,
  ItemRaw,
  ItemType,
  ItemDefinition,
  WeaponProperties,
  ArmorProperties,
} from '../../types';

/**
 * items.ts — Gestione degli oggetti, armi e armature (items.json).
 * 368 oggetti. Valute: mo (oro), ma (argento), mr (rame).
 * Le `properties` variano in base al tipo (arma, armatura, contenitore, ...).
 */

function parseProperties(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return (raw ?? {}) as Record<string, unknown>;
}

function convertRawItem(raw: ItemRaw): ItemDefinition {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    weight: raw.weight,
    value: raw.value,
    currency: raw.currency,
    rarity: raw.rarity,
    requiresAttunement: raw.requires_attunement,
    category: raw.category,
    description: raw.description,
    properties: parseProperties(raw.properties),
  };
}

export const ITEMS_DATA: ItemDefinition[] = (itemsData as ItemRaw[]).map(convertRawItem);

/** Cerca un oggetto per ID */
export function getItem(id: number): ItemDefinition | undefined {
  return ITEMS_DATA.find((i) => i.id === id);
}

/** Cerca oggetti per nome (case-insensitive, parziale) */
export function getItemsByName(name: string): ItemDefinition[] {
  const lower = name.toLowerCase();
  return ITEMS_DATA.filter((i) => i.name.toLowerCase().includes(lower));
}

/** Restituisce tutti gli oggetti */
export function getAllItems(): ItemDefinition[] {
  return ITEMS_DATA;
}

/** Filtra oggetti per tipo */
export function getItemsByType(type: ItemType): ItemDefinition[] {
  return ITEMS_DATA.filter((i) => i.type === type);
}

/** Filtra oggetti per categoria (es. 'sword', 'light armor') */
export function getItemsByCategory(category: string): ItemDefinition[] {
  return ITEMS_DATA.filter((i) => i.category === category);
}

/** Filtra oggetti per valuta (es. 'mo') */
export function getItemsByCurrency(currency: Currency): ItemDefinition[] {
  return ITEMS_DATA.filter((i) => i.currency === currency);
}

/** Proprietà di un'arma (se l'oggetto è un'arma) */
export function getWeaponProperties(item: ItemDefinition): WeaponProperties | null {
  if (item.type !== 'weapon') return null;
  const props = item.properties as Record<string, unknown>;
  return {
    itemType: 'weapon',
    damage: props.damage as string | undefined,
    damageType: props.damageType as string | undefined,
    properties: props.properties as string[] | undefined,
    versatileDamage: props.versatileDamage as string | undefined,
    mastery: props.mastery as string | undefined,
    range: props.range as WeaponProperties['range'],
  };
}

/** Proprietà di un'armatura (se l'oggetto è un'armatura) */
export function getArmorProperties(item: ItemDefinition): ArmorProperties | null {
  if (item.type !== 'armor') return null;
  const props = item.properties as Record<string, unknown>;
  return {
    itemType: 'armor',
    ac: props.ac as ArmorProperties['ac'],
    armorType: props.armorType as string | undefined,
    stealth: props.stealth as string | undefined,
    strength: props.strength as number | undefined,
  };
}
