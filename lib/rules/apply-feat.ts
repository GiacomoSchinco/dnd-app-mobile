import type { Ability, ArmorType, FeatModifierRaw, FeatRaw, FeatSpellChoice, SkillName, WeaponType } from '../../types';
import { parseAbilityFromAbbreviation } from './abilities';
import { getAllSkills } from './skills';

/**
 * apply-feat.ts — Motore di applicazione dei talenti.
 *
 * Converte un talento (feat.json) in concessioni meccaniche:
 *   - `modifiers`        → i granted_modifiers (effetti descrittivi/meccanici)
 *   - `toolProficiencies`→ strumenti scelti (tool_proficiency o hybrid_proficiency)
 *   - `skills`           → abilità scelte (hybrid_proficiency, es. "Abile")
 *   - `spellcasting`     → scelta incantesimi (spellcasting, es. "Iniziato alla Magia")
 *   - `resources`        → risorse concesse (granted_resource, es. Punti Fortuna)
 *   - `asiBoosts`        → ASI concessi (asi_config) — pronto per i talenti generali
 *
 * La risoluzione a numeri reali (es. max = bonus di competenza) avviene nel
 * builder (`buildCharacterSheet`) che conosce il livello del personaggio.
 */

export interface ToolOption {
  slug: string;
  label: string;
}

export interface FeatResourceGrant {
  key: string;
  label: string;
  /** Numero fisso oppure 'proficiency_bonus' (risolto dal builder col PB reale) */
  max: number | 'proficiency_bonus';
  resetOn?: string;
  description?: string;
}

/** Scelte extra dei talenti generali/epici (choice_config) */
export interface FeatChoiceInput {
  /** spell_selection (Contaminazione Fatata/Oscura) — nome incantesimo scelto */
  spellName?: string;
  /** ritual_spells_gain (Incantatore Rituale) — nomi incantesimi rituali */
  ritualSpells?: string[];
  /** Competenze skill (skill_proficiency_or_expertise, observant, hybrid…) */
  skillChoices?: SkillName[];
  /** Maestrie (expertise) skill */
  expertiseChoices?: SkillName[];
  /** tool_proficiency (Chef) — slug strumenti */
  toolChoices?: string[];
  /** element_damage_choice / energy_resistance_choice — tipi */
  damageTypes?: string[];
}

export interface FeatApplyOptions {
  /** Slug degli strumenti scelti (tool_proficiency o hybrid_proficiency) */
  toolChoices?: string[];
  /** Abilità scelte (hybrid_proficiency, es. "Abile") */
  skillChoices?: SkillName[];
  /** Scelta incantesimi (spellcasting, es. "Iniziato alla Magia") */
  spellChoice?: FeatSpellChoice;
  /** Abilità scelte per l'ASI (asi_config) — solo scelte esplicite dell'utente */
  asiChoices?: Ability[];
  /** Scelte extra del choice_config (talenti generali/epici) */
  choice?: FeatChoiceInput;
}

export interface FeatApplyResult {
  featId: number;
  modifiers: FeatModifierRaw[];
  toolProficiencies: string[];
  /** Competenze abilità scelte (hybrid_proficiency, observant, …) */
  skills: SkillName[];
  /** Maestrie (expertise) scelte */
  expertise: SkillName[];
  /** Scelta incantesimi risolta (spellcasting) */
  spellcasting?: FeatSpellChoice;
  resources: FeatResourceGrant[];
  asiBoosts: { ability: Ability; amount: 1 | 2 }[];
  /** Tiri salvezza concessi (Resiliente) */
  savingThrows: Ability[];
  /** Resistenze concesse (Dono della Resistenza Energetica) */
  resistances: string[];
  /** Nomi incantesimi concessi (spell_selection, ritual_spells_gain) */
  spells: string[];
  /** Tipo di danno scelto (Adepto Elementale) */
  damageType?: string;
  /** Armature concesse (armor_proficiency / shield_proficiency) */
  armorProficiencies: ArmorType[];
  /** Armi concesse (weapon_proficiency) */
  weaponProficiencies: WeaponType[];
}

// ── Catalogo strumenti (competenze) ──────────────────────────────
// slug (inglese) → etichetta italiana. Copre i tool_id dei background
// e i pool dei choice_config dei talenti.

