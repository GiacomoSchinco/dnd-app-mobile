import { useState } from 'react';
import type { Spell } from '../../../types';
import { spellMatchesClass } from './types';

/**
 * Stato dei filtri magie (condiviso da Compendio, scheda Magie del PG e
 * schermata "Gestisci magie"). I setter sono gli stessi di useState.
 */
export function useSpellFilters() {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [showPreparedOnly, setShowPreparedOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  return {
    search,
    setSearch,
    levelFilter,
    setLevelFilter,
    classFilter,
    setClassFilter,
    showPreparedOnly,
    setShowPreparedOnly,
    showFavoritesOnly,
    setShowFavoritesOnly,
  };
}

type ApplyOptions = {
  search: string;
  levelFilter: number | null;
  classFilter?: string | null;
  /** Classe "bloccata" del PG attivo (ha precedenza sul filtro manuale) */
  lockedClass?: string | null;
  showPreparedOnly?: boolean;
  showFavoritesOnly?: boolean;
  prepared?: string[];
  favorites?: string[];
};

/** Applica i filtri a una lista di incantesimi (ricerca, livello, classe, preparate, preferite) */
export function applySpellFilters(list: Spell[], opts: ApplyOptions): Spell[] {
  let result = list;

  if (opts.search) {
    const q = opts.search.toLowerCase();
    result = result.filter((s) => s.name.toLowerCase().includes(q));
  }
  if (opts.levelFilter !== null) {
    result = result.filter((s) => s.level === opts.levelFilter);
  }
  // Classe "bloccata" del PG (ha precedenza) oppure filtro manuale
  const classFilter = opts.lockedClass ?? opts.classFilter;
  if (classFilter) {
    result = result.filter((s) => spellMatchesClass(s, classFilter));
  }
  if (opts.showPreparedOnly) {
    result = result.filter((s) => (opts.prepared ?? []).includes(s.name));
  }
  if (opts.showFavoritesOnly) {
    result = result.filter((s) => (opts.favorites ?? []).includes(s.name));
  }

  return result;
}
