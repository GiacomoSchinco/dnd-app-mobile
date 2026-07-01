import spellsData from '../../../assets/spells.json';
import type { Spell, ClassName } from '../../../types';

export type { Spell, ClassName };

export const CLASS_LABELS: Record<ClassName, string> = {
  barbarian: 'Barbaro',
  bard:      'Bardo',
  cleric:    'Chierico',
  druid:     'Druido',
  fighter:   'Guerriero',
  monk:      'Monaco',
  paladin:   'Paladino',
  ranger:    'Ranger',
  rogue:     'Ladro',
  sorcerer:  'Stregone',
  warlock:   'Warlock',
  wizard:    'Mago',
};

export const SCHOOL_LABELS: Record<string, string> = {
  abjuration:     'Abiurazione',
  conjuration:    'Evocazione',
  divination:     'Divinazione',
  enchantment:    'Ammaliamento',
  evocation:      'Invocazione',
  illusion:       'Illusione',
  necromancy:     'Necromanzia',
  transmutation:  'Trasmutazione',
};

export const LEVEL_LABELS: Record<number, string> = {
  0: 'Trucchetto',
  1: '1°', 2: '2°', 3: '3°', 4: '4°',
  5: '5°', 6: '6°', 7: '7°', 8: '8°', 9: '9°',
};

export const SCHOOL_COLORS: Record<string, string> = {
  abjuration:    '#4A90D9',
  conjuration:   '#D4A84B',
  divination:    '#8B6CC9',
  enchantment:   '#D94A8B',
  evocation:     '#D94A4A',
  illusion:      '#6CB6D9',
  necromancy:    '#6B8E6B',
  transmutation: '#D97A4A',
};

export const SCHOOL_MAP: Record<string, { icon: string; color: string }> = {
  abjuration:    { icon: 'abjuration',    color: '#4A90D9' },
  conjuration:   { icon: 'conjuration',   color: '#D4A84B' },
  divination:    { icon: 'divination',    color: '#8B6CC9' },
  enchantment:   { icon: 'enchantment',   color: '#D94A8B' },
  evocation:     { icon: 'evocation',     color: '#D94A4A' },
  illusion:      { icon: 'illusion',      color: '#6CB6D9' },
  necromancy:    { icon: 'necromancy',    color: '#6B8E6B' },
  transmutation: { icon: 'transmutation', color: '#D97A4A' },
};

export function getSchoolColor(school: string): string {
  return SCHOOL_COLORS[school] || '#888';
}

export function spellMatchesClass(spell: Spell, className: string): boolean {
  return spell.classes.some((c: string) => c.toLowerCase() === className.toLowerCase());
}

export const ALL_CLASSES = [...new Set((spellsData as Spell[]).flatMap((s) => s.classes))] as ClassName[];

export function getLevelCounts(): Record<number, number> {
  const counts: Record<number, number> = {};
  (spellsData as Spell[]).forEach((s) => {
    counts[s.level] = (counts[s.level] || 0) + 1;
  });
  return counts;
}
