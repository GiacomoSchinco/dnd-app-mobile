import type { Character } from '../../../types';
import { getFeat } from '../../../lib/rules/feats';

/**
 * spellSourceBadges.ts — Badge colorati per le magie con regole particolari.
 *
 * Alcune magie del PG hanno regole speciali dovute alla loro FONTE:
 *  - talento di origine del background (es. "Iniziato alla Magia"): l'incantesimo
 *    di 1° livello scelto si lancia una volta per riposo lungo SENZA slot;
 *  - talenti generali scelti (es. "Contaminazione Oscura"): gli incantesimi
 *    concessi (granted_modifiers spell_grant) sono gratis 1/gg senza slot;
 *  - razza/lineage (effetti spell_grant): gli incantesimi con
 *    `free_uses_per_long_rest` sono gratis 1/gg senza slot.
 *
 * I trucchetti non vengono marcati: sono già gratuiti per definizione.
 */

/** Badge che indica una regola particolare di una magia (fonte speciale del PG) */
export type SpellSourceBadge = {
  /** Etichetta mostrata (es. 'Gratis 1/gg') */
  label: string;
  /** Colore del badge */
  color: string;
  /** Fonte della regola (assente = badge manuale scelto dall'utente) */
  source?: 'background' | 'feat' | 'race' | 'manual';
};

/** Colori per fonte — unica fonte per i badge delle magie */
export const SPELL_BADGE_COLORS = {
  /** Ambra/gold → talento di origine del background (Iniziato alla Magia) */
  background: '#F59E0B',
  /** Viola → talento generale scelto (Talenti) */
  feat: '#8B5CF6',
  /** Teal → razza/lineage */
  race: '#14B8A6',
} as const;

/**
 * Badge MANUALI che l'utente può assegnare a una magia (dettaglio magia →
 * selettore colore). Stesse regole dei badge automatici ma scelti a mano.
 */
export const MANUAL_BADGES: { key: string; color: string; label: string }[] = [
  { key: 'free', color: '#F59E0B', label: 'Gratis 1/gg' },
  { key: 'feat', color: '#8B5CF6', label: 'Da talento' },
  { key: 'race', color: '#14B8A6', label: 'Da razza' },
  { key: 'limited', color: '#EF4444', label: 'Usi limitati' },
  { key: 'prepared', color: '#3B82F6', label: 'Sempre preparata' },
  { key: 'note', color: '#6B7280', label: 'Da ricordare' },
];

/**
 * Calcola la mappa dei badge per le magie con regole particolari del PG.
 * Ritorna una Map nome incantesimo → badge (una sola voce per magia,
 * la prima fonte che la assegna vince).
 */
export function getSpellSourceBadges(activeChar: Character | null): Map<string, SpellSourceBadge> {
  const map = new Map<string, SpellSourceBadge>();
  if (!activeChar) return map;

  const set = (name: string, badge: SpellSourceBadge) => {
    if (name && !map.has(name)) map.set(name, badge);
  };

  const level = activeChar.level ?? 1;

  // 1) Talento di origine del background ("Iniziato alla Magia"): l'incantesimo
  //    di 1° livello scelto si lancia gratis una volta per riposo lungo.
  const fc = activeChar.choices?.featChoice;
  if (fc && typeof fc === 'object') {
    for (const name of fc.spells ?? []) {
      set(name, { label: 'Gratis 1/gg', color: SPELL_BADGE_COLORS.background, source: 'background' });
    }
  }

  // 2) Talenti generali scelti (ASI): granted_modifiers spell_grant con
  //    free_cast_per_long_rest (es. "Passo Veloce", "Invisibilità").
  for (const id of activeChar.choices?.generalFeatIds ?? []) {
    const feat = getFeat(id);
    if (!feat) continue;
    for (const mod of feat.granted_modifiers ?? []) {
      if (mod.type !== 'spell_grant') continue;
      const spells = mod.spells as Array<{ name?: string; free_cast_per_long_rest?: number }> | undefined;
      if (!Array.isArray(spells)) continue;
      for (const sp of spells) {
        if (sp?.name && sp.free_cast_per_long_rest != null) {
          set(sp.name, { label: 'Da talento · 1/gg', color: SPELL_BADGE_COLORS.feat, source: 'feat' });
        }
      }
    }
  }

  // 3) Razza/lineage (spell_grant): incantesimi con free_uses_per_long_rest attivo
  //    e req_level raggiunto (le cantrip della razza sono già gratuite).
  for (const eff of activeChar.effects ?? []) {
    if (eff.type !== 'spell_grant') continue;
    const spells = eff.spells as Array<{
      name?: string;
      req_level?: number;
      free_uses_per_long_rest?: number | string;
    }> | undefined;
    if (!Array.isArray(spells)) continue;
    for (const sp of spells) {
      if (sp?.name && (sp.req_level ?? 1) <= level && sp.free_uses_per_long_rest != null) {
        set(sp.name, { label: 'Da razza · 1/gg', color: SPELL_BADGE_COLORS.race, source: 'race' });
      }
    }
  }

  return map;
}

/**
 * Badge RISOLTO per una magia: quello manuale dell'utente (se impostato)
 * ha la precedenza, altrimenti quello automatico dalla fonte speciale.
 */
export function resolveSpellBadge(
  activeChar: Character | null,
  spellName: string,
): SpellSourceBadge | null {
  if (!activeChar) return null;
  const manual = activeChar.spellBadges?.[spellName];
  if (manual) return { ...manual, source: 'manual' as const };
  return getSpellSourceBadges(activeChar).get(spellName) ?? null;
}
