import { create } from 'zustand';
import type { CharacterState } from '../types';

export const useCharacterStore = create<CharacterState>()(() => ({
  characters: [],
  activeCharacterId: null,

  createCharacter: (_name, _className, _level) => {
    // TODO: da implementare con la nuova logica di salvataggio
  },

  deleteCharacter: (_id) => {
    // TODO: da implementare con la nuova logica di salvataggio
  },

  setActiveCharacterId: (_id) => {
    // TODO: da implementare con la nuova logica di salvataggio
  },

  updateCharacter: (_id, _updates) => {
    // TODO: da implementare con la nuova logica di salvataggio
  },

  togglePreparedSpell: (_spellSlug) => {
    // TODO: da implementare con la nuova logica di salvataggio
  },

  toggleFavoriteSpell: (_spellSlug) => {
    // TODO: da implementare con la nuova logica di salvataggio
  },

  useSpellSlot: (_level) => {
    // TODO: da implementare con la nuova logica di salvataggio
  },

  restoreSpellSlots: (_level) => {
    // TODO: da implementare con la nuova logica di salvataggio
  },
}));
