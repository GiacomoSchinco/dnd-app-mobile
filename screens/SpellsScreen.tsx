import { useMemo, useState, useCallback } from 'react';
import { View, FlatList } from 'react-native';
import { useTokens } from '../components/ui/prism-provider';
import ScreenHeader from '../components/custom/ScreenHeader';
import { spacing } from '../utils/styles';
import { useCharacterStore } from '../store/useCharacterStore';
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

  // ── Store ──
  const characters = useCharacterStore((s) => s.characters);
  const activeCharacterId = useCharacterStore((s) => s.activeCharacterId);
  const setActiveCharacterId = useCharacterStore((s) => s.setActiveCharacterId);
  const createCharacter = useCharacterStore((s) => s.createCharacter);
  const togglePreparedSpell = useCharacterStore((s) => s.togglePreparedSpell);
  const toggleFavoriteSpell = useCharacterStore((s) => s.toggleFavoriteSpell);
  const useSpellSlot = useCharacterStore((s) => s.useSpellSlot);
  const restoreSpellSlots = useCharacterStore((s) => s.restoreSpellSlots);
  const deleteCharacter = useCharacterStore((s) => s.deleteCharacter);

  const activeChar = characters.find((c) => c.id === activeCharacterId) ?? null;

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

  // ── List Header ──
  const ListHeader = useCallback(() => (
    <View style={{ paddingHorizontal: spacing[4], paddingBottom: spacing[4] }}>
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
  ), [activeChar, activeSlots, levelFilter, search, classFilter, showPreparedOnly, showFavoritesOnly, filteredSpells.length, toggleClassFilter, useSpellSlot, restoreSpellSlots]);

  // ── Main render ──
  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <FlatList
        data={filteredSpells}
        renderItem={renderSpell}
        keyExtractor={(item) => item.name}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: spacing[8] }}
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: spacing[4] }}
      />

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
