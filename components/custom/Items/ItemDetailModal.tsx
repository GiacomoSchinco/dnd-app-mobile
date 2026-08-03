import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Badge } from '../../ui/badge';
import { s } from '../../../utils/style-helpers';
import { Ionicons } from '@expo/vector-icons';
import DndIcon from '../DndIcon';
import type { ItemDefinition } from '../../../types';
import { TYPE_LABELS, RARITY_LABELS, TYPE_COLORS, getTypeColor, getCategoryLabel, getTypeLabel } from './types';
import BottomModal from '../BottomModal';
import DetailChip from '../DetailChip';

type Props = {
  item: ItemDefinition | null;
  onClose: () => void;
};

/** Formatta la CA delle armature ({ base, type } o numero) */
function formatAc(ac: unknown): string {
  if (ac && typeof ac === 'object') {
    const o = ac as { base?: number; type?: string };
    const base = o.base ?? 0;
    return o.type === 'dex' ? `${base} + DES` : String(base);
  }
  return String(ac ?? '—');
}

/** Formatta la gittata di un'arma ({ normal, long } o numero) */
function formatRange(r: unknown): string {
  if (r && typeof r === 'object') {
    const o = r as { normal?: number; long?: number };
    if (o.normal != null && o.long != null) return `${o.normal} m / ${o.long} m`;
    if (o.normal != null) return `${o.normal} m`;
  }
  return String(r ?? '—');
}

export default function ItemDetailModal({ item, onClose }: Props) {
  const t = useTokens();
  const itemProps = (item?.properties ?? {}) as Record<string, any>;

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
          {item.type === 'weapon' && (itemProps.damage || itemProps.mastery || itemProps.range) && (
            <View style={[s.rowWrap, s.gap(t.spacing[2]), s.mb(t.spacing[3])]}>
              {itemProps.damage && <DetailChip label="Danno" value={String(itemProps.damage)} t={t} color="#D94A4A" />}
              {itemProps.damageType && <DetailChip label="Tipo" value={String(itemProps.damageType)} t={t} />}
              {itemProps.versatileDamage && <DetailChip label="A due mani" value={String(itemProps.versatileDamage)} t={t} />}
              {itemProps.mastery && <DetailChip label="Padronanza" value={String(itemProps.mastery)} t={t} color="#D9A84A" />}
              {itemProps.magicBonus != null && <DetailChip label="Bonus magico" value={`+${itemProps.magicBonus}`} t={t} color="#8B4AD9" />}
              {itemProps.range && <DetailChip label="Gittata" value={formatRange(itemProps.range)} t={t} />}
              {Array.isArray(itemProps.properties) && (itemProps.properties as string[]).length > 0 && (
                <DetailChip label="Proprietà" value={(itemProps.properties as string[]).join(', ')} t={t} />
              )}
            </View>
          )}

          {/* Armor properties */}
          {item.type === 'armor' && (itemProps.ac || itemProps.armorType) && (
            <View style={[s.rowWrap, s.gap(t.spacing[2]), s.mb(t.spacing[3])]}>
              {itemProps.ac && <DetailChip label="Classe Armatura" value={formatAc(itemProps.ac)} t={t} color="#4A90D9" />}
              {itemProps.armorType && <DetailChip label="Tipo armatura" value={String(itemProps.armorType)} t={t} />}
              {itemProps.stealth === 'svantaggio' && <DetailChip label="Furtività" value="Svantaggio" t={t} color="#D94A4A" />}
              {itemProps.strength != null && <DetailChip label="Forza richiesta" value={String(itemProps.strength)} t={t} />}
            </View>
          )}

          {/* Ammunition properties */}
          {item.type === 'ammunition' && (itemProps.ammunitionType || itemProps.damageBonus || itemProps.magicBonus != null) && (
            <View style={[s.rowWrap, s.gap(t.spacing[2]), s.mb(t.spacing[3])]}>
              {itemProps.ammunitionType && <DetailChip label="Tipo" value={String(itemProps.ammunitionType)} t={t} />}
              {itemProps.damageBonus && <DetailChip label="Bonus danno" value={String(itemProps.damageBonus)} t={t} />}
              {itemProps.magicBonus != null && <DetailChip label="Bonus magico" value={`+${itemProps.magicBonus}`} t={t} color="#8B4AD9" />}
            </View>
          )}

          {/* Consumable properties */}
          {item.type === 'consumable' && itemProps.effect && (
            <View style={[s.rowWrap, s.gap(t.spacing[2]), s.mb(t.spacing[3])]}>
              <DetailChip label="Effetto" value={String(itemProps.effect)} t={t} color="#4A9E4A" />
            </View>
          )}

          {/* Gear properties */}
          {item.type === 'gear' && itemProps.capacity && (
            <View style={[s.rowWrap, s.gap(t.spacing[2]), s.mb(t.spacing[3])]}>
              <DetailChip label="Capacità" value={String(itemProps.capacity)} t={t} />
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
