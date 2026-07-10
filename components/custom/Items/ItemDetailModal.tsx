import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Badge } from '../../ui/badge';
import { s } from '../../../utils/style-helpers';
import { Ionicons } from '@expo/vector-icons';
import DndIcon from '../DndIcon';
import type { ItemDefinition } from '../../../types';
import { TYPE_LABELS, RARITY_LABELS, TYPE_COLORS, getTypeColor, getCategoryLabel, getTypeLabel } from './types';
import BottomModal from '../BottomModal';

type Props = {
  item: ItemDefinition | null;
  onClose: () => void;
};

function DetailChip({ label, value, t, color }: { label: string; value: string; t: any; color?: string }) {
  return (
    <View style={{
      backgroundColor: t.colors.backgroundSecondary,
      borderRadius: t.radius.sm,
      paddingHorizontal: t.spacing[2],
      paddingVertical: t.spacing[1],
    }}>
      <Text style={{ fontSize: 10, color: t.colors.foregroundTertiary, fontWeight: '600', textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text style={{ fontSize: t.typography.sm, color: color || t.colors.foreground, fontWeight: '500' }}>
        {value}
      </Text>
    </View>
  );
}

export default function ItemDetailModal({ item, onClose }: Props) {
  const t = useTokens();

  return (
    <BottomModal visible={!!item} onClose={onClose}>
      {item && (
        <>
          {/* Header */}
          <View style={[s.row, s.gap(t.spacing[3]), s.mb(t.spacing[3])]}>
            <View style={[s.box(56, t.radius.xl), { backgroundColor: (TYPE_COLORS[item.type] || '#888') + '20' }]}>
              <DndIcon name={item.type as any} size={30} color={TYPE_COLORS[item.type] || '#888'} />
            </View>
            <View style={s.flex}>
              <View style={[s.row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
                <Text style={{ fontSize: t.typography.xl, fontWeight: '700', color: t.colors.foreground, flex: 1, marginRight: t.spacing[2] }}>
                  {item.name}
                </Text>
                <TouchableOpacity onPress={onClose} style={s.p(t.spacing[1])}>
                  <Text style={{ fontSize: 20, color: t.colors.foregroundTertiary }}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={[s.rowWrap, s.gap(t.spacing[1.5]), s.mt(t.spacing[1])]}>
                <Badge variant="solid" color={TYPE_COLORS[item.type] || '#888'}>
                  {getTypeLabel(item.type)}
                </Badge>
                <Badge variant="subtle">
                  {RARITY_LABELS[item.rarity] || item.rarity}
                </Badge>
              </View>
            </View>
          </View>

          {/* Chips */}
          <View style={[s.rowWrap, s.gap(t.spacing[2]), s.mb(t.spacing[3])]}>
            <DetailChip label="Categoria" value={getCategoryLabel(item.category)} t={t} />
            <DetailChip label="Peso" value={item.weight > 0 ? `${item.weight} kg` : '—'} t={t} />
            <DetailChip label="Valore" value={`${item.value} ${item.currency}`} t={t} />
            {item.requiresAttunement && (
              <DetailChip label="Richiede" value="Sintonia" t={t} color="#D9A84A" />
            )}
          </View>

          {/* Weapon properties */}
          {item.type === 'weapon' && item.properties && typeof item.properties === 'object' && 'damage' in item.properties && (
            <View style={[s.rowWrap, s.gap(t.spacing[2]), s.mb(t.spacing[3])]}>
              <DetailChip label="Danno" value={String(item.properties.damage)} t={t} color="#D94A4A" />
              {'damageType' in item.properties && (
                <DetailChip label="Tipo" value={String(item.properties.damageType)} t={t} />
              )}
              {'properties' in item.properties && Array.isArray(item.properties.properties) && (
                <DetailChip label="Proprietà" value={item.properties.properties.join(', ')} t={t} />
              )}
            </View>
          )}

          {/* Armor properties */}
          {item.type === 'armor' && item.properties && typeof item.properties === 'object' && 'armorClass' in item.properties && (
            <View style={[s.rowWrap, s.gap(t.spacing[2]), s.mb(t.spacing[3])]}>
              <DetailChip label="Classe Armatura" value={String(item.properties.armorClass)} t={t} color="#4A90D9" />
              {'armorType' in item.properties && (
                <DetailChip label="Tipo armatura" value={String(item.properties.armorType)} t={t} />
              )}
            </View>
          )}

          {/* Description */}
          <Text style={{
            fontSize: t.typography.sm,
            color: t.colors.foregroundSecondary,
            lineHeight: t.typography.sm * 1.6,
          }}>
            {item.description}
          </Text>
        </>
      )}
    </BottomModal>
  );
}
