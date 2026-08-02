export type { DiceType, AdvantageMode, RollRequest, RollResult } from '../types';
import type { DiceType, AdvantageMode, RollRequest, RollResult } from '../types';

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

export function rollDie(type: DiceType): number {
  return Math.floor(Math.random() * DICE_SIDES[type]) + 1;
}

export function rollDice(type: DiceType, quantity: number): number[] {
  return Array.from({ length: quantity }, () => rollDie(type));
}

export function executeRoll(request: RollRequest): RollResult {
  const { type, quantity, mode, modifier = 0 } = request;
  
  if (mode === 'normal') {
    const rolls = rollDice(type, quantity);
    const total = rolls.reduce((acc, v) => acc + v, 0) + modifier;
    return { request, allRolls: rolls, rolls, dropped: [], total, modifier };
  }

  // Vantaggio/Svantaggio reale: lancia N + 1 dadi totali
  const totalToRoll = quantity + 1;
  const allRolls = rollDice(type, totalToRoll);
  
  // Ordiniamo i dadi in modo crescente
  const sorted = [...allRolls].sort((a, b) => a - b);
  
  let rolls: number[];
  let dropped: number[];

  if (mode === 'advantage') {
    // Rimuove il più basso (il primo elemento dopo il sort crescente)
    dropped = [sorted[0]];
    rolls = sorted.slice(1);
  } else {
    // Rimuove il più alto (l'ultimo elemento dopo il sort crescente)
    dropped = [sorted[sorted.length - 1]];
    rolls = sorted.slice(0, -1);
  }

  const sum = rolls.reduce((acc, v) => acc + v, 0);

  return {
    request,
    allRolls,
    rolls,
    dropped,
    total: sum + modifier,
    modifier,
  };
}

export function formatRollNotation(request: RollRequest): string {
  const { type, quantity, mode, modifier = 0 } = request;
  let notation = `${quantity}${type}`;
  
  if (mode === 'advantage') notation += ' ADV';
  else if (mode === 'disadvantage') notation += ' DIS';
  
  if (modifier > 0) notation += ` +${modifier}`;
  else if (modifier < 0) notation += ` ${modifier}`;
  return notation;
}

export function formatRollBreakdown(result: RollResult): string {
  const parts: string[] = [];
  
  if (result.request.mode === 'normal') {
    parts.push(`[${result.rolls.join(', ')}]`);
  } else {
    // Mostra il dado tenuto e indica tra parentesi quello scartato
    parts.push(`[${result.rolls.join(', ')}] (scartato: ${result.dropped.join(', ')})`);
  }
  
  if (result.modifier !== 0) {
    parts.push(result.modifier > 0 ? `+${result.modifier}` : `${result.modifier}`);
  }
  
  return parts.join(' ');
}