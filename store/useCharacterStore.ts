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
  FeatChoiceSelection,
  FeatSpellChoice,
} from '../types';
import {
  buildCharacter,
  buildCharacterSheet,
  buildClassSummaries,
  computeClassDerived,
} from '../lib/rules/character-builder';
import { getClass } from '../lib/rules/classes';
import { getFeat, getFeatByName, getFeatAsiCap, getFeatAsiOptions, getAllFeats } from '../lib/rules/feats';
import { applyFeat } from '../lib/rules/apply-feat';
import { getSubclass } from '../lib/rules/subclasses';
import { getAbilityModifier } from '../lib/rules/abilities';
import { getProficiencyBonus, getAllFeaturesUpToLevel, getClassResources } from '../lib/rules/progression';
import { getAllEffects } from '../lib/rules/effects';
import { getSubclassFeaturesUpToLevel } from '../lib/rules/subclasses';
import { getRaceEffects } from '../lib/rules/races';
import { getClassPreset, getBackgroundPreset } from '../lib/rules/equipment-preset';
import { getItem } from '../lib/rules/items';
import { getSpellSlots } from '../lib/rules/spellcasting';
import { fileSystemStorage } from './file-system-storage';

let counter = 0;
function uid(): string {
  counter += 1;
  return `pg_${Date.now()}_${counter}`;
}

