export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
export type AdvantageMode = 'normal' | 'advantage' | 'disadvantage';

export const DICE_SIDES: Record<DiceType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
};

export const DICE_TYPES: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

export const DICE_COLORS: Record<DiceType, string> = {
  d4: '#EF4444',
  d6: '#22C55E',
  d8: '#3B82F6',
  d10: '#F59E0B',
  d12: '#8B5CF6',
  d20: '#EC4899',
};

export interface RollRequest {
  type: DiceType;
  quantity: number;
  mode: AdvantageMode;
  modifier?: number;
}

export interface RollResult {
  request: RollRequest;
  /** The final dice values used in the total (after advantage/disadvantage) */
  rolls: number[];
  /** Sum of rolls + modifier */
  total: number;
  /** For advantage/disadvantage: all pairs rolled */
  pairs?: [number, number][];
  /** The flat modifier added */
  modifier: number;
}

/** Roll a single die of the given type */
export function rollDie(type: DiceType): number {
  return Math.floor(Math.random() * DICE_SIDES[type]) + 1;
}

/** Roll N dice of the given type */
export function rollDice(type: DiceType, quantity: number): number[] {
  return Array.from({ length: quantity }, () => rollDie(type));
}

/**
 * Execute a full roll request.
 *
 * - **normal**: rolls `quantity` dice, sums them.
 * - **advantage**: rolls `quantity + 1` dice, drops the **lowest**, sums the rest.
 * - **disadvantage**: rolls `quantity + 1` dice, drops the **highest**, sums the rest.
 *
 * Returns the result with all details needed for display.
 */
export function executeRoll(request: RollRequest): RollResult {
  const { type, quantity, mode, modifier = 0 } = request;
  let rolls: number[];
  let pairs: [number, number][] | undefined;
  let dropped: number[] | undefined;

  if (mode === 'normal') {
    rolls = rollDice(type, quantity);
  } else {
    // For advantage/disadvantage we roll pairs: for each die, roll 2 and pick
    pairs = Array.from({ length: quantity }, () => [rollDie(type), rollDie(type)]);
    const chosen: number[] = [];
    const notChosen: number[] = [];

    for (const [a, b] of pairs) {
      if (mode === 'advantage') {
        chosen.push(Math.max(a, b));
        notChosen.push(Math.min(a, b));
      } else {
        chosen.push(Math.min(a, b));
        notChosen.push(Math.max(a, b));
      }
    }

    rolls = chosen;
    dropped = notChosen;
  }

  const sum = rolls.reduce((acc, v) => acc + v, 0);

  return {
    request,
    rolls,
    total: sum + modifier,
    pairs,
    modifier,
  };
}

/** Get a human-readable notation like "3d6", "2d20v" */
export function formatRollNotation(request: RollRequest): string {
  const { type, quantity, mode, modifier = 0 } = request;
  let notation = `${quantity}${type}`;
  if (mode === 'advantage') notation += 'v';
  else if (mode === 'disadvantage') notation += 's';
  if (modifier > 0) notation += ` +${modifier}`;
  else if (modifier < 0) notation += ` ${modifier}`;
  return notation;
}

/** Get a human-readable breakdown string */
export function formatRollBreakdown(result: RollResult): string {
  const parts: string[] = [];
  parts.push(`[${result.rolls.join(', ')}]`);
  if (result.pairs) {
    const pairStrs = result.pairs.map(([a, b]) => `(${a},${b})`);
    parts.push(`tirati: ${pairStrs.join(' ')}`);
  }
  if (result.modifier !== 0) {
    parts.push(result.modifier > 0 ? `+${result.modifier}` : `${result.modifier}`);
  }
  return parts.join(' ');
}