export const TOOL_LABELS: Record<string, string> = {
  // Artigiani (artisan_tools)
  alchemists_supplies: 'Strumenti da Alchimista',
  brewers_supplies: 'Strumenti da Birraio',
  calligraphers_supplies: 'Strumenti da Calligrafo',
  carpenters_tools: 'Attrezzi da Falegname',
  cartographers_tools: 'Strumenti da Cartografo',
  cobblers_tools: 'Attrezzi da Calzolaio',
  cooks_utensils: 'Utensili da Cuoco',
  glassblowers_tools: 'Attrezzi da Vetraio',
  jewelers_tools: 'Strumenti da Gioielliere',
  leatherworkers_tools: 'Attrezzi da Cuoiaio',
  masons_tools: 'Attrezzi da Tagliapietre',
  painters_supplies: 'Forniture da Pittore',
  potters_tools: 'Attrezzi da Vasaio',
  smiths_tools: 'Attrezzi da Fabbro',
  tinkers_tools: 'Attrezzi da Meccanico',
  weavers_tools: 'Attrezzi da Tessitore',
  woodcarvers_tools: 'Attrezzi da Intagliatore',
  // Strumenti musicali
  bagpipes: 'Cornamusa',
  drum: 'Tamburo',
  dulcimer: 'Dulcimero',
  flute: 'Flauto',
  lute: 'Liuto',
  lyre: 'Lira',
  horn: 'Corno',
  pan_flute: 'Flauto di Pan',
  shawm: 'Piffero',
  viol: 'Viola',
  // Set da gioco
  dice_set: 'Set di Dadi',
  dragonchess_set: 'Set di Dracoscacchi',
  playing_card_set: 'Mazzo di Carte',
  three_dragon_ante: 'Tre Antiche Dragoni',
  // Kit e altro
  disguise_kit: 'Kit da Travestimento',
  forgery_kit: 'Kit da Falsario',
  herbalism_kit: 'Kit da Erborista',
  navigators_tools: 'Strumenti da Navigatore',
  poisoners_kit: 'Kit da Avvelenatore',
  thieves_tools: 'Attrezzi da Scasso',
};

/** Pool di strumenti per le scelte (chiavi normalizzate) */
export const TOOL_POOLS: Record<string, string[]> = {
  artisan_tools: [
    'alchemists_supplies', 'brewers_supplies', 'calligraphers_supplies',
    'carpenters_tools', 'cartographers_tools', 'cobblers_tools',
    'cooks_utensils', 'glassblowers_tools', 'jewelers_tools',
    'leatherworkers_tools', 'masons_tools', 'painters_supplies',
    'potters_tools', 'smiths_tools', 'tinkers_tools', 'weavers_tools',
    'woodcarvers_tools',
  ],
  musical_instruments: [
    'bagpipes', 'drum', 'dulcimer', 'flute', 'lute', 'lyre', 'horn',
    'pan_flute', 'shawm', 'viol',
  ],
  gaming_sets: ['dice_set', 'dragonchess_set', 'playing_card_set', 'three_dragon_ante'],
};

/** Normalizza un nome di pool (es. 'artisans_tools' → 'artisan_tools') */
const POOL_ALIASES: Record<string, string> = {
  artisan_tools: 'artisan_tools',
  artisans_tools: 'artisan_tools',
  musical_instruments: 'musical_instruments',
  gaming_sets: 'gaming_sets',
};

export function normalizeToolPool(pool?: string): string | undefined {
  if (!pool) return undefined;
  const p = pool.trim().toLowerCase();
  return POOL_ALIASES[p] ?? (TOOL_POOLS[p] ? p : undefined);
}

