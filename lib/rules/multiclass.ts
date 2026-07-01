import type { Character, CharacterClass, SpellSlots, SpellcastingProgression, Ability, ClassName, ClassFeature } from '../../types/character';
import { getClass } from './classes';

// ── Tabelle di progressione (D&D 2024) ────────────────────────

const SPELL_SLOTS_PROGRESSION: SpellcastingProgression = {
  fullCaster: {
    1: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    2: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    3: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    4: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    5: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    6: { level1: 4, level2: 3, level3: 3, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    7: { level1: 4, level2: 3, level3: 3, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    8: { level1: 4, level2: 3, level3: 3, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    9: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 1, level6: 0, level7: 0, level8: 0, level9: 0 },
    10: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 0, level7: 0, level8: 0, level9: 0 },
    11: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 0, level8: 0, level9: 0 },
    12: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 0, level8: 0, level9: 0 },
    13: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 0, level9: 0 },
    14: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 0, level9: 0 },
    15: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 0 },
    16: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 0 },
    17: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 1 },
    18: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 1 },
    19: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 1 },
    20: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 1 },
  },
  halfCaster: {
    1: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    2: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    3: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    4: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    5: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    6: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    7: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    8: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    9: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    10: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    11: { level1: 4, level2: 3, level3: 3, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    12: { level1: 4, level2: 3, level3: 3, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    13: { level1: 4, level2: 3, level3: 3, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    14: { level1: 4, level2: 3, level3: 3, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    15: { level1: 4, level2: 3, level3: 3, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    16: { level1: 4, level2: 3, level3: 3, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    17: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 1, level6: 0, level7: 0, level8: 0, level9: 0 },
    18: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 1, level6: 0, level7: 0, level8: 0, level9: 0 },
    19: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 0, level7: 0, level8: 0, level9: 0 },
    20: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 0, level7: 0, level8: 0, level9: 0 },
  },
  thirdCaster: {
    1: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    2: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    3: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    4: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    5: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    6: { level1: 4, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    7: { level1: 4, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    8: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    9: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    10: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    11: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    12: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    13: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    14: { level1: 4, level2: 3, level3: 3, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    15: { level1: 4, level2: 3, level3: 3, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    16: { level1: 4, level2: 3, level3: 3, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    17: { level1: 4, level2: 3, level3: 3, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    18: { level1: 4, level2: 3, level3: 3, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    19: { level1: 4, level2: 3, level3: 3, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
    20: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  },
  pactMagic: {
    1: { slots: 1, level: 1 },
    2: { slots: 2, level: 1 },
    3: { slots: 2, level: 2 },
    4: { slots: 2, level: 2 },
    5: { slots: 2, level: 3 },
    6: { slots: 2, level: 3 },
    7: { slots: 2, level: 4 },
    8: { slots: 2, level: 4 },
    9: { slots: 2, level: 5 },
    10: { slots: 2, level: 5 },
    11: { slots: 3, level: 5 },
    12: { slots: 3, level: 5 },
    13: { slots: 3, level: 5 },
    14: { slots: 3, level: 5 },
    15: { slots: 3, level: 5 },
    16: { slots: 3, level: 5 },
    17: { slots: 4, level: 5 },
    18: { slots: 4, level: 5 },
    19: { slots: 4, level: 5 },
    20: { slots: 4, level: 5 },
  },
};

// ── Utility ────────────────────────────────────────────────────

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getTotalLevel(classes: CharacterClass[]): number {
  return classes.reduce((sum, cls) => sum + cls.level, 0);
}

// ── Multiclass Caster Level ────────────────────────────────────

export function calculateCasterLevel(classes: CharacterClass[]): number {
  let totalLevel = 0;

  for (const cls of classes) {
    const classDef = getClass(cls.className);
    if (!classDef?.isSpellcaster) continue;

    switch (classDef.spellcastingType) {
      case 'full':
        totalLevel += cls.level;
        break;
      case 'half':
        totalLevel += Math.floor(cls.level / 2);
        break;
      case 'third':
        totalLevel += Math.floor(cls.level / 3);
        break;
      case 'pact':
        // Warlock non contribuisce al caster level standard
        break;
    }
  }

  return Math.min(totalLevel, 20);
}

export function calculateSpellSlots(character: Character): SpellSlots {
  const casterLevel = calculateCasterLevel(character.classes);
  return SPELL_SLOTS_PROGRESSION.fullCaster[casterLevel] || {
    level1: 0, level2: 0, level3: 0, level4: 0,
    level5: 0, level6: 0, level7: 0, level8: 0, level9: 0,
  };
}

// ── Spell Preparation ──────────────────────────────────────────

export function canPrepareSpell(character: Character, spellLevel: number): boolean {
  const slots = calculateSpellSlots(character);
  const slotKey = `level${spellLevel}` as keyof SpellSlots;
  return slots[slotKey] > 0;
}

export function getMaxSpellLevel(character: Character): number {
  const slots = calculateSpellSlots(character);
  const slotKeys = ['level9', 'level8', 'level7', 'level6', 'level5', 'level4', 'level3', 'level2', 'level1'];

  for (const key of slotKeys) {
    if (slots[key as keyof SpellSlots] > 0) {
      return parseInt(key.replace('level', ''));
    }
  }
  return 0;
}

export function calculatePreparedSpells(character: Character): number {
  let total = 0;

  for (const cls of character.classes) {
    const classDef = getClass(cls.className);
    if (!classDef?.isSpellcaster || !classDef.spellAbility) continue;

    const abilityMod = getAbilityModifier(character.abilities[classDef.spellAbility]);

    // In D&D 2024: livello + modificatore caratteristica
    total += cls.level + abilityMod;
  }

  return total;
}

// ── Prerequisiti ───────────────────────────────────────────────

export function checkMulticlassPrerequisites(
  currentClasses: CharacterClass[],
  newClassName: ClassName,
  abilities: Character['abilities']
): { valid: boolean; missing: string[] } {
  const newClass = getClass(newClassName);
  if (!newClass) return { valid: false, missing: ['Class not found'] };

  const missing: string[] = [];

  // Prerequisiti della nuova classe
  for (const [ability, minValue] of Object.entries(newClass.prerequisites)) {
    if (abilities[ability as Ability] < minValue) {
      missing.push(`${ability} ${minValue}`);
    }
  }

  // Prerequisiti delle classi esistenti
  for (const cls of currentClasses) {
    const currentClassDef = getClass(cls.className);
    if (!currentClassDef) continue;

    for (const [ability, minValue] of Object.entries(currentClassDef.prerequisites)) {
      if (abilities[ability as Ability] < minValue) {
        missing.push(`${ability} ${minValue} (required by ${currentClassDef.label})`);
      }
    }
  }

  return { valid: missing.length === 0, missing };
}

// ── Features & Leveling ────────────────────────────────────────

export function getClassFeatures(character: Character): ClassFeature[] {
  const features: ClassFeature[] = [];

  for (const cls of character.classes) {
    const classDef = getClass(cls.className);
    if (!classDef) continue;

    for (let level = 1; level <= cls.level; level++) {
      const levelFeatures = classDef.levelFeatures[level] || [];
      features.push(...levelFeatures);
    }
  }

  return features;
}

export function canLevelUp(character: Character, className: ClassName): boolean {
  const cls = character.classes.find((c) => c.className === className);
  if (!cls) return false;
  return cls.level < 20;
}

