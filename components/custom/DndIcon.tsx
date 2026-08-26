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

import Backpack from '../../assets/icon/utility/backpack.svg';
import Bullseye from '../../assets/icon/utility/bullseye.svg';
import Cauldron from '../../assets/icon/utility/cauldron.svg';
import ClassicalKnowledge from '../../assets/icon/utility/classical-knowledge.svg';
import CrownCoin from '../../assets/icon/utility/crown-coin.svg';
import Info from '../../assets/icon/utility/info.svg';
import Invisible from '../../assets/icon/utility/invisible.svg';
import Knapsack from '../../assets/icon/utility/knapsack.svg';
import Medal from '../../assets/icon/utility/medal.svg';
import Notebook from '../../assets/icon/utility/notebook.svg';
import Palette from '../../assets/icon/utility/palette.svg';
import PencilRuler from '../../assets/icon/utility/pencil-ruler.svg';
import Person from '../../assets/icon/utility/person.svg';
import SpellBook from '../../assets/icon/utility/spell-book.svg';
import TrashCan from '../../assets/icon/utility/trash-can.svg';
import Upgrade from '../../assets/icon/utility/upgrade.svg';

import LaurelCrown from '../../assets/icon/utility/laurel-crown.svg';
import MagicSwirl from '../../assets/icon/utility/magic-swirl.svg';
import RosaShield from '../../assets/icon/utility/rosa-shield.svg';
import SwordWound from '../../assets/icon/utility/sword-wound.svg';

import DragonShield from '../../assets/icon/utility/dragon-shield.svg';
import Electric from '../../assets/icon/utility/electric.svg';
import SpikyExplosion from '../../assets/icon/utility/spiky-explosion.svg';

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

export type UtilityName =
  | 'backpack'
  | 'bullseye'
  | 'cauldron'
  | 'classical-knowledge'
  | 'crown-coin'
  | 'dragon-shield'
  | 'electric'
  | 'info'
  | 'invisible'
  | 'knapsack'
  | 'laurel-crown'
  | 'magic-swirl'
  | 'medal'
  | 'notebook'
  | 'palette'
  | 'pencil-ruler'
  | 'person'
  | 'rosa-shield'
  | 'spiky-explosion'
  | 'spell-book'
  | 'sword-wound'
  | 'trash-can'
  | 'upgrade';

export type IconName = DiceName | SchoolName | ItemName | ClassName | StatName | UtilityName;

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
  backpack: Backpack,
  bullseye: Bullseye,
  cauldron: Cauldron,
  'classical-knowledge': ClassicalKnowledge,
  'crown-coin': CrownCoin,
  'dragon-shield': DragonShield,
  electric: Electric,
  info: Info,
  invisible: Invisible,
  knapsack: Knapsack,
  'laurel-crown': LaurelCrown,
  'magic-swirl': MagicSwirl,
  medal: Medal,
  notebook: Notebook,
  palette: Palette,
  'pencil-ruler': PencilRuler,
  person: Person,
  'rosa-shield': RosaShield,
  'spiky-explosion': SpikyExplosion,
  'spell-book': SpellBook,
  'sword-wound': SwordWound,
  'trash-can': TrashCan,
  upgrade: Upgrade,
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
