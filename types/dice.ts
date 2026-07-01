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
  rolls: number[];
  total: number;
  pairs?: [number, number][];
  modifier: number;
}
