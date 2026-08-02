// ── Progressione (progression.json) ─────────────────────────────

export interface ProgressionResourceRaw {
  label: string;
  type?: string;
  /** Valori per livello — numeri (es. cariche) o stringhe (es. dado arti marziali '1d8') */
  per_level?: Record<string, number | string>;
  [key: string]: unknown;
}

export interface ProgressionClassRaw {
  label: string;
  subclass_label: string;
  subclass_levels: number[];
  features_by_level: Record<string, string[]>;
  resources: Record<string, ProgressionResourceRaw>;
}

export interface ProgressionDataRaw {
  shared: {
    proficiency_bonus: Record<string, number>;
    asi_levels: number[];
    epic_boon_level: number;
  };
  classes: Record<string, ProgressionClassRaw>;
}
