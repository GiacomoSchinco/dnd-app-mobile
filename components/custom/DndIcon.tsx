import type { FC } from 'react';
import { View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

// I file .svg vengono importati DIRETTAMENTE da assets/icon (fonte unica)
// grazie a react-native-svg-transformer (vedi metro.config.cjs + .svgrrc).
// Per aggiungere/cambiare un'icona: tocca il file in assets/icon/... e basta.
import D4 from '../../assets/icon/dice/d4.svg';
import D6 from '../../assets/icon/dice/d6.svg';
import D8 from '../../assets/icon/dice/d8.svg';
import D10 from '../../assets/icon/dice/d10.svg';
import D12 from '../../assets/icon/dice/d12.svg';
import D20 from '../../assets/icon/dice/d20.svg';

import Abjuration from '../../assets/icon/schoolspells/abjuration.svg';
import Conjuration from '../../assets/icon/schoolspells/conjuration.svg';
import Divination from '../../assets/icon/schoolspells/divination.svg';
import Enchantment from '../../assets/icon/schoolspells/enchantment.svg';
import Evocation from '../../assets/icon/schoolspells/evocation.svg';
import Illusion from '../../assets/icon/schoolspells/illusion.svg';
import Necromancy from '../../assets/icon/schoolspells/necromancy.svg';
import Transmutation from '../../assets/icon/schoolspells/transmutation.svg';

import Ammunition from '../../assets/icon/items/ammunition.svg';
import Armor from '../../assets/icon/items/armor.svg';
import Consumable from '../../assets/icon/items/consumable.svg';
import Currency from '../../assets/icon/items/currency.svg';
import Gear from '../../assets/icon/items/gear.svg';
import Tool from '../../assets/icon/items/tool.svg';
import Weapon from '../../assets/icon/items/weapon.svg';

import Barbarian from '../../assets/icon/classes/barbarian.svg';
import Bard from '../../assets/icon/classes/bard.svg';
import Cleric from '../../assets/icon/classes/cleric.svg';
import Druid from '../../assets/icon/classes/druid.svg';
import Fighter from '../../assets/icon/classes/fighter.svg';
import Monk from '../../assets/icon/classes/monk.svg';
import Paladin from '../../assets/icon/classes/paladin.svg';
import Ranger from '../../assets/icon/classes/ranger.svg';
import Rogue from '../../assets/icon/classes/rogue.svg';
import Sorcerer from '../../assets/icon/classes/sorcerer.svg';
import Warlock from '../../assets/icon/classes/warlock.svg';
import Wizard from '../../assets/icon/classes/wizard.svg';

import Strength from '../../assets/icon/stats/icon_strength.svg';
import Dexterity from '../../assets/icon/stats/icon_dexterity.svg';
import Constitution from '../../assets/icon/stats/icon_constitution.svg';
import Intelligence from '../../assets/icon/stats/icon_intelligence.svg';
import Wisdom from '../../assets/icon/stats/icon_wisdom.svg';
import Charisma from '../../assets/icon/stats/icon_charisma.svg';

export type ClassName =
  | 'barbarian'
  | 'bard'
  | 'cleric'
  | 'druid'
  | 'fighter'
  | 'monk'
  | 'paladin'
  | 'ranger'
  | 'rogue'
  | 'sorcerer'
  | 'warlock'
  | 'wizard';

export type DiceName = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

export type SchoolName =
  | 'abjuration'
  | 'conjuration'
  | 'divination'
  | 'enchantment'
  | 'evocation'
  | 'illusion'
  | 'necromancy'
  | 'transmutation';

export type ItemName =
  | 'ammunition'
  | 'armor'
  | 'consumable'
  | 'currency'
  | 'gear'
  | 'tool'
  | 'weapon';

export type StatName =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma';

export type IconName = DiceName | SchoolName | ItemName | ClassName | StatName;

const ICONS: Record<IconName, FC<SvgProps>> = {
  d4: D4,
  d6: D6,
  d8: D8,
  d10: D10,
  d12: D12,
  d20: D20,
  abjuration: Abjuration,
  conjuration: Conjuration,
  divination: Divination,
  enchantment: Enchantment,
  evocation: Evocation,
  illusion: Illusion,
  necromancy: Necromancy,
  transmutation: Transmutation,
  ammunition: Ammunition,
  armor: Armor,
  consumable: Consumable,
  currency: Currency,
  gear: Gear,
  tool: Tool,
  weapon: Weapon,
  barbarian: Barbarian,
  bard: Bard,
  cleric: Cleric,
  druid: Druid,
  fighter: Fighter,
  monk: Monk,
  paladin: Paladin,
  ranger: Ranger,
  rogue: Rogue,
  sorcerer: Sorcerer,
  warlock: Warlock,
  wizard: Wizard,
  strength: Strength,
  dexterity: Dexterity,
  constitution: Constitution,
  intelligence: Intelligence,
  wisdom: Wisdom,
  charisma: Charisma,
};

type Props = {
  name: IconName;
  size?: number;
  color?: string;
};

export default function DndIcon({ name, size = 24, color = '#FFFFFF' }: Props) {
  const Icon = ICONS[name];
  if (!Icon) return null;

  return (
    <View style={{ width: size, height: size }}>
      <Icon width={size} height={size} fill={color} />
    </View>
  );
}
