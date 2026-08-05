import { View, Text, type TextStyle } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Input } from '../../ui/input';
import FilterChip from '../FilterChip';
import { s } from '../../../utils/style-helpers';
import { TYPE_LABELS, RARITY_LABELS, RARITY_COLORS } from './types';

type Props = {
  search: string;
  onSearchChange: (text: string) => void;
  typeFilter: string | null;
  onTypeFilterChange: (type: string | null) => void;
  rarityFilter: string | null;
  onRarityFilterChange: (rarity: string | null) => void;
  filteredCount: number;
};

const TYPE_KEYS = Object.keys(TYPE_LABELS);
const RARITY_KEYS = Object.keys(RARITY_LABELS);

export default function ItemFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  rarityFilter,
  onRarityFilterChange,
  filteredCount,
}: Props) {
  const t = useTokens();

  const labelStyle: TextStyle = {
    fontSize: t.typography.xs,
    fontWeight: '600',
    color: t.colors.foregroundSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: t.spacing[1.5],
  };

  return (
    <View>
      <Input
        placeholder="Cerca oggetto..."
        value={search}
        onChangeText={onSearchChange}
        style={s.mb(t.spacing[3])}
      />

      {/* Type filter */}
      <View style={s.mb(t.spacing[2])}>
        <Text style={labelStyle}>Tipo</Text>
        <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
          {TYPE_KEYS.map((type) => {
            const active = typeFilter === type;
            return (
              <FilterChip
                key={type}
                label={TYPE_LABELS[type]}
                active={active}
                onPress={() => onTypeFilterChange(active ? null : type)}
              />
            );
          })}
        </View>
      </View>

      {/* Rarity filter */}
      <View style={s.mb(t.spacing[2])}>
        <Text style={labelStyle}>Rarità</Text>
        <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
          {RARITY_KEYS.map((rarity) => {
            const active = rarityFilter === rarity;
            const color = RARITY_COLORS[rarity] || '#888';
            return (
              <FilterChip
                key={rarity}
                label={RARITY_LABELS[rarity]}
                active={active}
                onPress={() => onRarityFilterChange(active ? null : rarity)}
                activeBg={color + '20'}
                activeFg={color}
                activeBorder={color}
              />
            );
          })}
        </View>
      </View>

      <Text style={{
        fontSize: t.typography.xs,
        color: t.colors.foregroundTertiary,
        textAlign: 'right',
        marginBottom: t.spacing[2],
      }}>
        {filteredCount} oggetti
      </Text>
    </View>
  );
}
