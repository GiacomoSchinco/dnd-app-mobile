import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  CharacterState,
  Character,
  ClassName,
  CharacterDraft,
  CharacterResource,
  LevelUpOptions,
  SpellSlot,
} from '../types';
import {
  buildCharacter,
  buildCharacterSheet,
  buildClassSummaries,
  computeClassDerived,
} from '../lib/rules/character-builder';
import { getClass } from '../lib/rules/classes';
import { getFeat, getFeatAsiCap, getFeatAsiOptions } from '../lib/rules/feats';
import { applyFeat } from '../lib/rules/apply-feat';
import { getSubclass } from '../lib/rules/subclasses';
import { getAbilityModifier } from '../lib/rules/abilities';
import { getProficiencyBonus, getAllFeaturesUpToLevel } from '../lib/rules/progression';
import { getSubclassFeaturesUpToLevel } from '../lib/rules/subclasses';
import { getRaceEffects } from '../lib/rules/races';
import { getClassPreset, getBackgroundPreset } from '../lib/rules/equipment-preset';
import { getSpellSlots } from '../lib/rules/spellcasting';
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
  // — con descrizione/tabella risolte da classes.json quando disponibili
  const cfFor = (lv: number, name: string) =>
    classDef?.featuresByLevel[lv]?.find((f) => f.name === name);
  const classFeatures =
    c.classFeatures && c.classFeatures.length > 0
      ? c.classFeatures.map((f) => {
          const cf = cfFor(f.level, f.name);
          return {
            level: f.level,
            name: f.name,
            description: f.description ?? cf?.description,
            table: f.table ?? cf?.table,
          };
        })
      : getAllFeaturesUpToLevel(cls.className, level)
          .flatMap(({ level: lv, features }) =>
            features
              .filter((f) => f !== 'Aumento dei Punteggi di Caratteristica')
              .map((name) => {
                const cf = cfFor(lv, name);
                return { level: lv, name, description: cf?.description, table: cf?.table };
              })
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

  // Equipaggiamento di CLASSE mancante (i vecchi PG avevano solo quello del background).
  // Aggiunge SOLO gli item mancanti → idempotente (niente duplicati/raddoppi a ogni avvio).
  const classPreset = classDef ? getClassPreset(classDef.id) : undefined;
  const classItems = classPreset?.items ?? [];
  const existingItemIds = new Set((c.equipment ?? []).map((it) => it.itemId));
  const missingClassItems = classItems.filter((it) => !existingItemIds.has(it.itemId));
  const equipment =
    missingClassItems.length > 0
      ? [
          ...(c.equipment ?? []),
          ...missingClassItems.map((it) => ({
            itemId: it.itemId,
            name: it.name,
            quantity: it.quantity,
            equipped: false,
          })),
        ]
      : c.equipment;

  // Per i PG "vecchi" (a cui mancava l'equipaggiamento di classe) aggiungi anche
  // l'oro del background mancante, una tantum (stesso trigger → idempotente).
  const money =
    missingClassItems.length > 0
      ? {
          mo: (c.money?.mo ?? 0) + (c.backgroundId != null ? getBackgroundPreset(c.backgroundId)?.startingGold ?? 0 : 0),
          ma: c.money?.ma ?? 0,
          mr: c.money?.mr ?? 0,
        }
      : c.money;

  // Slot incantesimi (incl. Pact Magic del Warlock) — riempiti SOLO se assenti/vuoti,
  // così gli slot già consumati non vengono sovrascritti (idempotente).
  const hasSpellSlots = Object.values(c.spellSlots ?? {}).some((s) => (s?.max ?? 0) > 0);
  const spellSlots = hasSpellSlots ? c.spellSlots : getSpellSlots(cls.className, level);

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
    spellSlots,
    classFeatures,
    subclassFeatures,
    // Unisce le magie automatiche a quelle già assegnate (senza rimuoverne di manuali)
    preparedSpells: [...new Set([...autoSpells, ...(c.preparedSpells ?? [])])],
    // Equipaggiamento di classe unito a quello già presente
    equipment,
    // Oro del background aggiunto ai PG vecchi (una tantum)
    money,
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
          classes: draft.classes,
          background: draft.background,
          abilities: draft.abilities,
          classSkills: draft.classSkills,
          bgToolChoices: draft.bgToolChoices,
          featToolChoices: draft.featToolChoices,
          featSkillChoices: draft.featSkillChoices,
          featSpellChoice: draft.featSpellChoice,
          generalFeatIds: draft.generalFeatIds,
          fightingStyleId: draft.fightingStyleId,
          epicBoonId: draft.epicBoonId,
          featAsiPicks: draft.featAsiPicks,
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

      applyLevelUp: (id, className, options) => {
        set((s) => ({
          characters: s.characters.map((c) => {
            if (c.id !== id) return c;
            const clsIndex = c.classes.findIndex((cl) => cl.className === className);
            if (clsIndex === -1 || c.classes[clsIndex].level >= 20) return c;

            const classDef = getClass(className);
            const conMod = getAbilityModifier(c.abilities?.constitution ?? 10);
            const oldMaxHp = c.hitPoints?.max ?? 0;
            const oldCurrentHp = c.hitPoints?.current ?? oldMaxHp;
            const oldHitDice = c.hitPoints?.hitDiceCurrent ?? 0;

            // Nuove classi (livello +1) con eventuale sottoclasse appena sbloccata
            const newClasses = c.classes.map((cl, i) => {
              if (i !== clsIndex) return cl;
              const base = { ...cl, level: cl.level + 1 };
              if (options?.subclassId != null) {
                const sub = getSubclass(options.subclassId);
                return { ...base, subclassId: sub?.id, subclass: sub?.name };
              }
              return base;
            });

            const summaries = buildClassSummaries(newClasses);
            if (!summaries.success) return c;
            const derived = computeClassDerived(summaries.summaries, c.abilities);
            if (derived.level > 20) return c;

            // PF guadagnati: media (o tiro del dado) + CON, min 1 — indipendente dai PF salvati
            const averageHpGained = classDef
              ? Math.max(classDef.hitPoints.average + conMod, 1)
              : derived.maxHp - oldMaxHp;
            const hpGained =
              options?.hpRoll != null ? Math.max(options.hpRoll + conMod, 1) : averageHpGained;
            const maxHp = oldMaxHp + hpGained;

            // Risorse: aggiorna max, preserva current (aggiunge il delta del max)
            const oldResources = c.resources ?? {};
            const resources: Record<string, CharacterResource> = {};
            for (const [key, res] of Object.entries(derived.resources)) {
              const old = oldResources[key];
              const oldMax = old?.max ?? res.max;
              const current = Math.min((old?.current ?? res.max) + Math.max(res.max - oldMax, 0), res.max);
              resources[key] = { ...res, current };
            }

            // Slot: preserva current, aggiunge il delta dei nuovi max
            const oldSlots = c.spellSlots ?? {};
            const spellSlots: Record<number, SpellSlot> = {};
            for (const [lvl, slot] of Object.entries(derived.spellSlots)) {
              const n = Number(lvl);
              const old = oldSlots[n];
              const current = old
                ? Math.min(old.current + Math.max(slot.max - old.max, 0), slot.max)
                : slot.current;
              spellSlots[n] = { max: slot.max, current };
            }

            // ASI / talento al livello
            let abilities = c.abilities;
            let feats = c.feats ?? [];
            let epicBoons = c.epicBoons ?? [];
            let featModifiers = c.featModifiers ?? [];
            let choices = c.choices ?? {};
            let skills = [...(c.proficiencies?.skills ?? [])];
            let resourcesAll = { ...resources };

            if (options?.asiBoosts && options.asiBoosts.length > 0) {
              const next = { ...abilities };
              for (const b of options.asiBoosts) {
                next[b.ability] = Math.min((next[b.ability] ?? 10) + b.amount, 20);
              }
              abilities = next;
              choices = { ...choices, asiBoosts: [...(choices.asiBoosts ?? []), ...options.asiBoosts] };
            }

            if (options?.generalFeatId != null) {
              const feat = getFeat(options.generalFeatId);
              if (feat) {
                const isEpic = feat.category === 'epic_boon';
                if (isEpic) epicBoons = [...epicBoons, feat.name];
                else feats = [...feats, feat.name];
                choices = {
                  ...choices,
                  ...(isEpic
                    ? { epicBoonId: feat.id }
                    : { generalFeatIds: [...(choices.generalFeatIds ?? []), feat.id] }),
                };
                // ASI del talento: automatico se una sola caratteristica consentita
                const singleAsi =
                  !options.featAsiPicks && getFeatAsiOptions(feat).length === 1
                    ? getFeatAsiOptions(feat)
                    : options.featAsiPicks;
                const apply = applyFeat(feat, { asiChoices: singleAsi });
                featModifiers = [...featModifiers, ...(apply.modifiers ?? [])];
                for (const sk of apply.skills ?? []) if (!skills.includes(sk)) skills.push(sk);
                for (const b of apply.asiBoosts) {
                  const cap = getFeatAsiCap(feat);
                  const next = { ...abilities };
                  next[b.ability] = Math.min((next[b.ability] ?? 10) + b.amount, cap);
                  abilities = next;
                }
                for (const grant of apply.resources ?? []) {
                  const max = grant.max === 'proficiency_bonus' ? derived.proficiencyBonus : grant.max;
                  if (typeof max === 'number' && !resourcesAll[grant.key]) {
                    resourcesAll[grant.key] = {
                      label: grant.label,
                      max,
                      current: max,
                      resetOn: grant.resetOn,
                    };
                  }
                }
              }
            }

            return {
              ...c,
              level: derived.level,
              classes: newClasses,
              proficiencyBonus: derived.proficiencyBonus,
              abilities,
              feats,
              epicBoons,
              featModifiers,
              choices,
              hitPoints: {
                max: maxHp,
                current: oldCurrentHp + hpGained,
                temporary: c.hitPoints?.temporary ?? 0,
                hitDiceMax: derived.level,
                hitDiceCurrent: Math.min(oldHitDice + 1, derived.level),
                hitDie: derived.hitDie,
              },
              classFeatures: derived.classFeatures,
              subclassFeatures: derived.subclassFeatures,
              proficiencies: { ...c.proficiencies, skills },
              spellSlots,
              resources: Object.keys(resourcesAll).length > 0 ? resourcesAll : undefined,
              spellcasting: c.spellcasting
                ? { ...c.spellcasting, slotDetails: spellSlots }
                : c.spellcasting,
            };
          }),
        }));
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

      setSpellBadge: (spellName, badge) =>
        set((s) => {
          const id = s.activeCharacterId;
          if (!id) return {};
          return {
            characters: s.characters.map((c) => {
              if (c.id !== id) return c;
              const current = { ...(c.spellBadges ?? {}) };
              if (badge) current[spellName] = badge;
              else delete current[spellName];
              return { ...c, spellBadges: current };
            }),
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
