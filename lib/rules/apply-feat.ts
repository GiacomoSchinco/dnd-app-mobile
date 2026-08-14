import type { Ability, FeatModifierRaw, FeatRaw, FeatSpellChoice, SkillName } from '../../types';
import { parseAbilityFromAbbreviation } from './abilities';

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
}

export interface FeatApplyResult {
  featId: number;
  modifiers: FeatModifierRaw[];
  toolProficiencies: string[];
  /** Abilità scelte (hybrid_proficiency) */
  skills: SkillName[];
  /** Scelta incantesimi risolta (spellcasting) */
  spellcasting?: FeatSpellChoice;
  resources: FeatResourceGrant[];
  asiBoosts: { ability: Ability; amount: 1 | 2 }[];
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

/**
 * Applica un talento → concessioni meccaniche.
 * Le scelte non ancora risolte (tool scelti mancanti) vengono semplicemente
 * ignorate: il talento resta registrato ma la concessione è vuota.
 */
export function applyFeat(feat: FeatRaw, options: FeatApplyOptions = {}): FeatApplyResult {
  const modifiers = feat.granted_modifiers ?? [];
  const choiceConfig = feat.choice_config as
    | { type?: string; pool?: string; count?: number }
    | null
    | undefined;

  // Competenze (strumenti e/o abilità) per i choice_config corrispondenti
  const toolProficiencies: string[] = [];
  const skills: SkillName[] = [];
  if (choiceConfig?.type === 'tool_proficiency') {
    const poolKey = normalizeToolPool(choiceConfig.pool);
    const pool = poolKey ? TOOL_POOLS[poolKey] : [];
    const count = choiceConfig.count ?? pool.length;
    const picked = (options.toolChoices ?? []).filter((t) => pool.includes(t));
    toolProficiencies.push(...picked.slice(0, count));
  } else if (choiceConfig?.type === 'hybrid_proficiency') {
    // "Abile": combinazione di abilità e/o strumenti, totale = count
    const total = choiceConfig.count ?? 3;
    const allTools = Object.keys(TOOL_LABELS);
    const skillPicked = (options.skillChoices ?? []).slice(0, total);
    const toolPicked = (options.toolChoices ?? [])
      .filter((t) => allTools.includes(t))
      .slice(0, Math.max(0, total - skillPicked.length));
    skills.push(...skillPicked);
    toolProficiencies.push(...toolPicked);
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
        scale_with?: string;
        reset_on?: string;
      }
    | null
    | undefined;
  if (grantedResource?.name) {
    resources.push({
      key: grantedResource.name,
      label: grantedResource.label ?? grantedResource.name,
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

  return {
    featId: feat.id,
    modifiers,
    toolProficiencies,
    skills,
    spellcasting,
    resources,
    asiBoosts,
  };
}
