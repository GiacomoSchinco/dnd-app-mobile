import { View, Text, Pressable } from 'react-native';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { useTokens } from '../../ui/prism-provider';
import { spacing, fontSizes } from '../../../utils/styles';
import { Ionicons } from '@expo/vector-icons';
import DndIcon from '../DndIcon';
import type { ItemDefinition } from '../../../types';
import { TYPE_LABELS, RARITY_LABELS, TYPE_COLORS, getTypeColor, getCategoryLabel, getTypeLabel } from './types';

type Props = {
  item: ItemDefinition;
  onPress: () => void;
};

export default function ItemCard({ item, onPress }: Props) {
  const t = useTokens();
  const typeColor = TYPE_COLORS[item.type] || '#888';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      <Card style={{ marginBottom: spacing[3] }}>
        <View style={{ flexDirection: 'row', gap: spacing[3], alignItems: 'center' }}>
          {/* Type Icon */}
          <View style={{
            backgroundColor: typeColor + '20',
            borderRadius: 12,
            width: 52,
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <DndIcon name={item.type as any} size={28} color={typeColor} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fontSizes.md, fontWeight: '600', color: t.colors.foreground }}>
              {item.name}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing[1.5], flexWrap: 'wrap', alignItems: 'center', marginTop: spacing[1] }}>
              <Badge variant="solid" size="sm" color={typeColor}>
                {getTypeLabel(item.type)}
              </Badge>
              <Badge variant="subtle" size="sm" color={typeColor}>
                {RARITY_LABELS[item.rarity] || item.rarity}
              </Badge>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing[1], flexWrap: 'wrap', alignItems: 'center', marginTop: spacing[0.5] }}>
              <Text style={{ fontSize: fontSizes.xs, color: t.colors.foregroundSecondary }}>
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
