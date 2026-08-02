import equipmentPresetData from '../data/equipment_preset.json';
import { getItem } from './items';
import type { EquipmentPresetRaw } from '../../types';

/**
 * equipment-preset.ts — Gestione dei preset di equipaggiamento iniziale
 * (equipment_preset.json).
 *
 * I preset sono di due tipi:
 *  - `type: "class"`      → `target_id` = classes.id (1–12)
 *  - `type: "background"` → `target_id` = backgrounds.id (1–16), preset id 1000–1016
 */

export interface EquipmentPresetItem {
  name: string;
  itemId: number;
  quantity: number;
}

export interface EquipmentPresetDefinition {
  id: number;
  type: 'class' | 'background';
  targetId: number;
  description: string;
  startingGold: number;
  items: EquipmentPresetItem[];
}

function convertRawPreset(raw: EquipmentPresetRaw): EquipmentPresetDefinition {
  return {
    id: raw.id,
    type: raw.type,
    targetId: raw.target_id,
    description: raw.description,
    startingGold: raw.starting_gold,
    items: raw.items.map((it) => ({
      name: it.name,
      itemId: it.item_id,
      quantity: it.quantity,
    })),
  };
}

export const EQUIPMENT_PRESETS_DATA: EquipmentPresetDefinition[] = (equipmentPresetData as EquipmentPresetRaw[]).map(convertRawPreset);

/** Cerca un preset per ID */
export function getEquipmentPreset(id: number): EquipmentPresetDefinition | undefined {
  return EQUIPMENT_PRESETS_DATA.find((p) => p.id === id);
}

/** Filtra i preset per tipo */
export function getPresetsByType(type: 'class' | 'background'): EquipmentPresetDefinition[] {
  return EQUIPMENT_PRESETS_DATA.filter((p) => p.type === type);
}

/** Ottiene il preset di una classe (type "class") per classes.id */
export function getClassPreset(classId: number): EquipmentPresetDefinition | undefined {
  return EQUIPMENT_PRESETS_DATA.find((p) => p.type === 'class' && p.targetId === classId);
}

/** Ottiene il preset di un background (type "background") per backgrounds.id */
export function getBackgroundPreset(backgroundId: number): EquipmentPresetDefinition | undefined {
  return EQUIPMENT_PRESETS_DATA.find((p) => p.type === 'background' && p.targetId === backgroundId);
}

/** Restituisce gli item di un preset */
export function getStartingEquipment(presetId: number): EquipmentPresetItem[] {
  return getEquipmentPreset(presetId)?.items ?? [];
}

/** Restituisce gli item di un preset con i dettagli dell'oggetto risolti da items.ts */
export function resolveStartingEquipment(presetId: number): (EquipmentPresetItem & { item?: ReturnType<typeof getItem> })[] {
  return getStartingEquipment(presetId).map((it) => ({
    ...it,
    item: getItem(it.itemId),
  }));
}
