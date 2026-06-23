import { useMemo, useState, useCallback, useRef } from 'react';
import { View, FlatList, Pressable } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../components/ui/prism-provider';
import ScreenHeader from '../components/custom/ScreenHeader';
import { spacing } from '../utils/styles';
import { useActiveCharacter } from '../store/useActiveCharacter';
import spellsData from '../assets/spells.json';

import {
  SpellCard,
  CharacterBar,
  SpellFilters,
  SlotBar,
  SpellDetailModal,
  CharacterPickerModal,
  Spell,
  ClassName,
  spellMatchesClass,
} from '../components/custom/Spells';

export default function SpellsScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();

  // ── Store ──
  const {
    activeChar,
    characters,
    activeCharacterId,
    setActiveCharacterId,
    createCharacter,
    togglePreparedSpell,
    toggleFavoriteSpell,
    useSpellSlot,
    restoreSpellSlots,
    deleteCharacter,
  } = useActiveCharacter();

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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showPreparedOnly, setShowPreparedOnly] = useState(false);

  // ── Modal state ──
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [showCharacterPicker, setShowCharacterPicker] = useState(false);

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
    if (activeChar && showFavoritesOnly) {
      list = list.filter((s) => activeChar.favoriteSpells.includes(s.name));
    }
    if (activeChar && showPreparedOnly) {
      list = list.filter((s) => activeChar.preparedSpells.includes(s.name));
    }

    return list;
  }, [search, levelFilter, classFilter, showFavoritesOnly, showPreparedOnly, activeChar]);

  // ── Derived ──
  const activeSlots = activeChar && levelFilter !== null && levelFilter > 0
    ? activeChar.spellSlots[levelFilter]
    : null;

  // ── Handlers ──
  const toggleClassFilter = useCallback(() => {
    if (classFilter) {
      setClassFilter(null);
    } else if (activeChar) {
      setClassFilter(activeChar.class);
    }
  }, [classFilter, activeChar]);

  const handleSelectCharacter = useCallback((id: string) => {
    setActiveCharacterId(id);
  }, [setActiveCharacterId]);

  const handleCreateCharacter = useCallback((name: string, className: ClassName) => {
    createCharacter(name, className);
  }, [createCharacter]);

  const handleDeleteCharacter = useCallback((id: string) => {
    deleteCharacter(id);
  }, [deleteCharacter]);

  // ── Render spell ──
  const renderSpell = useCallback(({ item }: { item: Spell }) => {
    const isPrepared = activeChar?.preparedSpells.includes(item.name) ?? false;
    const isFav = activeChar?.favoriteSpells.includes(item.name) ?? false;

    return (
      <SpellCard
        spell={item}
        isPrepared={isPrepared}
        isFavorite={isFav}
        hasActiveCharacter={!!activeChar}
        onPress={() => setSelectedSpell(item)}
        onToggleFavorite={() => toggleFavoriteSpell(item.name)}
        onTogglePrepared={() => togglePreparedSpell(item.name)}
      />
    );
  }, [activeChar, toggleFavoriteSpell, togglePreparedSpell]);

  // ── Main render ──
  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      {/* Header fisso (fuori dalla FlatList → la ricerca non perde focus) */}
      <View style={{ paddingHorizontal: spacing[4], paddingBottom: spacing[2] }}>
        <ScreenHeader title="✨ Incantesimi" />
        <CharacterBar activeChar={activeChar} onPress={() => setShowCharacterPicker(true)} />
        {activeSlots && (
          <SlotBar
            level={levelFilter!}
            current={activeSlots.current}
            max={activeSlots.max}
            onUseSlot={() => useSpellSlot(levelFilter!)}
            onRestore={() => restoreSpellSlots(levelFilter!)}
          />
        )}
        <SpellFilters
          search={search}
          onSearchChange={setSearch}
          levelFilter={levelFilter}
          onLevelFilterChange={setLevelFilter}
          classFilter={classFilter}
          onClassFilterChange={toggleClassFilter}
          showPreparedOnly={showPreparedOnly}
          onPreparedOnlyChange={setShowPreparedOnly}
          showFavoritesOnly={showFavoritesOnly}
          onFavoritesOnlyChange={setShowFavoritesOnly}
          filteredCount={filteredSpells.length}
          hasActiveCharacter={!!activeChar}
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
        activeChar={activeChar}
        onClose={() => setSelectedSpell(null)}
        onToggleFavorite={() => selectedSpell && toggleFavoriteSpell(selectedSpell.name)}
        onTogglePrepared={() => selectedSpell && togglePreparedSpell(selectedSpell.name)}
      />

      <CharacterPickerModal
        visible={showCharacterPicker}
        characters={characters}
        activeCharacterId={activeCharacterId}
        onClose={() => setShowCharacterPicker(false)}
        onSelect={handleSelectCharacter}
        onCreate={handleCreateCharacter}
        onDelete={handleDeleteCharacter}
      />
    </View>
  );
}
