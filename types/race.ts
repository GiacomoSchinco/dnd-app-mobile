// ── Specie / Razze (races.json) ─────────────────────────────────

export interface RaceLineageRaw {
  id: number;
  name: string;
  effects: number[];
}

export interface RaceRaw {
  id: number;
  name: string;
  description: string;
  base_speed: number;
  speed_unit: string;
  size_options: string[];
  effects: number[];
  lineages: RaceLineageRaw[] | null;
}
