import type { ItemDefinition } from '../../../types';

export type { ItemDefinition };

export const TYPE_LABELS: Record<string, string> = {
  weapon: 'Arma',
  armor: 'Armatura',
  consumable: 'Consumabile',
  gear: 'Equipaggiamento',
  tool: 'Attrezzo',
  ammunition: 'Munizione',
  currency: 'Valuta',
};

export const RARITY_LABELS: Record<string, string> = {
  common: 'Comune',
  uncommon: 'Non comune',
  rare: 'Raro',
  very_rare: 'Molto raro',
  legendary: 'Leggendario',
};

export const TYPE_COLORS: Record<string, string> = {
  weapon: '#D94A4A',
  armor: '#4A90D9',
  consumable: '#4A9E4A',
  gear: '#8B6CC9',
  tool: '#D97A4A',
  ammunition: '#6CB6D9',
  currency: '#D9A84A',
};

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type] || '#888';
}

export const RARITY_COLORS: Record<string, string> = {
  common: '#8B8B8B',
  uncommon: '#4A9E4A',
  rare: '#4A7AD9',
  very_rare: '#8B4AD9',
  legendary: '#D9A84A',
};

export const CATEGORY_LABELS: Record<string, string> = {
  sword: 'Spada',
  axe: 'Ascia',
  dagger: 'Pugnale',
  hammer: 'Martello',
  mace: 'Mazza',
  club: 'Clava',
  spear: 'Lancia',
  polearm: 'Alabarda',
  bow: 'Arco',
  crossbow: 'Balestra',
  sling: 'Fionda',
  dart: 'Dardo',
  javelin: 'Giavellotto',
  sickle: 'Falce',
  flail: 'Mazzafrusto',
  whip: 'Frusta',
  quarterstaff: 'Bastone ferrato',
  arrow: 'Freccia',
  bolt: 'Dardo da balestra',
  bullet: 'Palla da fionda',
  'light armor': 'Armatura leggera',
  'medium armor': 'Armatura media',
  'heavy armor': 'Armatura pesante',
  shield: 'Scudo',
  potion: 'Pozione',
  scroll: 'Pergamena',
  poison: 'Veleno',
  food: 'Cibo',
  beverage: 'Bevanda',
  clothing: 'Vestito',
  container: 'Contenitore',
  tool: 'Attrezzo',
  instrument: 'Strumento musicale',
  book: 'Libro',
  jewelry: 'Gioiello',
  gem: 'Gemma',
  accessory: 'Accessorio',
  rope: 'Corda',
  lock: 'Serratura',
  writing: 'Materiale da scrittura',
  healing: 'Guarigione',
  holy: 'Simbolo sacro',
  arcane: 'Focus arcano',
  druidic: 'Focus druidico',
  game: 'Gioco',
  map: 'Mappa',
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

export function getRarityColor(rarity: string): string {
  return RARITY_COLORS[rarity] || '#888';
}

export function getTypeLabel(type: string): string {
  return TYPE_LABELS[type] || type;
}

export function getUniqueCategories(items: ItemDefinition[]): string[] {
  return [...new Set(items.map((i) => i.category))].sort();
}

export function getUniqueTypes(items: ItemDefinition[]): string[] {
  return [...new Set(items.map((i) => i.type))].sort();
}

export function getUniqueRarities(items: ItemDefinition[]): string[] {
  return [...new Set(items.map((i) => i.rarity))].sort();
}
