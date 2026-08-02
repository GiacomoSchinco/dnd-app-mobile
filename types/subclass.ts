import type { ClassFeatureRaw } from './class';

// ── Sottoclassi (subclasses.json) ───────────────────────────────

export interface SubclassRaw {
  id: number;
  class_id: number;
  name: string;
  description: string;
  features: ClassFeatureRaw[];
}
