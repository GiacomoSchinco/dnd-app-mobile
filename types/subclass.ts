// ── Raw JSON Data Types ────────────────────────────────────────

export interface SubclassFeatureData {
  id: number;
  name: string;
  level: number;
  description: string;
}

export interface SubclassRawData {
  id: number;
  class_id: number;
  name: string;
  description: string;
  features: SubclassFeatureData[];
}

// ── Converted Definition ───────────────────────────────────────

export interface SubclassDefinition {
  id: number;
  classId: number;
  name: string;
  description: string;
  features: SubclassFeatureData[];
}