/** Opzioni di strumenti per un pool (per i picker del wizard). Senza pool → tutti */
export function getToolOptions(pool?: string): ToolOption[] {
  const key = normalizeToolPool(pool);
  const slugs = key ? TOOL_POOLS[key] : Object.keys(TOOL_LABELS);
  return slugs
    .map((slug) => ({ slug, label: TOOL_LABELS[slug] ?? slug }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Etichetta italiana di uno strumento (fallback: slug) */
export function getToolLabel(slug: string): string {
  return TOOL_LABELS[slug] ?? slug;
}

/** Tutte le skill (per i talenti che danno competenza in tutte) */
const ALL_SKILLS: SkillName[] = getAllSkills().map((s) => s.name);

/** Pool strumenti: accetta una chiave di pool (artisan_tools…) o un singolo slug (cooks_utensils) */
function getToolPoolSlugs(pool?: string): string[] {
  if (!pool) return [];
  const key = normalizeToolPool(pool);
  if (key && TOOL_POOLS[key]) return TOOL_POOLS[key];
  if (TOOL_LABELS[pool]) return [pool];
  return [];
}

/**
 * Applica un talento → concessioni meccaniche.
 * Le scelte non ancora risolte (tool scelti mancanti) vengono semplicemente
 * ignorate: il talento resta registrato ma la concessione è vuota.
 */
export function applyFeat(feat: FeatRaw, options: FeatApplyOptions = {}): FeatApplyResult {
  const modifiers = feat.granted_modifiers ?? [];
  const choiceConfig = feat.choice_config as
    | {
        type?: string;
        pool?: string | string[];
        count?: number;
        skill_count?: number;
        expertise_count?: number;
      }
    | null
    | undefined;
  const choice = options.choice;

  // Competenze (strumenti e/o abilità) per i choice_config corrispondenti
  const toolProficiencies: string[] = [];
  const skills: SkillName[] = [];
  const expertise: SkillName[] = [];
  const savingThrows: Ability[] = [];
  const resistances: string[] = [];
  const spells: string[] = [];
  let damageType: string | undefined;

  if (choiceConfig?.type === 'tool_proficiency') {
    // pool: chiave di pool (artisan_tools…) oppure singolo slug (cooks_utensils)
    const pool = getToolPoolSlugs(choiceConfig.pool as string);
    const count = choiceConfig.count ?? pool.length;
    const picked = (choice?.toolChoices ?? options.toolChoices ?? []).filter((t) => pool.includes(t));
    toolProficiencies.push(...picked.slice(0, count));
  } else if (choiceConfig?.type === 'hybrid_proficiency') {
    // "Abile": combinazione di abilità e/o strumenti, totale = count
    const total = choiceConfig.count ?? 3;
    const allTools = Object.keys(TOOL_LABELS);
    const skillPicked = (choice?.skillChoices ?? options.skillChoices ?? []).slice(0, total);
    const toolPicked = (choice?.toolChoices ?? options.toolChoices ?? [])
      .filter((t) => allTools.includes(t))
      .slice(0, Math.max(0, total - skillPicked.length));
    skills.push(...skillPicked);
    toolProficiencies.push(...toolPicked);
  } else if (choiceConfig?.type === 'hybrid_proficiency_expertise') {
    // "Abilità Impeccabile": 1 competenza + 1 maestria
    const skillCount = choiceConfig.skill_count ?? 1;
    const expCount = choiceConfig.expertise_count ?? 1;
    skills.push(...(choice?.skillChoices ?? []).slice(0, skillCount));
    expertise.push(...(choice?.expertiseChoices ?? []).slice(0, expCount));
  } else if (choiceConfig?.type === 'expertise_gain') {
    // "Dono dell'Abilità": maestria su una skill (+ competenza su tutte via modifier)
    expertise.push(...(choice?.expertiseChoices ?? []).slice(0, choiceConfig.count ?? 1));
    if (modifiers.some((m) => m.type === 'all_skill_proficiency')) {
      skills.push(...ALL_SKILLS);
    }
  } else if (
    choiceConfig?.type === 'observant_skill_choice' ||
    choiceConfig?.type === 'skill_proficiency_or_expertise'
  ) {
    // Skill pool: competenza (se non posseduta) o maestria
    const pool = (choiceConfig.pool as string[] | undefined) ?? [];
    skills.push(...(choice?.skillChoices ?? []).filter((s) => pool.includes(s)));
    expertise.push(...(choice?.expertiseChoices ?? []).filter((s) => pool.includes(s)));
  } else if (choiceConfig?.type === 'saving_throw_proficiency_gain') {
    // "Resiliente": il tiro salvezza coincide con la caratteristica scelta per l'ASI
    const asi = (options.asiChoices ?? [])[0];
    if (asi) savingThrows.push(asi);
  } else if (choiceConfig?.type === 'element_damage_choice') {
    // "Adepto Elementale": tipo di danno scelto (informativo)
    damageType = (choice?.damageTypes ?? [])[0];
  } else if (choiceConfig?.type === 'energy_resistance_choice') {
    // "Dono della Resistenza Energetica": resistenze scelte
    const count = choiceConfig.count ?? 1;
    resistances.push(...(choice?.damageTypes ?? []).slice(0, count));
  } else if (choiceConfig?.type === 'spell_selection') {
    // "Contaminazione Fatata/Oscura": incantesimo scelto (sempre preparato + 1/gg)
    if (choice?.spellName) spells.push(choice.spellName);
  } else if (choiceConfig?.type === 'ritual_spells_gain') {
    // "Incantatore Rituale": incantesimi rituali scelti (sempre preparati)
    spells.push(...(choice?.ritualSpells ?? []));
  }

  // Incantesimi: "Iniziato alla Magia" (spellcasting)
  let spellcasting: FeatSpellChoice | undefined;
  if (choiceConfig?.type === 'spellcasting' && options.spellChoice) {
    const cfg = choiceConfig as { spell_casting_ability_choices?: string[] };
    // Le scelte sono abbreviazioni italiane (INT/SAG/CAR) → slug Ability
    const allowed = (cfg.spell_casting_ability_choices ?? [])
      .map((ab) => parseAbilityFromAbbreviation(ab))
      .filter((a): a is Ability => a != null);
    const abilityOk =
      allowed.length === 0 || allowed.includes(options.spellChoice.ability);
    if (abilityOk) {
      spellcasting = {
        ability: options.spellChoice.ability,
        cantrips: [...options.spellChoice.cantrips],
        spells: [...options.spellChoice.spells],
      };
    }
  }

  // Risorse: granted_resource (es. "Fortunato" → Punti Fortuna)
  const resources: FeatResourceGrant[] = [];
  const grantedResource = feat.granted_resource as
    | {
        name?: string;
        label?: string;
        description?: string;
        scale_with?: string;
        reset_on?: string;
      }
    | null
    | undefined;
  if (grantedResource?.name) {
    resources.push({
      key: grantedResource.name,
      label: grantedResource.label ?? grantedResource.name,
      description: grantedResource.description,
      max: grantedResource.scale_with === 'proficiency_bonus' ? 'proficiency_bonus' : 1,
      resetOn: grantedResource.reset_on ?? 'long_rest',
    });
  }

  // ASI: asi_config (talenti generali/epici). Per gli origin è null → lista vuota.
  const asiBoosts: { ability: Ability; amount: 1 | 2 }[] = [];
  const asiConfig = feat.asi_config as
    | {
        allowed_scores?: string[];
        bonus_value?: number;
        choices_count?: number;
        max_cap?: number;
      }
    | null
    | undefined;
  if (asiConfig && Array.isArray(asiConfig.allowed_scores)) {
    const count = asiConfig.choices_count ?? 1;
    const bonus = (asiConfig.bonus_value as 1 | 2) ?? 1;
    // allowed_scores nel JSON sono abbreviazioni italiane (FOR/DES/...) → slug Ability
    const allowed = (asiConfig.allowed_scores as string[])
      .map((a) => parseAbilityFromAbbreviation(a))
      .filter((a): a is Ability => a != null);
    const chosen = (options.asiChoices ?? []).filter((a) => allowed.includes(a));
    for (let i = 0; i < Math.min(count, chosen.length); i++) {
      asiBoosts.push({ ability: chosen[i], amount: bonus });
    }
  }

  // Competenze in armature/armi/scudi concesse dai granted_modifiers
  // (es. "Competenza nelle Armature Leggere", "Competenza nelle Armi Marziali").
  // Il tipo è FISSO nei dati (armor_type/weapon_type): qui si applica tale competenza.
  const armorProficiencies: ArmorType[] = [];
  const weaponProficiencies: WeaponType[] = [];
  for (const m of modifiers) {
    if (m.type === 'armor_proficiency' && typeof m.armor_type === 'string') {
      const at = m.armor_type as string;
      if (at === 'light' || at === 'medium' || at === 'heavy') armorProficiencies.push(at);
    } else if (m.type === 'shield_proficiency') {
      if (!armorProficiencies.includes('shield')) armorProficiencies.push('shield');
    } else if (m.type === 'weapon_proficiency' && typeof m.weapon_type === 'string') {
      const wt = m.weapon_type as string;
      if (wt === 'simple' || wt === 'martial') weaponProficiencies.push(wt);
    }
  }

  return {
    featId: feat.id,
    modifiers,
    toolProficiencies,
    skills,
    expertise,
    spellcasting,
    resources,
    asiBoosts,
    savingThrows,
    resistances,
    spells,
    damageType,
    armorProficiencies,
    weaponProficiencies,
  };
}
