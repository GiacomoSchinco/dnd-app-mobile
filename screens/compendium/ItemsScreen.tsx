import { useMemo, useState, useCallback, useRef } from 'react';
import { View, FlatList, Pressable } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../components/ui/prism-provider';
import ScreenHeader from '../../components/custom/ScreenHeader';
import BackButton from '../../components/custom/BackButton';
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
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 300);
  }, []);

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
      {showScrollTop && !selectedItem && (
        <Pressable
          onPress={scrollToTop}
          style={{
            position: 'absolute',
            bottom: insets.bottom + 80,
            right: 20,
            ...s.box(50, 25),
            backgroundColor: t.colors.accent,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 6,
            zIndex: 999,
          }}
        >
          <SvgXml
            xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${t.colors.accentForeground}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`}
            width={24}
            height={24}
          />
        </Pressable>
      )}

      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </View>
  );
}
