// ── Effetti (effects.json) ──────────────────────────────────────

export interface EffectRaw {
  id: number;
  name: string;
  type: string;
  key?: string;
  reset_on?: string;
  description: string;
  choice_type?: string;
  count?: number;
  label?: string;
  options?: string[];
  sense?: string;
  value?: number;
  unit?: string;
  condition?: string;
  /** Campi aggiuntivi specifici del tipo di effetto */
  [key: string]: unknown;
}
