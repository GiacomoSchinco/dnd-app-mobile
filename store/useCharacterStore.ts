import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CharacterState, Character, ClassName } from '../types';
import { fileSystemStorage } from './file-system-storage';

let counter = 0;
function uid(): string {
  counter += 1;
  return `pg_${Date.now()}_${counter}`;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set) => ({
      characters: [],
      activeCharacterId: null,

      createCharacter: (name, className, level = 1) => {
        const newChar: Character = {
          id: uid(),
          name,
          classes: [{ className: className as ClassName, level }],
          level,
          race: undefined,
          background: undefined,
          abilities: {
            strength: 10, dexterity: 10, constitution: 10,
            intelligence: 10, wisdom: 10, charisma: 10,
          },
          proficiencies: { armor: [], weapons: [], tools: [], skills: [], savingThrows: [] },
          preparedSpells: [],
          favoriteSpells: [],
          spellSlots: {},
          feats: [],
          epicBoons: [],
        };
        set((s) => ({ characters: [...s.characters, newChar] }));
      },

      deleteCharacter: (id) => {
        set((s) => ({
          characters: s.characters.filter((c) => c.id !== id),
          activeCharacterId: s.activeCharacterId === id ? null : s.activeCharacterId,
        }));
      },

      setActiveCharacterId: (id) => set({ activeCharacterId: id }),

      updateCharacter: (id, updates) => {
        set((s) => ({
          characters: s.characters.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      togglePreparedSpell: (_slug) => { /* TODO */ },
      toggleFavoriteSpell: (_slug) => { /* TODO */ },
      useSpellSlot: (_level) => { /* TODO */ },
      restoreSpellSlots: (_level) => { /* TODO */ },
    }),
    {
      name: 'dnd-characters',
      storage: createJSONStorage(() => fileSystemStorage),
    },
  ),
);
