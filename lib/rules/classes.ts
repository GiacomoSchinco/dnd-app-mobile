import classesData from '../../assets/classes.json';
import type { ClassName, ClassDefinition, Ability, ClassFeature } from '../../types/character';
import type { CharacterClassData } from '../../types';

// ── Mappe di conversione ──────────────────────────────────────

const ABILITY_MAP: Record<string, Ability> = {
  'strength': 'strength',
  'dexterity': 'dexterity',
  'constitution': 'constitution',
  'intelligence': 'intelligence',
  'wisdom': 'wisdom',
  'charisma': 'charisma',
  'forza': 'strength',
  'destrezza': 'dexterity',
  'costituzione': 'constitution',
  'intelligenza': 'intelligence',
  'saggezza': 'wisdom',
  'carisma': 'charisma',
};

const ARMOR_MAP: Record<string, string> = {
  'armature leggere': 'light',
  'armature medie': 'medium',
  'armature pesanti': 'heavy',
  'scudi': 'shield',
};

const WEAPON_MAP: Record<string, string> = {
  'armi semplici': 'simple',
  'armi da guerra': 'martial',
};

const CLASS_LABEL_MAP: Record<string, string> = {
  barbarian: 'Barbaro',
  bard: 'Bardo',
  cleric: 'Chierico',
  druid: 'Druido',
  fighter: 'Guerriero',
  monk: 'Monaco',
  paladin: 'Paladino',
  ranger: 'Ranger',
  rogue: 'Ladro',
  sorcerer: 'Stregone',
  warlock: 'Warlock',
  wizard: 'Mago',
};

const ABILITY_LABEL_MAP: Record<string, string> = {
  strength: 'Forza',
  dexterity: 'Destrezza',
  constitution: 'Costituzione',
  intelligence: 'Intelligenza',
  wisdom: 'Saggezza',
  charisma: 'Carisma',
};

// ── Conversione classe ──────────────────────────────────────

function convertRawClass(rawClass: CharacterClassData): ClassDefinition {
  let spellcastingType: 'full' | 'half' | 'third' | 'pact' | undefined;
  let spellAbility: Ability | undefined;
  let spellPreparation: 'always' | 'longRest' | undefined;

  if (rawClass.spellcasting) {
    spellAbility = ABILITY_MAP[rawClass.spellcasting.ability];

    switch (rawClass.name.toLowerCase()) {
      case 'bard':
      case 'cleric':
      case 'druid':
      case 'sorcerer':
      case 'wizard':
        spellcastingType = 'full';
        spellPreparation = 'longRest';
        break;
      case 'paladin':
      case 'ranger':
        spellcastingType = 'half';
        spellPreparation = 'longRest';
        break;
      case 'warlock':
        spellcastingType = 'pact';
        spellPreparation = 'always';
        break;
    }
  }

  const levelFeatures: Record<number, ClassFeature[]> = {};
  if (rawClass.features) {
    rawClass.features.forEach((feature) => {
      if (!levelFeatures[feature.level]) {
        levelFeatures[feature.level] = [];
      }
      levelFeatures[feature.level].push({
        name: feature.name,
        level: feature.level,
        description: feature.description,
      });
    });
  }

  return {
    name: rawClass.name.toLowerCase() as ClassName,
    label: rawClass.name,
    hitDie: parseInt(rawClass.hit_die.replace('d', '')) as 6 | 8 | 10 | 12,
    primaryAbility: ABILITY_MAP[rawClass.primary_ability[0]],
    prerequisites: {
      [ABILITY_MAP[rawClass.primary_ability[0]]]: 13,
    },
    isSpellcaster: !!rawClass.spellcasting,
    spellcastingType,
    spellAbility,
    spellPreparation,
    proficiencies: {
      armor: rawClass.proficiencies.armor.map((a: string) => ARMOR_MAP[a] || a),
      weapons: rawClass.proficiencies.weapons.map((w: string) => WEAPON_MAP[w] || w),
      tools: rawClass.proficiencies.tools || [],
      savingThrows: rawClass.saving_throws.map((s: string) => ABILITY_MAP[s]),
      skills: rawClass.proficiencies.skills.count,
    },
    levelFeatures,
    hitPoints: rawClass.hit_points,
  };
}

// ── Dati esportati ──────────────────────────────────────────

export const CLASSES_DATA = (classesData as CharacterClassData[]).reduce((acc, rawClass) => {
  const converted = convertRawClass(rawClass);
  acc[converted.name] = converted;
  return acc;
}, {} as Record<ClassName, ClassDefinition>);

// ── Helper Functions ──────────────────────────────────────────

/** Cerca una classe per nome (case-insensitive) */
export function getClass(className: ClassName): ClassDefinition | undefined {
  return CLASSES_DATA[className];
}

/** Restituisce tutte le classi */
export function getAllClasses(): ClassDefinition[] {
  return Object.values(CLASSES_DATA);
}

/** Restituisce le classi con capacità di incantesimo */
export function getSpellcastingClasses(): ClassDefinition[] {
  return Object.values(CLASSES_DATA).filter((cls) => cls.isSpellcaster);
}

/** Filtra classi per tipo di incantatore */
export function getClassesBySpellcastingType(type: 'full' | 'half' | 'third' | 'pact'): ClassDefinition[] {
  return Object.values(CLASSES_DATA).filter((cls) => cls.spellcastingType === type);
}

/** Restituisce il nome italiano di una classe */
export function getClassNameItalian(name: string): string {
  return CLASS_LABEL_MAP[name.toLowerCase()] || name;
}

/** Restituisce il nome italiano di un'abilità */
export function getAbilityLabel(ability: string): string {
  return ABILITY_LABEL_MAP[ability.toLowerCase()] || ability;
}

/** Verifica se una classe è in grado di lanciare incantesimi */
export function isSpellcaster(className: string): boolean {
  const cls = getClass(className.toLowerCase() as ClassName);
  return cls?.isSpellcaster ?? false;
}

/** Restituisce il dado vita di una classe (es. "d8") */
export function getHitDie(className: string): string | null {
  const cls = getClass(className.toLowerCase() as ClassName);
  return cls ? `d${cls.hitDie}` : null;
}

/** Calcola i PF medi al 1° livello */
export function getAverageHpAtFirstLevel(className: string, conModifier: number): number | null {
  const cls = getClass(className.toLowerCase() as ClassName);
  if (!cls) return null;
  return cls.hitPoints.average + conModifier;
}
