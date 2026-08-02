import racesData from '../data/races.json';
import { getEffectsByIds } from './effects';
import type { EffectRaw, RaceRaw } from '../../types';

/**
 * races.ts — Gestione delle specie/razze (races.json).
 * 10 razze. `name` è in italiano ('Umano', 'Elfo', ...).
 * I tratti sono modellati come `effects` (ID riferiti a effects.json),
 * incluse le lineage (sottorazze).
 */

export interface RaceLineageDefinition {
  id: number;
  name: string;
  effectIds: number[];
  effects: EffectRaw[];
}

export interface RaceDefinition {
  id: number;
  name: string;
  description: string;
  baseSpeed: number;
  speedUnit: string;
  sizeOptions: string[];
  effectIds: number[];
  effects: EffectRaw[];
  lineages: RaceLineageDefinition[] | null;
}

function convertRawRace(raw: RaceRaw): RaceDefinition {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    baseSpeed: raw.base_speed,
    speedUnit: raw.speed_unit,
    sizeOptions: raw.size_options,
    effectIds: raw.effects,
    effects: getEffectsByIds(raw.effects),
    lineages: raw.lineages
      ? raw.lineages.map((l) => ({
          id: l.id,
          name: l.name,
          effectIds: l.effects,
          effects: getEffectsByIds(l.effects),
        }))
      : null,
  };
}

export const RACES_DATA: RaceDefinition[] = (racesData as RaceRaw[]).map(convertRawRace);

// ── Risoluzione ────────────────────────────────────────────────

function resolveRace(race: RaceDefinition | number | string): RaceDefinition | undefined {
  if (typeof race === 'object' && race !== null) return race;
  if (typeof race === 'number') return getRaceById(race);
  return getRace(race);
}

// ── Helper Functions ──────────────────────────────────────────

/** Cerca una razza per ID (races.id) */
export function getRaceById(id: number): RaceDefinition | undefined {
  return RACES_DATA.find((r) => r.id === id);
}

/** Cerca una razza per nome (case-insensitive) */
export function getRace(name: string): RaceDefinition | undefined {
  const lower = name.toLowerCase();
  return RACES_DATA.find((r) => r.name.toLowerCase() === lower);
}

/** Restituisce tutte le razze */
export function getAllRaces(): RaceDefinition[] {
  return RACES_DATA;
}

/** Velocità base di una razza */
export function getRaceSpeed(race: RaceDefinition | number | string): number {
  return resolveRace(race)?.baseSpeed ?? 9;
}

/** Unità di misura della velocità (es. 'meters') */
export function getRaceSpeedUnit(race: RaceDefinition | number | string): string {
  return resolveRace(race)?.speedUnit ?? 'meters';
}

/** Opzioni di taglia di una razza */
export function getRaceSizeOptions(race: RaceDefinition | number | string): string[] {
  return resolveRace(race)?.sizeOptions ?? [];
}

/** Verifica se una razza ha lineage (sottorazze) */
export function hasLineages(race: RaceDefinition | number | string): boolean {
  const lineages = resolveRace(race)?.lineages;
  return lineages != null && lineages.length > 0;
}

/** Restituisce le lineage di una razza (o null) */
export function getLineages(race: RaceDefinition | number | string): RaceLineageDefinition[] | null {
  return resolveRace(race)?.lineages ?? null;
}

/** Cerca una lineage per ID all'interno di una razza */
export function getLineageById(race: RaceDefinition | number | string, lineageId: number): RaceLineageDefinition | undefined {
  return getLineages(race)?.find((l) => l.id === lineageId);
}

/** Effetti complessivi di una razza (razza + eventuale lineage) */
export function getRaceEffects(race: RaceDefinition | number | string, lineageId?: number): EffectRaw[] {
  const def = resolveRace(race);
  if (!def) return [];
  const lineage = lineageId != null ? getLineageById(def, lineageId) : undefined;
  return [...def.effects, ...(lineage?.effects ?? [])];
}

/** ID degli effetti complessivi di una razza (razza + eventuale lineage) */
export function getRaceEffectIds(race: RaceDefinition | number | string, lineageId?: number): number[] {
  const def = resolveRace(race);
  if (!def) return [];
  const lineage = lineageId != null ? getLineageById(def, lineageId) : undefined;
  return [...def.effectIds, ...(lineage?.effectIds ?? [])];
}

// ── Alias (compatibilità con nomi precedenti) ─────────────────

/** Verifica se una razza ha sottorazze (lineage) */
export function hasSubraces(race: RaceDefinition | number | string): boolean {
  return hasLineages(race);
}

/** Nomi delle sottorazze (lineage) di una razza (o null) */
export function getSubraces(race: RaceDefinition | number | string): string[] | null {
  const lineages = getLineages(race);
  return lineages ? lineages.map((l) => l.name) : null;
}
