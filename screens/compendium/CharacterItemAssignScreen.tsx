import { useCallback, useMemo, useState } from 'react';
import { View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../components/ui/prism-provider';
import ScreenHeader from '../../components/custom/ScreenHeader';
import MissingActiveCharacter from '../../components/custom/MissingActiveCharacter';
import EmptyState from '../../components/custom/EmptyState';
import {
  ItemCard,
  ItemDetailModal,
  ItemFilters,
} from '../../components/custom/Items';
import { useActiveCharacter } from '../../store/useActiveCharacter';
import { getEffectiveAbilityScores, getAbilityModifier } from '../../lib/rules/abilities';
import { s } from '../../utils/style-helpers';
import itemsData from '../../lib/data/items.json';
import type { Ability, AbilityScores, ItemDefinition } from '../../types';

/** Forma raw degli item in items.json (snake_case, come da catalogo) */
interface RawItem {
  id: number;
  name: string;
  type: string;
  weight: number;
  value: number;
  currency: string;
  rarity: string;
  requires_attunement: boolean;
  category: string;
  description: string;
  properties: unknown;
}

/** Punteggi neutri (10) usati quando non c'è un PG attivo */
const DEFAULT_ABILITIES: AbilityScores = {
  strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10,
};

/**
 * Schermata dedicata "Gestisci oggetti": assegna al PG attivo gli oggetti del
 * catalogo (✓ posseduto) come per le magie. Raggiungibile dalla tab Equip
 * (bottone "+ Aggiungi"). Tap sulla card = apre il dettaglio per leggere; il
 * toggle assegnazione sta sul tasto a destra della card e nel modale.
 */
export default function CharacterItemAssignScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeChar, addEquipmentItem, removeEquipmentItem } = useActiveCharacter();

  // ── Filtri ──
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [rarityFilter, setRarityFilter] = useState<string | null>(null);

// Modale di dettaglio dell'oggetto (per leggerlo prima di assegnarlo)
  const [selectedItem, setSelectedItem] = useState<ItemDefinition | null>(null);

  // Punteggi effettivi del PG per i bonus armi (Colpire/Danno) nel dettaglio
  const effectiveScores = useMemo(
    () => getEffectiveAbilityScores(activeChar?.abilities ?? DEFAULT_ABILITIES, activeChar?.abilityModifiers ?? []),
    [activeChar?.abilities, activeChar?.abilityModifiers]
  );
  const getWeaponModifier = useCallback(
    (ability: Ability) => getAbilityModifier(effectiveScores[ability] ?? 10),
    [effectiveScores]
  );

  // ── Catalogo ──
  const allItems = useMemo(
    () =>
      (itemsData as RawItem[]).map((raw) => ({
        ...raw,
        requiresAttunement: raw.requires_attunement,
      })) as ItemDefinition[],
    []
  );

  // ── Oggetti posseduti dal PG (per il toggle) ──
  const ownedIds = useMemo(() => new Set((activeChar?.equipment ?? []).map((it) => it.itemId)), [activeChar?.equipment]);
  const ownedQuantities = useMemo(() => {
    const map = new Map<number, number>();
    for (const it of activeChar?.equipment ?? []) map.set(it.itemId, it.quantity);
    return map;
  }, [activeChar?.equipment]);

  const filteredItems = useMemo(() => {
    let list = allItems;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((it) => it.name.toLowerCase().includes(q));
    }
    if (typeFilter) list = list.filter((it) => it.type === typeFilter);
    if (rarityFilter) list = list.filter((it) => it.rarity === rarityFilter);
    return list;
  }, [search, typeFilter, rarityFilter, allItems]);

  const toggleOwned = useCallback(
    (item: ItemDefinition) => {
      if (ownedIds.has(item.id)) removeEquipmentItem(item.id);
      else addEquipmentItem(item.id, 1);
    },
    [ownedIds, addEquipmentItem, removeEquipmentItem]
  );

  // renderItem memoizzato per la FlatList (evita ri-render di tutte le righe)
  const renderItem = useCallback(
    ({ item }: { item: ItemDefinition }) => (
      <ItemCard
        item={item}
        isOwned={ownedIds.has(item.id)}
        ownedQuantity={ownedQuantities.get(item.id) ?? 1}
        onToggleOwned={() => toggleOwned(item)}
        onPress={() => setSelectedItem(item)}
      />
    ),
    [ownedIds, ownedQuantities, toggleOwned]
  );

  if (!activeChar) {
    return <MissingActiveCharacter message="Apri un personaggio dalla Home per gestire il suo equipaggiamento." />;
  }

  return (
    <View style={[s.flex, { backgroundColor: t.colors.background, paddingTop: insets.top + t.spacing[2], paddingHorizontal: t.spacing[4] }]}>
      <ScreenHeader
        title="Gestisci oggetti"
        icon="bag-handle"
        onBack={() => navigation.goBack()}
        backLabel="Torna all'Equipaggiamento"
        subtitle="Tocca ✓ per assegnare un oggetto al personaggio. Quelli assegnati compaiono nella scheda equipaggiamento."
      />

      <ItemFilters
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        rarityFilter={rarityFilter}
        onRarityFilterChange={setRarityFilter}
        filteredCount={filteredItems.length}
      />

      {filteredItems.length === 0 ? (
        <View style={[s.flex]}>
          <EmptyState
            emoji="🔍"
            title="Nessun risultato"
            message="Nessun oggetto corrisponde ai filtri. Prova a cambiare ricerca o filtro."
          />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          maxToRenderPerBatch={12}
          windowSize={7}
          style={[s.flex, { marginTop: t.spacing[1] }]}
          contentContainerStyle={{ paddingBottom: insets.bottom + t.spacing[10] }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        isOwned={selectedItem ? ownedIds.has(selectedItem.id) : false}
        onToggleOwned={selectedItem ? () => toggleOwned(selectedItem) : undefined}
        abilityModifier={getWeaponModifier}
        proficiencyBonus={activeChar.proficiencyBonus ?? 0}
      />
    </View>
  );
}
