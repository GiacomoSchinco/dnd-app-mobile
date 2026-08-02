// ── Dadi (dice) ─────────────────────────────────────────────────

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
export type AdvantageMode = 'normal' | 'advantage' | 'disadvantage';

export interface RollRequest {
  type: DiceType;
  quantity: number;
  mode: AdvantageMode;
  modifier?: number;
}

export interface RollResult {
  request: RollRequest;
  /** Tutti i dadi effettivamente lanciati (incluso quello scartato) */
  allRolls: number[];
  /** I dadi tenuti ed effettivamente sommati nel totale */
  rolls: number[];
  /** I dadi scartati dal calcolo (vantaggio/svantaggio) */
  dropped: number[];
  /** Somma finale di rolls + modifier */
  total: number;
  /** Coppie opzionali (es. per critici o tiri speciali) */
  pairs?: [number, number][];
  /** Il modificatore piatto applicato */
  modifier: number;
}
