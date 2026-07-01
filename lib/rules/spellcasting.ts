import type { SpellCastingClass, SpellProgression } from '../../types';

/** Tutte le classi che usano magia. */
export const SPELLCASTING_CLASSES: SpellCastingClass[] = [
  'wizard', 'sorcerer', 'bard', 'cleric', 'druid', 'paladin', 'ranger', 'warlock',
];

/** Classi che preparano incantesimi. */
export const PREPARER_CLASSES = ['cleric', 'druid', 'paladin'] as const;

/** Classi che preparano al level-up (include il Mago). */
export const PREPARER_CLASSES_LEVELUP = ['cleric', 'druid', 'paladin', 'wizard'] as const;

/** Classi che conoscono incantesimi E possono sostituirne uno al level-up. */
export const SWAP_CLASSES = ['bard', 'sorcerer', 'ranger', 'warlock'] as const;

// --------------------------------------------------------------
// 1. PROGRESSIONE TRUCCHETTI (Cantrips) - REGOLAMENTO 2024
// --------------------------------------------------------------
const cantripsProgression: Record<SpellCastingClass, Record<number, number>> = {
  wizard:   {1:3,2:3,3:3,4:4,5:4,6:4,7:4,8:4,9:4,10:5,11:5,12:5,13:5,14:5,15:5,16:5,17:5,18:5,19:5,20:5},
  cleric:   {1:3,2:3,3:3,4:4,5:4,6:4,7:4,8:4,9:4,10:5,11:5,12:5,13:5,14:5,15:5,16:5,17:5,18:5,19:5,20:5},
  sorcerer: {1:4,2:4,3:4,4:5,5:5,6:5,7:5,8:5,9:5,10:6,11:6,12:6,13:6,14:6,15:6,16:6,17:6,18:6,19:6,20:6},
  warlock:  {1:3,2:3,3:3,4:4,5:4,6:4,7:4,8:4,9:4,10:5,11:5,12:5,13:5,14:5,15:5,16:5,17:5,18:5,19:5,20:5}, // 2024: Parte da 3
  bard:     {1:2,2:2,3:2,4:3,5:3,6:3,7:3,8:3,9:3,10:4,11:4,12:4,13:4,14:4,15:4,16:4,17:4,18:4,19:4,20:4},
  druid:    {1:2,2:2,3:2,4:3,5:3,6:3,7:3,8:3,9:3,10:4,11:4,12:4,13:4,14:4,15:4,16:4,17:4,18:4,19:4,20:4},
  paladin:  {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0,18:0,19:0,20:0},
  ranger:   {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0,18:0,19:0,20:0},
};

// --------------------------------------------------------------
// 2. TABELLE QUANTITATIVE INCANTESIMI - REGOLAMENTO 2024
// --------------------------------------------------------------
// Nel 2024, maghi, chierici, druidi e stregoni condividono la stessa identica quota fissa
const fullCasterSpellsTable: Record<number, number> = {
  1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:13,
  11:14, 12:14, 13:15, 14:15, 15:16, 16:16, 17:17, 18:17, 19:18, 20:18
};

const bardSpellsTable: Record<number, number> = {
  1:4, 2:5, 3:6, 4:7, 5:8, 6:9, 7:10, 8:11, 9:12, 10:14,
  11:15, 12:15, 13:16, 14:16, 15:17, 16:17, 17:18, 18:18, 19:19, 20:19
};

// Condivisa tra Paladino (Preparati) e Ranger (Conosciuti)
const halfCasterSpellsTable: Record<number, number> = {
  1:2, 2:3, 3:4, 4:5, 5:6, 6:6, 7:7, 8:7, 9:8, 10:8,
  11:9, 12:9, 13:10, 14:10, 15:11, 16:11, 17:12, 18:12, 19:13, 20:13
};

const warlockSpellsTable: Record<number, number> = {
  1:2, 2:3, 3:4, 4:5, 5:6, 6:7, 7:8, 8:9, 9:10, 10:11,
  11:12, 12:12, 13:13, 14:13, 15:14, 16:14, 17:15, 18:15, 19:16, 20:16
};

// --------------------------------------------------------------
// 3. SLOT INCANTESIMI - INVARTIATI NEL 2024
// --------------------------------------------------------------
const fullCasterSlots: Record<number, Record<number, number>> = {
  1: {1:2},
  2: {1:3},
  3: {1:4,2:2},
  4: {1:4,2:3},
  5: {1:4,2:3,3:2},
  6: {1:4,2:3,3:3},
  7: {1:4,2:3,3:3,4:1},
  8: {1:4,2:3,3:3,4:2},
  9: {1:4,2:3,3:3,4:3,5:1},
  10:{1:4,2:3,3:3,4:3,5:2},
  11:{1:4,2:3,3:3,4:3,5:2,6:1},
  12:{1:4,2:3,3:3,4:3,5:2,6:1},
  13:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},
  14:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},
  15:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},
  16:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},
  17:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1,9:1},
  18:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1,9:1},
  19:{1:4,2:3,3:3,4:3,5:3,6:2,7:1,8:1,9:1},
  20:{1:4,2:3,3:3,4:3,5:3,6:2,7:2,8:1,9:1},
};

const halfCasterSlots: Record<number, Record<number, number>> = {
  1: {1:2}, // 2024: Magia sbloccata subito al livello 1
  2: {1:2},
  3: {1:3},
  4: {1:3},
  5: {1:4,2:2},
  6: {1:4,2:2},
  7: {1:4,2:3},
  8: {1:4,2:3},
  9: {1:4,2:3,3:2},
  10:{1:4,2:3,3:2},
  11:{1:4,2:3,3:3},
  12:{1:4,2:3,3:3},
  13:{1:4,2:3,3:3,4:1},
  14:{1:4,2:3,3:3,4:1},
  15:{1:4,2:3,3:3,4:2},
  16:{1:4,2:3,3:3,4:2},
  17:{1:4,2:3,3:3,4:3},
  18:{1:4,2:3,3:3,4:3},
  19:{1:4,2:3,3:3,4:3,5:1},
  20:{1:4,2:3,3:3,4:3,5:1},
};

