import { View, Text, Pressable } from 'react-native';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { useTokens } from '../../ui/prism-provider';
import { s } from '../../../utils/style-helpers';
import { Ionicons } from '@expo/vector-icons';
import DndIcon from '../DndIcon';
import type { ItemDefinition } from '../../../types';
import { TYPE_LABELS, RARITY_LABELS, TYPE_COLORS, getTypeColor, getCategoryLabel, getTypeLabel, getItemIconName } from './types';

type Props = {
  item: ItemDefinition;
  onPress: () => void;
};

export default function ItemCard({ item, onPress }: Props) {
  const t = useTokens();
  const typeColor = TYPE_COLORS[item.type] || '#888';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      <Card style={s.mb(t.spacing[3])}>
        <View style={[s.row, s.gap(t.spacing[3])]}>
          {/* Type Icon */}
          <View style={[s.box(52, 12), { backgroundColor: typeColor + '20' }]}>
            <DndIcon name={getItemIconName(item.type)} size={28} color={typeColor} />
          </View>

          <View style={s.flex}>
            <Text style={{ fontSize: t.typography.md, fontWeight: '600', color: t.colors.foreground }}>
              {item.name}
            </Text>
            <View style={[s.rowWrap, s.gap(t.spacing[1.5]), s.mt(t.spacing[1])]}>
              <Badge variant="solid" size="sm" color={typeColor}>
                {getTypeLabel(item.type)}
              </Badge>
              <Badge variant="subtle" size="sm" color={typeColor}>
                {RARITY_LABELS[item.rarity] || item.rarity}
              </Badge>
            </View>
            <View style={[s.rowWrap, s.gap(t.spacing[1]), s.mt(t.spacing[0.5])]}>
              <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary }}>
                {getCategoryLabel(item.category)} · {item.weight > 0 ? `${item.weight} kg` : '—'} · {item.value} {item.currency}
              </Text>
            </View>
          </View>

          {/* Arrow */}
          <Ionicons name="chevron-forward" size={18} color={t.colors.foregroundTertiary} />
        </View>
      </Card>
    </Pressable>
  );
}
