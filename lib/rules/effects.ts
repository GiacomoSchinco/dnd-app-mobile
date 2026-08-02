import effectsData from '../data/effects.json';
import type { EffectRaw } from '../../types';

/**
 * effects.ts — Gestione degli effetti (effects.json).
 * Gli effetti sono referenziati per ID da `races.json` (razze e lineage).
 */

export const EFFECTS_DATA: EffectRaw[] = effectsData as EffectRaw[];

/** Cerca un effetto per ID */
export function getEffect(id: number): EffectRaw | undefined {
  return EFFECTS_DATA.find((e) => e.id === id);
}

/** Risolve una lista di ID effetti negli oggetti effetto corrispondenti */
export function getEffectsByIds(ids: number[]): EffectRaw[] {
  return ids.map((id) => getEffect(id)).filter((e): e is EffectRaw => Boolean(e));
}

/** Filtra gli effetti per tipo (es. 'choice', 'sense_grant', 'resistance_grant') */
export function getEffectsByType(type: string): EffectRaw[] {
  return EFFECTS_DATA.filter((e) => e.type === type);
}

/** Restituisce tutti gli effetti */
export function getAllEffects(): EffectRaw[] {
  return EFFECTS_DATA;
}

/** Restituisce la descrizione di un effetto (o undefined) */
export function getEffectDescription(id: number): string | undefined {
  return getEffect(id)?.description;
}

/** Restituisce il nome di un effetto (o undefined) */
export function getEffectName(id: number): string | undefined {
  return getEffect(id)?.name;
}
