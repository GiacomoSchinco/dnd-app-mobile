// ── Equipaggiamento iniziale (equipment_preset.json) ────────────

export interface EquipmentPresetRaw {
  id: number;
  type: 'class' | 'background';
  target_id: number;
  description: string;
  starting_gold: number;
  items: {
    name: string;
    item_id: number;
    quantity: number;
  }[];
}
