import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { useTokens } from '../../ui/prism-provider';
import { s } from '../../../utils/style-helpers';
import { Ionicons } from '@expo/vector-icons';
import DndIcon from '../DndIcon';
import type { ItemDefinition } from '../../../types';
import { TYPE_LABELS, RARITY_LABELS, TYPE_COLORS, getCategoryLabel, getTypeLabel, getItemIconName } from './types';

type Props = {
  item: ItemDefinition;
  onPress: () => void;
  /** Se presente, mostra il toggle di assegnazione (✓ posseduto / + da aggiungere) */
  isOwned?: boolean;
  /** Quantità posseduta (mostrata come badge accanto al nome quando > 1) */
  ownedQuantity?: number;
  /** Azione del toggle di assegnazione (obbligatoria per mostrare il pulsante) */
  onToggleOwned?: () => void;
};

export default function ItemCard({ item, onPress, isOwned = false, ownedQuantity = 1, onToggleOwned }: Props) {
  const t = useTokens();
  const typeColor = TYPE_COLORS[item.type] || '#888';

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`Dettaglio di ${item.name}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      <Card
        variant={isOwned ? 'elevated' : 'default'}
        style={{
          marginBottom: t.spacing[3],
          ...(isOwned ? { borderColor: t.colors.accent } : {}),
        }}
      >
        <View style={[s.row, s.gap(t.spacing[3])]}>
          {/* Type Icon */}
          <View style={[s.box(52, 12), { backgroundColor: typeColor + '20' }]}>
            <DndIcon name={getItemIconName(item.type)} size={28} color={typeColor} />
          </View>

          <View style={s.flex}>
            <View style={[s.row, { alignItems: 'center', gap: t.spacing[2] }]}>
              <Text style={{ fontSize: t.typography.md, fontWeight: '600', color: t.colors.foreground }}>
                {item.name}
              </Text>
              {isOwned && ownedQuantity > 1 && (
                <Badge variant="solid" size="sm" color={t.colors.accent}>
                  {ownedQuantity}×
                </Badge>
              )}
            </View>
            <View style={[s.rowWrap, s.gap(t.spacing[1.5]), s.mt(t.spacing[1])]}>
              <Badge variant="solid" size="sm" color={typeColor}>
                {getTypeLabel(item.type)}
              </Badge>
              <Badge variant="subtle" size="sm" color={typeColor}>
                {RARITY_LABELS[item.rarity] || item.rarity}
              </Badge>
              {isOwned && (
                <Badge variant="subtle" size="sm" color={t.colors.accent}>
                  Posseduto
                </Badge>
              )}
            </View>
            <View style={[s.rowWrap, s.gap(t.spacing[1]), s.mt(t.spacing[0.5])]}>
              <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary }}>
                {getCategoryLabel(item.category)} · {item.weight > 0 ? `${item.weight} kg` : '—'} · {item.value} {item.currency}
              </Text>
            </View>
          </View>

          {onToggleOwned ? (
            <TouchableOpacity
              onPress={onToggleOwned}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={isOwned ? `Rimuovi ${item.name} dall'equipaggiamento` : `Aggiungi ${item.name} all'equipaggiamento`}
              accessibilityState={{ checked: isOwned }}
              style={[
                s.box(40, 20),
                { backgroundColor: isOwned ? t.colors.accent : t.colors.backgroundSecondary, ...s.center },
              ]}
            >
              <Text style={{ fontSize: Math.round(14 * (t.scale ?? 1)), fontWeight: '700', color: isOwned ? t.colors.accentForeground : t.colors.foregroundTertiary }}>
                {isOwned ? '✓' : '+'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-forward" size={Math.round(18 * (t.scale ?? 1))} color={t.colors.foregroundTertiary} />
          )}
        </View>
      </Card>
    </Pressable>
  );
}
