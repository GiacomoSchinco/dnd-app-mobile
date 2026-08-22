import { useMemo, useState, useCallback, useRef } from 'react';
import { View, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../components/ui/prism-provider';
import ScreenHeader from '../../components/custom/ScreenHeader';
import BackButton from '../../components/custom/BackButton';
import ScrollToTopFab from '../../components/custom/ScrollToTopFab';
import { useScrollToTop } from '../../components/custom/useScrollToTop';
import { s } from '../../utils/style-helpers';
import itemsData from '../../lib/data/items.json';
import type { ItemDefinition } from '../../types';
import {
  ItemCard,
  ItemDetailModal,
  ItemFilters,
} from '../../components/custom/Items';

export default function ItemsScreen({ onBack }: { onBack?: () => void }) {
  const t = useTokens();
  const insets = useSafeAreaInsets();

  // ── Scroll to top ──
  const flatListRef = useRef<FlatList>(null);
  const { showScrollTop, handleScroll } = useScrollToTop();

  const scrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  // ── Filters ──
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [rarityFilter, setRarityFilter] = useState<string | null>(null);

  // ── Modal state ──
  const [selectedItem, setSelectedItem] = useState<ItemDefinition | null>(null);

  // ── Parse items ──
  const allItems = useMemo(() => {
    return (itemsData as any[]).map((raw) => ({
      ...raw,
      requiresAttunement: raw.requires_attunement,
    })) as ItemDefinition[];
  }, []);

  // ── Filtered items ──
  const filteredItems = useMemo(() => {
    let list = allItems;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (typeFilter) {
      list = list.filter((s) => s.type === typeFilter);
    }
    if (rarityFilter) {
      list = list.filter((s) => s.rarity === rarityFilter);
    }

    return list;
  }, [search, typeFilter, rarityFilter, allItems]);

  // ── Render item ──
  const renderItem = useCallback(({ item }: { item: ItemDefinition }) => {
    return (
      <ItemCard
        item={item}
        onPress={() => setSelectedItem(item)}
      />
    );
  }, []);

  // ── Main render ──
  return (
    <View style={[s.flex, { backgroundColor: t.colors.background }]}>
      {/* Header fisso con safe area */}
      <View style={{ paddingTop: insets.top + t.spacing[4], paddingHorizontal: t.spacing[4], paddingBottom: t.spacing[2] }}>
        {onBack && <BackButton onPress={onBack} label="Torna al Compendio" />}
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
        ref={flatListRef}
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80, paddingHorizontal: t.spacing[4] }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Pulsante "Torna su" flottante */}
      <ScrollToTopFab
        visible={showScrollTop && !selectedItem}
        onPress={scrollToTop}
        bottom={insets.bottom + 80}
      />

      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </View>
  );
}
