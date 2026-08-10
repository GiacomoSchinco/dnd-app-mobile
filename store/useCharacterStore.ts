import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CharacterState, Character, ClassName, CharacterDraft } from '../types';
import { buildCharacter, buildCharacterSheet } from '../lib/rules/character-builder';
import { getClass } from '../lib/rules/classes';
import { getAbilityModifier } from '../lib/rules/abilities';
import { getProficiencyBonus, getAllFeaturesUpToLevel } from '../lib/rules/progression';
import { getSubclassFeaturesUpToLevel } from '../lib/rules/subclasses';
import { getRaceEffects } from '../lib/rules/races';
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

  // Feature di classe + sottoclasse (per i PG creati prima di questa feature)
  const classFeatures =
    c.classFeatures ??
    getAllFeaturesUpToLevel(cls.className, level)
      .flatMap(({ level: lv, features }) =>
        features
          .filter((f) => f !== 'Aumento dei Punteggi di Caratteristica')
          .map((name) => ({ level: lv, name }))
      );
  const subclassFeatures =
    c.subclassFeatures ??
    (cls.subclassId != null ? getSubclassFeaturesUpToLevel(cls.subclassId, level) : undefined);

  // Magie da fonti automatiche (talento bg + razza/lineage) → tra le assegnate
  const autoSpells: string[] = [];
  const pushAutoSpell = (name?: string) => {
    if (name && !autoSpells.includes(name)) autoSpells.push(name);
  };
  const featChoice = c.choices?.featChoice;
  if (featChoice && typeof featChoice === 'object') {
    featChoice.cantrips.forEach(pushAutoSpell);
    featChoice.spells.forEach(pushAutoSpell);
  }
  for (const eff of c.raceId != null ? getRaceEffects(c.raceId, c.lineageId) : []) {
    if (eff.type !== 'spell_grant') continue;
    const granted = eff.spells;
    if (!Array.isArray(granted)) continue;
    for (const sp of granted as Array<{ name?: string; req_level?: number }>) {
      if (sp.name && (sp.req_level ?? 1) <= level) pushAutoSpell(sp.name);
    }
  }

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
    classFeatures,
    subclassFeatures,
    // Unisce le magie automatiche a quelle già assegnate (senza rimuoverne di manuali)
    preparedSpells: [...new Set([...autoSpells, ...(c.preparedSpells ?? [])])],
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
          proficiencies: { armor: [], weapons: [], tools: [], skills: [], savingThrows: [], languages: [] },
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
          bgToolChoices: draft.bgToolChoices,
          featToolChoices: draft.featToolChoices,
          featSkillChoices: draft.featSkillChoices,
          featSpellChoice: draft.featSpellChoice,
          raceSkillChoices: draft.raceSkillChoices,
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

      togglePreparedSpell: (spellName) =>
        set((s) => {
          const id = s.activeCharacterId;
          if (!id) return {};
          return {
            characters: s.characters.map((c) =>
              c.id === id
                ? {
                    ...c,
                    preparedSpells: c.preparedSpells.includes(spellName)
                      ? c.preparedSpells.filter((n) => n !== spellName)
                      : [...c.preparedSpells, spellName],
                  }
                : c,
            ),
          };
        }),

      toggleFavoriteSpell: (spellName) =>
        set((s) => {
          const id = s.activeCharacterId;
          if (!id) return {};
          return {
            characters: s.characters.map((c) =>
              c.id === id
                ? {
                    ...c,
                    favoriteSpells: c.favoriteSpells.includes(spellName)
                      ? c.favoriteSpells.filter((n) => n !== spellName)
                      : [...c.favoriteSpells, spellName],
                  }
                : c,
            ),
          };
        }),

      useSpellSlot: (level) =>
        set((s) => {
          const id = s.activeCharacterId;
          if (!id) return {};
          return {
            characters: s.characters.map((c) => {
              if (c.id !== id) return c;
              const slot = c.spellSlots?.[level];
              if (!slot) return c;
              return {
                ...c,
                spellSlots: { ...c.spellSlots, [level]: { ...slot, current: Math.max(0, slot.current - 1) } },
              };
            }),
          };
        }),

      recoverSpellSlot: (level) =>
        set((s) => {
          const id = s.activeCharacterId;
          if (!id) return {};
          return {
            characters: s.characters.map((c) => {
              if (c.id !== id) return c;
              const slot = c.spellSlots?.[level];
              if (!slot) return c;
              return {
                ...c,
                spellSlots: { ...c.spellSlots, [level]: { ...slot, current: Math.min(slot.max, slot.current + 1) } },
              };
            }),
          };
        }),

      restoreSpellSlots: (level) =>
        set((s) => {
          const id = s.activeCharacterId;
          if (!id) return {};
          return {
            characters: s.characters.map((c) => {
              if (c.id !== id) return c;
              const slots = { ...c.spellSlots };
              const keys = level != null ? [level] : Object.keys(slots).map(Number);
              keys.forEach((lvl) => {
                const slot = slots[lvl];
                if (slot) slots[lvl] = { ...slot, current: slot.max };
              });
              return { ...c, spellSlots: slots };
            }),
          };
        }),
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
