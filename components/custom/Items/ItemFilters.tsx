import { View, Text, TouchableOpacity } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Input } from '../../ui/input';
import { s } from '../../../utils/style-helpers';
import { TYPE_LABELS, RARITY_LABELS, RARITY_COLORS } from './types';
import { useMemo } from 'react';

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
        <Text style={{
          fontSize: t.typography.xs,
          fontWeight: '600',
          color: t.colors.foregroundSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: t.spacing[1.5],
        }}>
          Tipo
        </Text>
        <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
          {TYPE_KEYS.map((type) => {
            const active = typeFilter === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => onTypeFilterChange(active ? null : type)}
                style={{
                  paddingHorizontal: t.spacing[2.5],
                  paddingVertical: t.spacing[1.5],
                  borderRadius: 20,
                  backgroundColor: active ? t.colors.accent : t.colors.backgroundSecondary,
                  borderWidth: 1,
                  borderColor: active ? t.colors.accent : t.colors.border || 'transparent',
                }}
              >
                <Text style={{
                  fontSize: t.typography.xs,
                  fontWeight: '600',
                  color: active ? t.colors.accentForeground : t.colors.foregroundSecondary,
                }}>
                  {TYPE_LABELS[type]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Rarity filter */}
      <View style={s.mb(t.spacing[2])}>
        <Text style={{
          fontSize: t.typography.xs,
          fontWeight: '600',
          color: t.colors.foregroundSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: t.spacing[1.5],
        }}>
          Rarità
        </Text>
        <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
          {RARITY_KEYS.map((rarity) => {
            const active = rarityFilter === rarity;
            const color = RARITY_COLORS[rarity] || '#888';
            return (
              <TouchableOpacity
                key={rarity}
                onPress={() => onRarityFilterChange(active ? null : rarity)}
                style={{
                  paddingHorizontal: t.spacing[2.5],
                  paddingVertical: t.spacing[1.5],
                  borderRadius: 20,
                  backgroundColor: active ? color + '20' : t.colors.backgroundSecondary,
                  borderWidth: 1,
                  borderColor: active ? color : t.colors.border || 'transparent',
                }}
              >
                <Text style={{
                  fontSize: t.typography.xs,
                  fontWeight: '600',
                  color: active ? color : t.colors.foregroundSecondary,
                }}>
                  {RARITY_LABELS[rarity]}
                </Text>
              </TouchableOpacity>
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
