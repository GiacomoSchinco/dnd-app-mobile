import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fileSystemStorage } from './file-system-storage';

export interface SpellSlot {
  max: number;
  current: number;
}

export interface Character {
  id: string;
  name: string;
  class: string; // e.g. "druid", "wizard", "bard", etc.
  level: number;
  preparedSpells: string[]; // array of spell slugs
  favoriteSpells: string[]; // array of spell slugs
  spellSlots: Record<number, SpellSlot>; // level 1-9 spell slots
}

interface CharacterState {
  characters: Character[];
  activeCharacterId: string | null;
  
  // Actions
  createCharacter: (name: string, className: string, level?: number) => void;
  deleteCharacter: (id: string) => void;
  setActiveCharacterId: (id: string | null) => void;
  updateCharacter: (id: string, updates: Partial<Omit<Character, 'id'>>) => void;
  
  // Active Character helpers (operate on activeCharacterId)
  togglePreparedSpell: (spellSlug: string) => void;
  toggleFavoriteSpell: (spellSlug: string) => void;
  useSpellSlot: (level: number) => void;
  restoreSpellSlots: (level?: number) => void; // if level omitted, restores all (Long Rest)
}

// Default spell slots based on D&D 5e full caster progression (Wizard, Cleric, Druid, Sorcerer)
const getDefaultSpellSlots = (level: number): Record<number, SpellSlot> => {
  const slots: Record<number, SpellSlot> = {};
  for (let i = 1; i <= 9; i++) {
    slots[i] = { max: 0, current: 0 };
  }

  // Full D&D 5e progression table
  const progression: Record<number, Record<number, number>> = {
    1:  { 1: 2 },
    2:  { 1: 3 },
    3:  { 1: 4, 2: 2 },
    4:  { 1: 4, 2: 3 },
    5:  { 1: 4, 2: 3, 3: 2 },
    6:  { 1: 4, 2: 3, 3: 3 },
    7:  { 1: 4, 2: 3, 3: 3, 4: 1 },
    8:  { 1: 4, 2: 3, 3: 3, 4: 2 },
    9:  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
    10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
    12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
    13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
    14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
    15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
    16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
    17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
    18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
    19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
    20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
  };

  const lvlSlots = progression[level] || {};
  for (const [lvl, max] of Object.entries(lvlSlots)) {
    slots[Number(lvl)] = { max, current: max };
  }

  return slots;
};

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      characters: [],
      activeCharacterId: null,

      createCharacter: (name, className, level = 1) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newChar: Character = {
          id,
          name,
          class: className.toLowerCase(),
          level,
          preparedSpells: [],
          favoriteSpells: [],
          spellSlots: getDefaultSpellSlots(level),
        };
        
        set((state) => ({
          characters: [...state.characters, newChar],
          activeCharacterId: state.activeCharacterId ?? id, // Set active if it's the first one
        }));
      },

      deleteCharacter: (id) => {
        set((state) => {
          const nextCharacters = state.characters.filter((c) => c.id !== id);
          let nextActiveId = state.activeCharacterId;
          if (state.activeCharacterId === id) {
            nextActiveId = nextCharacters.length > 0 ? nextCharacters[0].id : null;
          }
          return {
            characters: nextCharacters,
            activeCharacterId: nextActiveId,
          };
        });
      },

      setActiveCharacterId: (id) => {
        set({ activeCharacterId: id });
      },

      updateCharacter: (id, updates) => {
        set((state) => ({
          characters: state.characters.map((c) => {
            if (c.id !== id) return c;
            const updated = { ...c, ...updates };
            // If level changed, let's also recalculate slots if they weren't explicitly updated
            if (updates.level && !updates.spellSlots) {
              updated.spellSlots = getDefaultSpellSlots(updates.level);
            }
            return updated;
          }),
        }));
      },

      togglePreparedSpell: (spellSlug) => {
        const { activeCharacterId, characters } = get();
        if (!activeCharacterId) return;

        set({
          characters: characters.map((c) => {
            if (c.id !== activeCharacterId) return c;
            const isPrepared = c.preparedSpells.includes(spellSlug);
            return {
              ...c,
              preparedSpells: isPrepared
                ? c.preparedSpells.filter((slug) => slug !== spellSlug)
                : [...c.preparedSpells, spellSlug],
            };
          }),
        });
      },

      toggleFavoriteSpell: (spellSlug) => {
        const { activeCharacterId, characters } = get();
        if (!activeCharacterId) return;

        set({
          characters: characters.map((c) => {
            if (c.id !== activeCharacterId) return c;
            const isFav = c.favoriteSpells.includes(spellSlug);
            return {
              ...c,
              favoriteSpells: isFav
                ? c.favoriteSpells.filter((slug) => slug !== spellSlug)
                : [...c.favoriteSpells, spellSlug],
            };
          }),
        });
      },

      useSpellSlot: (level) => {
        const { activeCharacterId, characters } = get();
        if (!activeCharacterId) return;

        set({
          characters: characters.map((c) => {
            if (c.id !== activeCharacterId) return c;
            const slot = c.spellSlots[level];
            if (!slot || slot.current <= 0) return c;
            return {
              ...c,
              spellSlots: {
                ...c.spellSlots,
                [level]: { ...slot, current: slot.current - 1 },
              },
            };
          }),
        });
      },

      restoreSpellSlots: (level) => {
        const { activeCharacterId, characters } = get();
        if (!activeCharacterId) return;

        set({
          characters: characters.map((c) => {
            if (c.id !== activeCharacterId) return c;
            const updatedSlots = { ...c.spellSlots };
            
            if (level !== undefined) {
              const slot = updatedSlots[level];
              if (slot) {
                updatedSlots[level] = { ...slot, current: slot.max };
              }
            } else {
              // Long Rest: restore all
              for (const lvl in updatedSlots) {
                updatedSlots[lvl] = { ...updatedSlots[lvl], current: updatedSlots[lvl].max };
              }
            }
            
            return {
              ...c,
              spellSlots: updatedSlots,
            };
          }),
        });
      },
    }),
    {
      name: 'dungeon-craft-characters',
      storage: createJSONStorage(() => fileSystemStorage),
    }
  )
);
