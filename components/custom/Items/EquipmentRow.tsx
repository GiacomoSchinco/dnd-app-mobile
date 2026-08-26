import { View, Text, Pressable } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { s } from '../../../utils/style-helpers';
import DndIcon from '../DndIcon';
import StepperButton from '../StepperButton';
import CircleCheck from '../CircleCheck';
import { getItem, getWeaponDamageModifier } from '../../../lib/rules/items';
import { formatModifier } from '../../../lib/rules/abilities';
import { getEquipmentStatsSummary } from './equipmentStats';
import { getItemIconName, getTypeLabel, getTypeColor, RARITY_LABELS } from './types';
import type { Ability, EquipmentItem } from '../../../types';

type Props = {
  equipment: EquipmentItem;
  /** Indice nella lista (per il bordo divisorio) */
  index: number;
  /** Calcola il modificatore di un'abilità del PG (per il danno delle armi) */
  abilityModifier?: (ability: Ability) => number;
  /** Bonus di competenza del PG (per il bonus di attacco "Colpire") */
  proficiencyBonus?: number;
  onPress: () => void;
  onToggleEquipped: () => void;
  onIncrementQuantity: () => void;
  onDecrementQuantity: () => void;
  onRemove: () => void;
};

/**
 * Riga di equipaggiamento del PG: nome + tipo, statistiche inline (danno, CA,
 * gittata…), stepper quantità, toggle equipaggiato (✓) e rimozione (✕).
 * Il tap sulla riga apre il dettaglio completo dell'oggetto.
 */
export default function EquipmentRow({
  equipment,
  index,
  abilityModifier,
  proficiencyBonus = 0,
  onPress,
  onToggleEquipped,
  onIncrementQuantity,
  onDecrementQuantity,
  onRemove,
}: Props) {
  const t = useTokens();
  const def = getItem(equipment.itemId);
  const weaponMod = def && abilityModifier ? getWeaponDamageModifier(def, abilityModifier, proficiencyBonus) : null;
  const stats = def ? getEquipmentStatsSummary(def, weaponMod?.modifier ?? null) : null;
  const typeColor = def ? getTypeColor(def.type) : '#888';

  return (
    <View
      style={[
        { paddingHorizontal: t.spacing[3], paddingVertical: t.spacing[2.5] },
        index > 0 && { borderTopWidth: 1, borderTopColor: t.colors.border },
      ]}
    >
      {/* Riga principale: icona + nome + toggle equipaggia */}
      <Pressable
        onPress={onPress}
        accessibilityLabel={`Dettaglio di ${equipment.name}`}
        style={({ pressed }) => [s.row, s.gap(t.spacing[2.5]), { alignItems: 'center', opacity: pressed ? 0.7 : 1 }]}
      >
        {def ? (
          <View style={[s.box(40, 10), { backgroundColor: typeColor + '20', ...s.center }]}>
            <DndIcon name={getItemIconName(def.type)} size={22} color={typeColor} />
          </View>
        ) : (
          <View style={[s.box(40, 10), { backgroundColor: t.colors.backgroundTertiary, ...s.center }]}>
            <DndIcon name="knapsack" size={22} color={t.colors.foregroundTertiary} />
          </View>
        )}

        <View style={s.flex}>
          <Text style={{ fontSize: t.typography.base, fontWeight: '600', color: t.colors.foreground }}>
            {equipment.name}
            {equipment.quantity > 1 ? ` ×${equipment.quantity}` : ''}
          </Text>
          <View style={[s.row, s.gap(t.spacing[1]), { alignItems: 'center', marginTop: 2 }]}>
            <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
              {def ? getTypeLabel(def.type) : 'Oggetto'}
              {def && RARITY_LABELS[def.rarity] ? ` · ${RARITY_LABELS[def.rarity]}` : ''}
            </Text>
            {def && def.requiresAttunement && (
              <>
                <DndIcon name="electric" size={12} color={t.colors.foregroundTertiary} />
                <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>Sintonia</Text>
              </>
            )}
          </View>
        </View>

        <CircleCheck checked={equipment.equipped} onPress={onToggleEquipped} size={30} />
      </Pressable>

      {/* Statistiche inline (danno, CA, gittata…) */}
      {stats && (
        <Text
          numberOfLines={2}
          style={{
            fontSize: t.typography.xs,
            color: stats.color,
            fontWeight: '600',
            marginTop: t.spacing[1.5],
            marginLeft: t.spacing[2.5] + 40 + t.spacing[2.5],
          }}
        >
          {stats.label}
        </Text>
      )}

      {/* Bonus di attacco (Colpire) e modificatore di danno derivati dal PG */}
      {weaponMod && (
        <View
          style={[
            s.row,
            s.gap(t.spacing[1.5]),
            { alignItems: 'center', marginTop: t.spacing[0.5], marginLeft: t.spacing[2.5] + 40 + t.spacing[2.5] },
          ]}
        >
          <DndIcon name="bullseye" size={12} color={t.colors.foregroundSecondary} />
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, fontWeight: '600' }}>
            Colpire {formatModifier(weaponMod.attackBonus)}
          </Text>
          <DndIcon name="spiky-explosion" size={12} color={t.colors.foregroundSecondary} />
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, fontWeight: '600' }}>
            Danno{' '}
            {weaponMod.flexible
              ? `FOR ${formatModifier(weaponMod.strengthModifier ?? 0)} · DES ${formatModifier(weaponMod.dexterityModifier ?? 0)} (accurata)`
              : `${formatModifier(weaponMod.modifier)} (${weaponMod.abilityLabel})`}
          </Text>
        </View>
      )}

      {/* Azioni: quantità + rimuovi */}
      <View style={[s.row, { justifyContent: 'space-between', alignItems: 'center', marginTop: t.spacing[1.5], marginLeft: t.spacing[2.5] + 40 + t.spacing[2.5] }]}>
        <View style={[s.row, s.gap(t.spacing[2]), { alignItems: 'center' }]}>
          <StepperButton onPress={onDecrementQuantity}>−</StepperButton>
          <Text style={{ fontSize: t.typography.base, fontWeight: '600', color: t.colors.foreground, minWidth: 24, textAlign: 'center' }}>
            {equipment.quantity}
          </Text>
          <StepperButton onPress={onIncrementQuantity}>+</StepperButton>
        </View>

        <Pressable
          onPress={onRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Rimuovi ${equipment.name} dall'equipaggiamento`}
          style={({ pressed }) => [s.row, s.gap(t.spacing[1]), { alignItems: 'center', opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={{ fontSize: t.typography.xs, color: t.colors.danger, fontWeight: '600' }}>✕ Rimuovi</Text>
        </Pressable>
      </View>
    </View>
  );
}
