import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CharacterState, Character, ClassName, CharacterDraft } from '../types';
import { buildCharacter, buildCharacterSheet } from '../lib/rules/character-builder';
import { getClass } from '../lib/rules/classes';
import { getAbilityModifier } from '../lib/rules/abilities';
import { getProficiencyBonus } from '../lib/rules/progression';
import { fileSystemStorage } from './file-system-storage';

let counter = 0;
function uid(): string {
  counter += 1;
  return `pg_${Date.now()}_${counter}`;
}

/**
 * Ripara i personaggi salvati PRIMA dell'estensione del modello (es. creati con
 * `createCharacter`, che non calcolava le statistiche derivate): calcola PF,
 * bonus di competenza, CA e iniziativa quando mancanti, così anche i vecchi
 * personaggi hanno i punti ferita.
 */
function backfillDerivedStats(c: Character): Character {
  const cls = c.classes?.[0];
  if (!cls) return c;

  const classDef = getClass(cls.className);
  const level = c.level ?? cls.level ?? 1;
  const conMod = getAbilityModifier(c.abilities?.constitution ?? 10);
  const dexMod = getAbilityModifier(c.abilities?.dexterity ?? 10);
  const hitDie = classDef?.hitDie ?? cls.hitDie ?? 8;
  const average = classDef?.hitPoints?.average ?? hitDie;
  const maxHp =
    c.hitPoints?.max ??
    hitDie + conMod + (level - 1) * Math.max(average + conMod, 1);

  return {
    ...c,
    level,
    hitPoints: c.hitPoints ?? {
      max: maxHp,
      current: maxHp,
      temporary: 0,
      hitDiceMax: level,
      hitDiceCurrent: level,
      hitDie: `d${hitDie}`,
    },
    proficiencyBonus: c.proficiencyBonus ?? getProficiencyBonus(level),
    armorClass: c.armorClass ?? 10 + dexMod,
    initiative: c.initiative ?? dexMod,
  };
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

      createCharacterFull: (draft: CharacterDraft) => {
        // Orchestrazione completa: razza → classe → background → abilità
        const plan = buildCharacter({
          race: draft.race,
          classChoice: draft.classChoice,
          background: draft.background,
          abilities: draft.abilities,
          classSkills: draft.classSkills,
          hpRoll: draft.hpRoll,
        });
        // Il ramo di successo di buildCharacter NON ha `success` (è un
        // CharacterBuildPlan): si riconosce il fallimento dalla presenza di `error`.
        if ('error' in plan) {
          // Espone l'errore reale per il debug (altrimenti il tasto sembra morto)
          console.error('[createCharacterFull] buildCharacter fallito:', plan.error);
          return null;
        }

        const id = uid();
        const newChar = buildCharacterSheet(plan, { id, name: draft.name.trim() });
        set((s) => ({
          characters: [...s.characters, newChar],
          activeCharacterId: id,
        }));
        return newChar;
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
      // Al ripristino dallo storage, ripara i vecchi personaggi senza PF/statistiche derivate
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        let changed = false;
        const characters = state.characters.map((c: Character) => {
          const fixed = backfillDerivedStats(c);
          if (fixed !== c) changed = true;
          return fixed;
        });
        if (changed) useCharacterStore.setState({ characters });
      },
    },
  ),
);