const CASTER_CLASSES = new Set<string>([
  'wizard', 'sorcerer', 'bard', 'cleric', 'druid', 'paladin', 'ranger', 'warlock',
]);

// --------------------------------------------------------------
// 4. FUNZIONE PRINCIPALE - AGGIORNATA 2024
// --------------------------------------------------------------
export function getSpellProgression(className: string, level: number): SpellProgression {
  if (!CASTER_CLASSES.has(className)) {
    return { cantrips: 0, spellsKnown: null, spellSlots: {} };
  }

  const cls = className as SpellCastingClass;
  const progression: SpellProgression = {
    cantrips: 0,
    spellsKnown: null,
    spellSlots: {},
  };

  // 1. Cantrips
  progression.cantrips = cantripsProgression[cls]?.[level] ?? 0;

  // 2. Spells Known / Spells Preparable (Fissi nel 2024, no modificatori caratteristica)
  if (['wizard', 'cleric', 'druid', 'paladin'].includes(cls)) {
    progression.spellsKnown = null; // Classi che preparano

    if (cls === 'wizard') {
      progression.preparedModifier = 'int';
      progression.wizardSpellbookSize = 6 + (level - 1) * 2; // 6 iniziali + 2 per ogni livello successivo
      progression.spellsPreparable = fullCasterSpellsTable[level];
    } else if (cls === 'cleric' || cls === 'druid') {
      progression.preparedModifier = 'wis';
      progression.spellsPreparable = fullCasterSpellsTable[level];
    } else if (cls === 'paladin') {
      progression.preparedModifier = 'cha';
      progression.spellsPreparable = halfCasterSpellsTable[level];
    }
  } else {
    // Classi a incantesimi conosciuti
    if (cls === 'bard') progression.spellsKnown = bardSpellsTable[level];
    else if (cls === 'sorcerer') progression.spellsKnown = fullCasterSpellsTable[level];
    else if (cls === 'ranger') progression.spellsKnown = halfCasterSpellsTable[level];
    else if (cls === 'warlock') progression.spellsKnown = warlockSpellsTable[level];
  }

  // 3. Slot incantesimi e Pact Magic
  if (cls === 'warlock') {
    let pactSlots = 2;
    let pactLevel = 1;

    if (level === 1) { pactSlots = 1; pactLevel = 1; }
    else if (level === 2) { pactSlots = 2; pactLevel = 1; } // 2024: 2 slot fin dal livello 2
    else if (level <= 4) { pactLevel = 2; }
    else if (level <= 6) { pactLevel = 3; }
    else if (level <= 8) { pactLevel = 4; }
    else if (level <= 10) { pactLevel = 5; }
    else if (level <= 16) { pactSlots = 3; pactLevel = 5; }
    else { pactSlots = 4; pactLevel = 5; }

    progression.pactMagic = { slots: pactSlots, level: pactLevel };
    if (level >= 11) progression.pactMagic.mysticArcanum = [6];
    if (level >= 13) progression.pactMagic.mysticArcanum!.push(7);
    if (level >= 15) progression.pactMagic.mysticArcanum!.push(8);
    if (level >= 17) progression.pactMagic.mysticArcanum!.push(9);
  } else {
    const isFullCaster = ['wizard', 'sorcerer', 'bard', 'cleric', 'druid'].includes(cls);
    const slotsTable = isFullCaster ? fullCasterSlots : halfCasterSlots;
    progression.spellSlots = slotsTable[level] ?? {};
  }

  return progression;
}

// --------------------------------------------------------------
// 5. FUNZIONE PER IL LEVEL UP - AGGIORNATA 2024
// --------------------------------------------------------------
export function getLevelUpSpellChanges(
  className: string,
  oldLevel: number,
  newLevel: number
): {
  newCantrips: number;
  newSpellsKnown: number;
  newSpellsPreparable: number;
  wizardSpellbookAdded?: number;
  newSpellSlots: Record<number, number>;
  totalSpellSlots: Record<number, number>;
  newPactMagic?: SpellProgression['pactMagic'];
} {
  const oldProg = getSpellProgression(className, oldLevel);
  const newProg = getSpellProgression(className, newLevel);

  // Calcolo dei nuovi slot guadagnati (delta)
  const newSpellSlots: Record<number, number> = {};
  for (const [lvl, count] of Object.entries(newProg.spellSlots)) {
    const delta = (count as number) - (oldProg.spellSlots[Number(lvl)] ?? 0);
    if (delta > 0) newSpellSlots[Number(lvl)] = delta;
  }

  const changes: any = {
    newCantrips: newProg.cantrips - oldProg.cantrips,
    newSpellsKnown: (newProg.spellsKnown ?? 0) - (oldProg.spellsKnown ?? 0),
    newSpellsPreparable: (newProg.spellsPreparable ?? 0) - (oldProg.spellsPreparable ?? 0),
    newSpellSlots,
    totalSpellSlots: newProg.spellSlots,
    newPactMagic: newProg.pactMagic,
  };

  // Se è un mago, calcola quanti incantesimi gratuiti inserisce nel grimorio salendo di livello
  if (className === 'wizard') {
    changes.wizardSpellbookAdded = (newLevel - oldLevel) * 2;
  }

  return changes;
}