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

export type IconName = DiceName | SchoolName | ItemName;

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