/** Converte le scelte spellcasting di un talento (FeatChoiceSelection) in FeatSpellChoice per applyFeat */
function spellChoiceFromFeatChoice(choice?: FeatChoiceSelection): FeatSpellChoice | undefined {
  if (choice?.spellAbility != null && Array.isArray(choice.cantrips) && Array.isArray(choice.spells)) {
    return { ability: choice.spellAbility, cantrips: choice.cantrips, spells: choice.spells };
  }
  return undefined;
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

  // Descrizioni risorse mancanti (PG esistenti) → patch da progression.json + effects.json
  const oldResources = c.resources ?? {};
  const needsDescPatch =
    Object.keys(oldResources).length > 0 && Object.values(oldResources).some((r) => !r.description);
  let resources: Record<string, CharacterResource> | undefined;
  if (needsDescPatch) {
    const descByKey = new Map<string, string>();
    for (const cl of c.classes ?? []) {
      for (const [key, res] of Object.entries(getClassResources(cl.className))) {
        if (res.description && !descByKey.has(key)) descByKey.set(key, res.description);
      }
    }
    for (const eff of getAllEffects()) {
      const hasResource = eff.type === 'resource_grant' || eff.type === 'action_grant';
      if (hasResource && typeof eff.key === 'string' && eff.description && !descByKey.has(eff.key)) {
        descByKey.set(eff.key, eff.description);
      }
    }
    // Risorse dai TALENTI (granted_resource, es. Punti Fortuna)
    for (const feat of getAllFeats()) {
      const gr = feat.granted_resource as { name?: string; description?: string } | null | undefined;
      if (gr?.name && gr.description && !descByKey.has(gr.name)) descByKey.set(gr.name, gr.description);
    }
    const entries = Object.entries(oldResources).map(([key, res]) => [
      key,
      res.description ? res : { ...res, description: descByKey.get(key) },
    ]);
    resources = Object.fromEntries(entries) as Record<string, CharacterResource>;
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
    spellSlots,
    classFeatures,
    subclassFeatures,
    // Unisce le magie automatiche a quelle già assegnate (senza rimuoverne di manuali)
    preparedSpells: [...new Set([...autoSpells, ...(c.preparedSpells ?? [])])],
    // Equipaggiamento di classe unito a quello già presente
    equipment,
    // Oro del background aggiunto ai PG vecchi (una tantum)
    money,
    // Descrizioni risorse patchate (PG esistenti) — o invariate se non serve
    resources: resources ?? c.resources,
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
          featChoices: draft.featChoices,
          raceSkillChoices: draft.raceSkillChoices,
          raceFeatId: draft.raceFeatId,
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

            // Risorse: PARTE dalle esistenti e PRESERVA quelle da effetti/talenti
            // (es. Ispirazione Eroica, Punti Fortuna) che NON sono in derived.resources
            // (solo risorse di classe) — altrimenti sparirebbero al level-up.
            // Per le risorse di classe aggiorna il max dal nuovo livello e preserva
            // current aggiungendo il delta del max.
            const oldResources = c.resources ?? {};
            const resources: Record<string, CharacterResource> = { ...oldResources };
            for (const [key, res] of Object.entries(derived.resources)) {
              const old = resources[key];
              const oldMax = old?.max ?? res.max;
              const current = Math.min((old?.current ?? res.max) + Math.max(res.max - oldMax, 0), res.max);
              resources[key] = { ...res, current };
            }
            // Risorse da EFFETTI (es. Ispirazione Eroica): riscala il max con il nuovo PB
            for (const eff of c.effects ?? []) {
              const hasResource = eff.type === 'resource_grant' || eff.type === 'action_grant';
              if (!hasResource || typeof eff.key !== 'string') continue;
              const rawMax =
                eff.max_uses === 'proficiency_bonus'
                  ? derived.proficiencyBonus
                  : typeof eff.max_uses === 'number'
                    ? eff.max_uses
                    : typeof eff.value === 'number'
                      ? eff.value
                      : 1;
              const old = resources[eff.key];
              const oldMax = old?.max ?? rawMax;
              const current = Math.min((old?.current ?? rawMax) + Math.max(rawMax - oldMax, 0), rawMax);
              resources[eff.key] = {
                label: eff.name,
                max: rawMax,
                current,
                resetOn: typeof eff.reset_on === 'string' ? eff.reset_on : 'long_rest',
                description: eff.description,
              };
            }
            // Risorse dai TALENTI già posseduti (granted_resource, es. Punti Fortuna): riscala il max
            for (const featName of [...(c.feats ?? []), ...(c.epicBoons ?? [])]) {
              const feat = getFeatByName(featName);
              const gr = feat?.granted_resource as
                | { name?: string; label?: string; description?: string; scale_with?: string; reset_on?: string }
                | null
                | undefined;
              if (!gr?.name) continue;
              const max = gr.scale_with === 'proficiency_bonus' ? derived.proficiencyBonus : 1;
              const old = resources[gr.name];
              const oldMax = old?.max ?? max;
              const current = Math.min((old?.current ?? max) + Math.max(max - oldMax, 0), max);
              resources[gr.name] = {
                label: gr.label ?? gr.name,
                max,
                current,
                resetOn: gr.reset_on ?? 'long_rest',
                description: gr.description,
              };
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
            let armor = [...(c.proficiencies?.armor ?? [])];
            let weapons = [...(c.proficiencies?.weapons ?? [])];
            let expertise = [...(c.proficiencies?.expertise ?? [])];
            let savingThrows = [...(c.proficiencies?.savingThrows ?? [])];
            let preparedSpells = [...(c.preparedSpells ?? [])];
            let resistances = c.defenses?.resistances ? [...c.defenses.resistances] : [];
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
                const apply = applyFeat(feat, {
                  asiChoices: singleAsi,
                  choice: options.featChoice,
                });
                featModifiers = [...featModifiers, ...(apply.modifiers ?? [])];
                for (const sk of apply.skills ?? []) if (!skills.includes(sk)) skills.push(sk);
                for (const a of apply.armorProficiencies ?? []) if (!armor.includes(a)) armor.push(a);
                for (const w of apply.weaponProficiencies ?? []) if (!weapons.includes(w)) weapons.push(w);
                // Scelte extra (choice_config): maestrie, tiri salvezza, resistenze, incantesimi
                for (const ex of apply.expertise ?? []) if (!expertise.includes(ex)) expertise.push(ex);
                for (const st of apply.savingThrows ?? []) if (!savingThrows.includes(st)) savingThrows.push(st);
                for (const r of apply.resistances ?? []) if (!resistances.includes(r)) resistances.push(r);
                for (const sp of apply.spells ?? []) if (!preparedSpells.includes(sp)) preparedSpells.push(sp);
                const featChoice = options.featChoice;
                if (featChoice) {
                  choices = {
                    ...choices,
                    featChoices: {
                      ...(choices.featChoices ?? {}),
                      [feat.id]: featChoice,
                    },
                  };
                }
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
                      description: grant.description,
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
              proficiencies: { ...c.proficiencies, skills, armor, weapons, expertise, savingThrows },
              preparedSpells,
              defenses:
                c.defenses && resistances.length > 0
                  ? { ...c.defenses, resistances }
                  : c.defenses,
              spellSlots,
              resources: Object.keys(resourcesAll).length > 0 ? resourcesAll : undefined,
              spellcasting: c.spellcasting
                ? { ...c.spellcasting, slotDetails: spellSlots }
                : c.spellcasting,
            };
          }),
        }));
      },

      // ── Gestione manuale dei talenti (sezione "Gestione Talenti" in Altro) ──
      addFeatToCharacter: (featId, featChoice) => {
        const feat = getFeat(featId);
        if (!feat) return;
        set((state) => ({
          characters: state.characters.map((c) => {
            if (c.id !== state.activeCharacterId) return c;
            if ((c.feats ?? []).includes(feat.name) || (c.epicBoons ?? []).includes(feat.name)) return c;
            const isEpic = feat.category === 'epic_boon';
            const apply = applyFeat(feat, {
              choice: featChoice,
              spellChoice: spellChoiceFromFeatChoice(featChoice),
            });
            // ASI del talento (asi_config) → applicati ai punteggi (cap = max_cap)
            let abilities = c.abilities;
            for (const b of apply.asiBoosts) {
              const cap = getFeatAsiCap(feat);
              abilities = {
                ...abilities,
                [b.ability]: Math.min((abilities[b.ability] ?? 10) + b.amount, cap),
              };
            }
            // Registrazione scelte (per riproducibilità)
            const choices = { ...(c.choices ?? {}) };
            if (isEpic) choices.epicBoonId = feat.id;
            else if (feat.category === 'general')
              choices.generalFeatIds = [...(choices.generalFeatIds ?? []), feat.id];
            else if (feat.category === 'origin') choices.originFeatChoice = feat.name;
            if (featChoice) {
              choices.featChoices = { ...(choices.featChoices ?? {}), [feat.id]: featChoice };
            }
            // Unione delle concessioni meccaniche (dedup)
            const push = <T,>(arr: T[] | undefined, items: T[]) => {
              const next = [...(arr ?? [])];
              for (const it of items) if (!next.includes(it)) next.push(it);
              return next;
            };
            const skills = push(c.proficiencies?.skills, apply.skills ?? []);
            const tools = push(c.proficiencies?.tools, apply.toolProficiencies ?? []);
            const armor = push(c.proficiencies?.armor, apply.armorProficiencies ?? []);
            const weapons = push(c.proficiencies?.weapons, apply.weaponProficiencies ?? []);
            const expertise = push(c.proficiencies?.expertise, apply.expertise ?? []);
            const savingThrows = push(c.proficiencies?.savingThrows, apply.savingThrows ?? []);
            const preparedSpells = push(c.preparedSpells, apply.spells ?? []);
            const resistances = [...(c.defenses?.resistances ?? [])];
            for (const r of apply.resistances ?? []) if (!resistances.includes(r)) resistances.push(r);
            const resources = { ...(c.resources ?? {}) };
            for (const grant of apply.resources ?? []) {
              const max = grant.max === 'proficiency_bonus' ? (c.proficiencyBonus ?? 2) : grant.max;
              if (typeof max === 'number' && !resources[grant.key]) {
                resources[grant.key] = {
                  label: grant.label,
                  max,
                  current: max,
                  resetOn: grant.resetOn,
                  description: grant.description,
                };
              }
            }
            return {
              ...c,
              abilities,
              feats: isEpic ? c.feats ?? [] : [...(c.feats ?? []), feat.name],
              epicBoons: isEpic ? [...(c.epicBoons ?? []), feat.name] : c.epicBoons ?? [],
              featModifiers: [...(c.featModifiers ?? []), ...(apply.modifiers ?? [])],
              choices,
              proficiencies: {
                ...(c.proficiencies ?? {}),
                skills,
                tools,
                armor,
                weapons,
                expertise,
                savingThrows,
              },
              preparedSpells,
              defenses:
                c.defenses && resistances.length > 0
                  ? { ...c.defenses, resistances }
                  : c.defenses,
              resources: Object.keys(resources).length > 0 ? resources : undefined,
            };
          }),
        }));
      },

      removeFeatFromCharacter: (featId) => {
        const feat = getFeat(featId);
        if (!feat) return;
        set((state) => ({
          characters: state.characters.map((c) => {
            if (c.id !== state.activeCharacterId) return c;
            const feats = (c.feats ?? []).filter((n) => n !== feat.name);
            const epicBoons = (c.epicBoons ?? []).filter((n) => n !== feat.name);
            // Contributi ancora presenti dagli ALTRI talenti posseduti → non rimuoverli
            const kept = new Set<string>();
            for (const f of [...feats, ...epicBoons]) {
              const other = getFeatByName(f);
              if (!other) continue;
              const a = applyFeat(other, {
                choice: c.choices?.featChoices?.[other.id],
                spellChoice: spellChoiceFromFeatChoice(c.choices?.featChoices?.[other.id]),
              });
              for (const s of a.skills ?? []) kept.add(s);
              for (const t of a.toolProficiencies ?? []) kept.add(t);
              for (const ar of a.armorProficiencies ?? []) kept.add(ar);
              for (const w of a.weaponProficiencies ?? []) kept.add(w);
              for (const e of a.expertise ?? []) kept.add(e);
              for (const st of a.savingThrows ?? []) kept.add(st);
              for (const r of a.resistances ?? []) kept.add(r);
              for (const sp of a.spells ?? []) kept.add(sp);
              for (const gr of a.resources ?? []) kept.add(gr.key);
            }
            const apply = applyFeat(feat, {
              choice: c.choices?.featChoices?.[featId],
              spellChoice: spellChoiceFromFeatChoice(c.choices?.featChoices?.[featId]),
            });
            const filterKept = <T,>(arr: T[] | undefined, contrib: T[] | undefined, key: (x: T) => string) =>
              (arr ?? []).filter((x) => !(contrib ?? []).some((cc) => key(cc) === key(x)) || kept.has(key(x)));
            const skills = filterKept(c.proficiencies?.skills, apply.skills, (x) => x);
            const tools = filterKept(c.proficiencies?.tools, apply.toolProficiencies, (x) => x);
            const armor = filterKept(c.proficiencies?.armor, apply.armorProficiencies, (x) => x);
            const weapons = filterKept(c.proficiencies?.weapons, apply.weaponProficiencies, (x) => x);
            const expertise = filterKept(c.proficiencies?.expertise, apply.expertise, (x) => x);
            const savingThrows = filterKept(c.proficiencies?.savingThrows, apply.savingThrows, (x) => x);
            const resistances = filterKept(c.defenses?.resistances, apply.resistances, (x) => x);
            const preparedSpells = filterKept(c.preparedSpells, apply.spells, (x) => x);
            // ASI del talento → sottrai dai punteggi (mai sotto 1)
            let abilities = c.abilities;
            for (const b of apply.asiBoosts) {
              abilities = {
                ...abilities,
                [b.ability]: Math.max((abilities[b.ability] ?? 10) - b.amount, 1),
              };
            }
            // Risorse concesse dal talento (se non tenute da altri)
            const resources = { ...(c.resources ?? {}) };
            for (const grant of apply.resources ?? []) {
              if (resources[grant.key] && !kept.has(grant.key)) delete resources[grant.key];
            }
            // Pulizia registrazioni scelte
            const choices = { ...(c.choices ?? {}) };
            if (choices.epicBoonId === feat.id) delete choices.epicBoonId;
            if (choices.generalFeatIds)
              choices.generalFeatIds = choices.generalFeatIds.filter((x) => x !== feat.id);
            if (choices.originFeatChoice === feat.name) delete choices.originFeatChoice;
            if (choices.featChoices?.[feat.id]) {
              const fc = { ...choices.featChoices };
              delete fc[feat.id];
              choices.featChoices = fc;
            }
            if (choices.featAsiPicks?.[feat.id]) {
              const fa = { ...choices.featAsiPicks };
              delete fa[feat.id];
              choices.featAsiPicks = fa;
            }
            return {
              ...c,
              feats,
              epicBoons,
              abilities,
              choices,
              featModifiers: (c.featModifiers ?? []).filter(
                (m) =>
                  !(apply.modifiers ?? []).some(
                    (rm) => rm.type === m.type && rm.description === m.description,
                  ),
              ),
              proficiencies: {
                ...(c.proficiencies ?? {}),
                skills,
                tools,
                armor,
                weapons,
                expertise,
                savingThrows,
              },
              preparedSpells,
              defenses: c.defenses ? { ...c.defenses, resistances } : c.defenses,
              resources: Object.keys(resources).length > 0 ? resources : undefined,
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

      // ── Equipaggiamento ──────────────────────────────────────────

      addEquipmentItem: (itemId, quantity = 1) =>
        set((s) => {
          const id = s.activeCharacterId;
          if (!id || quantity <= 0) return {};
          return {
            characters: s.characters.map((c) => {
              if (c.id !== id) return c;
              const existing = (c.equipment ?? []).find((it) => it.itemId === itemId);
              if (existing) {
                return {
                  ...c,
                  equipment: (c.equipment ?? []).map((it) =>
                    it.itemId === itemId ? { ...it, quantity: it.quantity + quantity } : it,
                  ),
                };
              }
              return {
                ...c,
                equipment: [
                  ...(c.equipment ?? []),
                  {
                    itemId,
                    name: getItem(itemId)?.name ?? 'Oggetto',
                    quantity,
                    equipped: false,
                  },
                ],
              };
            }),
          };
        }),

      removeEquipmentItem: (itemId) =>
        set((s) => {
          const id = s.activeCharacterId;
          if (!id) return {};
          return {
            characters: s.characters.map((c) =>
              c.id === id
                ? { ...c, equipment: (c.equipment ?? []).filter((it) => it.itemId !== itemId) }
                : c,
            ),
          };
        }),

      setEquipmentQuantity: (itemId, quantity) =>
        set((s) => {
          const id = s.activeCharacterId;
          if (!id) return {};
          return {
            characters: s.characters.map((c) => {
              if (c.id !== id) return c;
              const equipment = (c.equipment ?? [])
                .map((it) => (it.itemId === itemId ? { ...it, quantity: Math.max(0, quantity) } : it))
                .filter((it) => it.quantity > 0);
              return { ...c, equipment };
            }),
          };
        }),

      toggleEquippedItem: (itemId) =>
        set((s) => {
          const id = s.activeCharacterId;
          if (!id) return {};
          return {
            characters: s.characters.map((c) => {
              if (c.id !== id) return c;
              return {
                ...c,
                equipment: (c.equipment ?? []).map((it) =>
                  it.itemId === itemId ? { ...it, equipped: !it.equipped } : it,
                ),
              };
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
