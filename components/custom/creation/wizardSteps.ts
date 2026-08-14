import type { Ability, SkillName } from '../../../types';

/**
 * wizardSteps.ts — Definizioni condivise del wizard di creazione personaggio.
 * Passi, indici e costanti comuni usati dalla schermata e dagli step componenti.
 */

export const STEPS = [
  { key: 'name', label: 'Nome' },
  { key: 'class', label: 'Classe' },
  { key: 'level', label: 'Livello' },
  { key: 'subclass', label: 'Sottoclasse' },
  { key: 'skills', label: 'Competenze' },
  { key: 'race', label: 'Razza' },
  { key: 'background', label: 'Background' },
  { key: 'abilities', label: 'Punteggi' },
  { key: 'feat', label: 'Talenti' },
  { key: 'hp', label: 'Punti Ferita' },
] as const;

export type StepKey = (typeof STEPS)[number]['key'];

/** Ordine canonico delle 6 caratteristiche */
export const ABILITY_ORDER: Ability[] = [
  'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
];

/** Nome della feature ASI in progression.json (da non mostrare come feature) */
export const ASI_FEATURE_NAME = 'Aumento dei Punteggi di Caratteristica';

/**
 * Segnaposto in `featAtAsiLevel` per "modalità Talento ma nessun talento ancora scelto".
 * Un livello con questo valore è in modalità talento ma NON è ancora valido.
 */
export const FEAT_MODE_PENDING = -1;

/** Opzione di competenza in abilità (slug inglese + etichetta italiana) */
export interface SkillOption {
  key: SkillName;
  label: string;
}

/** Modalità di distribuzione di un singolo ASI (5.5e) */
export type AsiMode = 'plus_two' | 'two_plus_ones';

/** Distribuzione di un singolo ASI: slot da riempire (1 per +2, 2 per +1+1) */
export interface AsiAssignment {
  mode: AsiMode;
  slots: (Ability | null)[];
}
