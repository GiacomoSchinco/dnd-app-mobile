import { useMemo, useState } from 'react';
import { View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../components/ui/prism-provider';
import ScreenHeader from '../../components/custom/ScreenHeader';
import BackButton from '../../components/custom/BackButton';
import { s } from '../../utils/style-helpers';
import itemsData from '../../lib/data/items.json';
import type { ItemDefinition } from '../../types';
import { ItemCard, ItemDetailModal, ItemFilters } from '../../components/custom/Items';

export default function OggettiListScreen() {
  const t = useTokens();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [rarityFilter, setRarityFilter] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemDefinition | null>(null);

  const allItems = useMemo(() => {
    return (itemsData as any[]).map((raw) => ({
      ...raw,
      requiresAttunement: raw.requires_attunement,
    })) as ItemDefinition[];
  }, []);

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

  return (
    <View style={[s.flex, { backgroundColor: t.colors.background }]}>
      <View style={{ paddingTop: insets.top + t.spacing[3], paddingHorizontal: t.spacing[4], paddingBottom: t.spacing[2] }}>
        <BackButton onPress={() => navigation.goBack()} label="Torna al Compendio" />
        <ScreenHeader title="Oggetti" icon="cube-outline" />
        <ItemFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          rarityFilter={rarityFilter}
          onRarityFilterChange={setRarityFilter}
          filteredCount={filteredItems.length}
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => <ItemCard item={item} onPress={() => setSelectedItem(item)} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90, paddingHorizontal: t.spacing[4] }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </View>
  );
}
