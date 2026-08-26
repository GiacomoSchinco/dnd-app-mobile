import { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { TabToRootNav } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../components/ui/prism-provider';
import { Button } from '../../components/ui/button';
import TabHeader from '../../components/custom/TabHeader';
import MissingActiveCharacter from '../../components/custom/MissingActiveCharacter';
import EmptyState from '../../components/custom/EmptyState';
import DndIcon, { type IconName } from '../../components/custom/DndIcon';
import CharacterBar from '../../components/custom/Spells/CharacterBar';
import ListItem from '../../components/custom/ListItem';
import SectionTitle from '../../components/custom/SectionTitle';
import CardBox from '../../components/custom/CardBox';
import StepperRow from '../../components/custom/StepperRow';
import ListCard from '../../components/custom/ListCard';
import { ItemDetailModal, EquipmentRow } from '../../components/custom/Items';
import { getItem } from '../../lib/rules/items';
import { getEffectiveAbilityScores, getAbilityModifier } from '../../lib/rules/abilities';
import type { Ability, AbilityScores, ItemDefinition, EquipmentItem } from '../../types';
import { ALTRO_ROUTES } from '../more/altro-routes';
import { ROUTES } from '../../lib/routes';
import { useActiveCharacter } from '../../store/useActiveCharacter';
import { s } from '../../utils/style-helpers';

/** Gruppi di equipaggiamento mostrati come sezioni (per tipo di oggetto) */
const EQUIPMENT_GROUPS: { key: string; label: string; dndIcon: IconName; matches: (type: string) => boolean }[] = [
  { key: 'weapon', label: 'Armi', dndIcon: 'sword-wound', matches: (t) => t === 'weapon' },
  { key: 'armor', label: 'Armature', dndIcon: 'dragon-shield', matches: (t) => t === 'armor' },
  { key: 'ammunition', label: 'Munizioni', dndIcon: 'bullseye', matches: (t) => t === 'ammunition' },
  { key: 'consumable', label: 'Consumabili', dndIcon: 'cauldron', matches: (t) => t === 'consumable' },
  { key: 'other', label: 'Equipaggiamento', dndIcon: 'knapsack', matches: (t) => t !== 'weapon' && t !== 'armor' && t !== 'ammunition' && t !== 'consumable' },
];

/** Punteggi neutri (10) usati quando non c'è un PG attivo */
const DEFAULT_ABILITIES: AbilityScores = {
  strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10,
};

/** Colori dei metalli per il denaro (Oro/Argento/Rame) */
const MONEY_COLORS = { mo: '#D4AF37', ma: '#C0C0C0', mr: '#B87333' } as const;

export default function EquipmentScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TabToRootNav>();
  const { activeChar, updateCharacter, addEquipmentItem, removeEquipmentItem, setEquipmentQuantity, toggleEquippedItem } = useActiveCharacter();
  const [selectedItem, setSelectedItem] = useState<ItemDefinition | null>(null);

  // Punteggi effettivi del PG (base + correzioni manuali) per il modificatore di danno delle armi
  const effectiveScores = useMemo(
    () => getEffectiveAbilityScores(activeChar?.abilities ?? DEFAULT_ABILITIES, activeChar?.abilityModifiers ?? []),
    [activeChar?.abilities, activeChar?.abilityModifiers]
  );
  const getWeaponModifier = useCallback(
    (ability: Ability) => getAbilityModifier(effectiveScores[ability] ?? 10),
    [effectiveScores]
  );

  // ⚠️ REGOLA HOOK: derivati/useMemo dichiarati PRIMA della guardia `if (!activeChar)`
  const equipment = activeChar?.equipment ?? [];

  // ── Oggetti raggruppati per tipo (Armi, Armature, …) ──
  const grouped = useMemo(() => {
    const groups = EQUIPMENT_GROUPS.map((g) => ({ ...g, items: [] as EquipmentItem[] }));
    for (const it of equipment) {
      const type = getItem(it.itemId)?.type ?? 'gear';
      const group = groups.find((g) => g.matches(type)) ?? groups[groups.length - 1];
      group.items.push(it);
    }
    return groups.filter((g) => g.items.length > 0);
  }, [equipment]);

  if (!activeChar) {
    return <MissingActiveCharacter dndIcon="backpack" message="Apri un personaggio dalla Home per vedere il suo equipaggiamento." />;
  }

  const money = activeChar.money ?? { mo: 0, ma: 0, mr: 0 };

  const changeMoney = (key: 'mo' | 'ma' | 'mr', delta: number) => {
    updateCharacter(activeChar.id, {
      money: {
        ...money,
        [key]: Math.max(0, (money[key] ?? 0) + delta),
      },
    });
  };

  const equippedCount = equipment.filter((it) => it.equipped).length;

  return (
    <View style={[s.flex, { backgroundColor: t.colors.background }]}>
      <TabHeader title="Equipaggiamento" icon="bag-handle-outline">
        <CharacterBar activeChar={activeChar} spellInformation={false} />
        <View style={[s.row, s.gap(t.spacing[2]), s.mt(t.spacing[1])]}>
          <Button variant="outline" size="md" style={s.flex} onPress={() => navigation.navigate(ROUTES.ITEM_ASSIGN)}>
            + Aggiungi oggetti
          </Button>
        </View>
        <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: t.spacing[1] }}>
          👆 Tocca un oggetto per il dettaglio · ✓ per equipaggiarlo · − / + per la quantità
        </Text>
      </TabHeader>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: t.spacing[4], paddingBottom: insets.bottom + 88 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Denaro ── */}
        <CardBox gap={t.spacing[2]} marginBottom={t.spacing[5]}>
          <SectionTitle text="Denaro" marginBottom={t.spacing[1]} />
          <StepperRow
            label="Oro (mo)"
            labelIcon="crown-coin"
            labelIconColor={MONEY_COLORS.mo}
            value={money.mo ?? 0}
            onDecrement={() => changeMoney('mo', -1)}
            onIncrement={() => changeMoney('mo', 1)}
            labelSize={t.typography.base}
            labelColor={t.colors.foreground}
          />
          <StepperRow
            label="Argento (ma)"
            labelIcon="crown-coin"
            labelIconColor={MONEY_COLORS.ma}
            value={money.ma ?? 0}
            onDecrement={() => changeMoney('ma', -1)}
            onIncrement={() => changeMoney('ma', 1)}
            labelSize={t.typography.base}
            labelColor={t.colors.foreground}
          />
          <StepperRow
            label="Rame (mr)"
            labelIcon="crown-coin"
            labelIconColor={MONEY_COLORS.mr}
            value={money.mr ?? 0}
            onDecrement={() => changeMoney('mr', -1)}
            onIncrement={() => changeMoney('mr', 1)}
            labelSize={t.typography.base}
            labelColor={t.colors.foreground}
          />
        </CardBox>

        {/* ── Oggetti ── */}
        <SectionTitle
          text={`Oggetti (${equipment.length})`}
          note={equippedCount > 0 ? `${equippedCount} equipaggiati` : undefined}
        />

        {grouped.length === 0 ? (
          <View style={s.mb(t.spacing[5])}>
            <EmptyState
              dndIcon="backpack"
              title="Nessun oggetto"
              message="Tocca '+ Aggiungi oggetti' per assegnare l'equipaggiamento del personaggio dal catalogo."
            />
          </View>
        ) : (
          grouped.map((group) => (
            <View key={group.key}>
              <View style={[s.row, { alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }]}>
                <DndIcon name={group.dndIcon} size={16} color={t.colors.accent} />
                <View style={s.flex}>
                  <SectionTitle text={`${group.label} (${group.items.length})`} marginBottom={0} />
                </View>
              </View>
              <ListCard marginBottom={t.spacing[4]}>
                {group.items.map((it, idx) => (
                  <EquipmentRow
                    key={it.itemId}
                    equipment={it}
                    index={idx}
                    abilityModifier={getWeaponModifier}
                    proficiencyBonus={activeChar.proficiencyBonus ?? 0}
                    onPress={() => setSelectedItem(getItem(it.itemId) ?? null)}
                    onToggleEquipped={() => toggleEquippedItem(it.itemId)}
                    onIncrementQuantity={() => setEquipmentQuantity(it.itemId, it.quantity + 1)}
                    onDecrementQuantity={() => setEquipmentQuantity(it.itemId, it.quantity - 1)}
                    onRemove={() => removeEquipmentItem(it.itemId)}
                  />
                ))}
              </ListCard>
            </View>
          ))
        )}
      </ScrollView>

      {/* Dettaglio oggetto (come per le magie) */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        abilityModifier={getWeaponModifier}
        proficiencyBonus={activeChar.proficiencyBonus ?? 0}
      />
    </View>
  );
}
