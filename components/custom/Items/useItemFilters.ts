import { useState } from 'react';
import type { ItemDefinition } from '../../../types';

/**
 * Stato dei filtri oggetti (condiviso da Compendio `ItemsScreen` e schermata
 * "Gestisci oggetti"). I setter sono gli stessi di useState.
 */
export function useItemFilters() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [rarityFilter, setRarityFilter] = useState<string | null>(null);
  return { search, setSearch, typeFilter, setTypeFilter, rarityFilter, setRarityFilter };
}

type ApplyOptions = {
  search: string;
  typeFilter?: string | null;
  rarityFilter?: string | null;
};

/** Applica i filtri a una lista di oggetti (ricerca, tipo, rarità) */
export function applyItemFilters(list: ItemDefinition[], opts: ApplyOptions): ItemDefinition[] {
  let result = list;
  if (opts.search) {
    const q = opts.search.toLowerCase();
    result = result.filter((it) => it.name.toLowerCase().includes(q));
  }
  if (opts.typeFilter) {
    result = result.filter((it) => it.type === opts.typeFilter);
  }
  if (opts.rarityFilter) {
    result = result.filter((it) => it.rarity === opts.rarityFilter);
  }
  return result;
}
