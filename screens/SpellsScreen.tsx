import { useMemo, useState, useCallback, useRef } from 'react';
import { View, FlatList, Pressable } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../components/ui/prism-provider';
import ScreenHeader from '../components/custom/ScreenHeader';
import { spacing } from '../utils/styles';
import spellsData from '../assets/spells.json';

import {
  SpellCard,
  SpellFilters,
  SpellDetailModal,
  Spell,
  spellMatchesClass,
  SCHOOL_COLORS,
  getSchoolColor,
  getLevelCounts,
} from '../components/custom/Spells';

export default function SpellsScreen() {
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
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [classFilter, setClassFilter] = useState<string | null>(null);

  // ── Modal state ──
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);

  // ── Filtered spells ──
  const filteredSpells = useMemo(() => {
    let list = spellsData as Spell[];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (levelFilter !== null) {
      list = list.filter((s) => s.level === levelFilter);
    }
    if (classFilter) {
      list = list.filter((s) => spellMatchesClass(s, classFilter));
    }

    return list;
  }, [search, levelFilter, classFilter]);

  // ── Render spell ──
  const renderSpell = useCallback(({ item }: { item: Spell }) => {
    return (
      <SpellCard
        spell={item}
        isPrepared={false}
        isFavorite={false}
        hasActiveCharacter={false}
        onPress={() => setSelectedSpell(item)}
        onToggleFavorite={() => {}}
        onTogglePrepared={() => {}}
      />
    );
  }, []);

  // ── Main render ──
  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      {/* Header fisso */}
      <View style={{ paddingHorizontal: spacing[4], paddingBottom: spacing[2] }}>
        <ScreenHeader title="✨ Incantesimi" />
        <SpellFilters
          search={search}
          onSearchChange={setSearch}
          levelFilter={levelFilter}
          onLevelFilterChange={setLevelFilter}
          classFilter={classFilter}
          onClassFilterChange={setClassFilter}
          showPreparedOnly={false}
          onPreparedOnlyChange={() => {}}
          showFavoritesOnly={false}
          onFavoritesOnlyChange={() => {}}
          filteredCount={filteredSpells.length}
          hasActiveCharacter={false}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={filteredSpells}
        renderItem={renderSpell}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ paddingBottom: spacing[8] }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ paddingHorizontal: spacing[4] }}
      />

      {/* Pulsante "Torna su" flottante */}
      {showScrollTop && (
        <Pressable
          onPress={scrollToTop}
          style={{
            position: 'absolute',
            bottom: 40 + insets.bottom,
            right: 20,
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: t.colors.accent,
            justifyContent: 'center',
            alignItems: 'center',
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

      <SpellDetailModal
        spell={selectedSpell}
        activeChar={null}
        onClose={() => setSelectedSpell(null)}
        onToggleFavorite={() => {}}
        onTogglePrepared={() => {}}
      />
    </View>
  );
}
