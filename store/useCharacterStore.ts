import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fileSystemStorage } from './file-system-storage';
import { getSpellProgression } from '../lib/rules/spellcasting';
import type { Character, SpellSlot, CharacterState, ClassName, AbilityScores } from '../types';

function defaultAbilityScores(): AbilityScores {
  return { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 };
}

/** Migra vecchi personaggi (formato con `class: string`) al nuovo formato (`classes: CharacterClass[]`) */
function migrateCharacter(old: Record<string, unknown>): Character {
  // Se ha già il nuovo formato, ritorna direttamente
  if (Array.isArray(old.classes)) {
    return {
      ...old,
      abilities: (old.abilities as AbilityScores) ?? defaultAbilityScores(),
      proficiencies: (old.proficiencies as Character['proficiencies']) ?? {
        armor: [], weapons: [], tools: [], skills: [], savingThrows: [],
      },
    } as unknown as Character;
  }

  // Migrazione dal vecchio formato (class: string)
  const className = (old.class as string)?.toLowerCase() as ClassName || 'wizard';
  return {
    id: old.id as string,
    name: old.name as string,
    classes: [{ className, level: (old.level as number) || 1 }],
    level: (old.level as number) || 1,
    abilities: defaultAbilityScores(),
    proficiencies: { armor: [], weapons: [], tools: [], skills: [], savingThrows: [] },
    preparedSpells: (old.preparedSpells as string[]) || [],
    favoriteSpells: (old.favoriteSpells as string[]) || [],
    spellSlots: (old.spellSlots as Record<number, SpellSlot>) || {},
  };
}

/** Converts getSpellProgression() output to store-friendly SpellSlot format */
function buildSpellSlots(className: string, level: number): Record<number, SpellSlot> {
  const slots: Record<number, SpellSlot> = {};
  for (let i = 1; i <= 9; i++) {
    slots[i] = { max: 0, current: 0 };
  }
  const prog = getSpellProgression(className, level);
  for (const [lvl, max] of Object.entries(prog.spellSlots)) {
    slots[Number(lvl)] = { max: max as number, current: max as number };
  }
  return slots;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      characters: [],
      activeCharacterId: null,

      createCharacter: (name, className, level = 1) => {
        const id = Math.random().toString(36).substring(2, 9);
        const clsName = className.toLowerCase() as ClassName;
        const newChar: Character = {
          id,
          name,
          classes: [{ className: clsName, level }],
          level,
          abilities: defaultAbilityScores(),
          proficiencies: {
            armor: [],
            weapons: [],
            tools: [],
            skills: [],
            savingThrows: [],
          },
          preparedSpells: [],
          favoriteSpells: [],
          spellSlots: buildSpellSlots(clsName, level),
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
            // If level changed, recalculate slots using class-aware progression
            if (updates.level && !updates.spellSlots) {
              const mainClass = c.classes?.[0]?.className || 'wizard';
              updated.spellSlots = buildSpellSlots(mainClass, updates.level);
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
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as { characters?: Record<string, unknown>[]; activeCharacterId?: string | null };
        
        if (version === 0) {
          // Migrazione dal vecchio formato (class: string) al nuovo (classes: CharacterClass[])
          const characters = (state.characters || []).map(migrateCharacter);
          return { characters, activeCharacterId: state.activeCharacterId ?? null } as CharacterState;
        }

        // Se è già versione 1, assicura che tutti i personaggi siano migrati
        const characters = (state.characters || []).map((c) => migrateCharacter(c as Record<string, unknown>));
        return { characters, activeCharacterId: state.activeCharacterId ?? null } as CharacterState;
      },
    }
  )
);
