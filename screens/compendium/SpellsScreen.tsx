import { useMemo, useState, useCallback, useRef } from 'react';
import { View, FlatList, Pressable } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../components/ui/prism-provider';
import TabHeader from '../../components/custom/TabHeader';
import { s } from '../../utils/style-helpers';
import spellsData from '../../lib/data/spells.json';
import { useActiveCharacter } from '../../store/useActiveCharacter';

import {
  SpellCard,
  SpellFilters,
  SpellDetailModal,
  CharacterBar,
  Spell,
  spellMatchesClass,
  SCHOOL_COLORS,
  getSchoolColor,
  getLevelCounts,
} from '../../components/custom/Spells';

type Props = {
  /**
   * Se true, l'elenco è STANDALONE (usato dal Compendio): NIENTE legame col PG —
   * niente CharacterBar, niente filtro classe bloccato, niente toggle prepara/preferita.
   */
  standalone?: boolean;
};

export default function SpellsScreen({ standalone = false }: Props) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { activeChar: boundChar, togglePreparedSpell, toggleFavoriteSpell } = useActiveCharacter();
  // In modalità standalone il PG viene ignorato del tutto
  const activeChar = standalone ? null : boundChar;
  const hasActiveCharacter = !!activeChar;

  // In modalità standalone non c'è la tab bar → meno spazio in basso
  const bottomClearance = standalone ? insets.bottom + t.spacing[6] : insets.bottom + 80;

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
  const [showPreparedOnly, setShowPreparedOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // ── Modal state ──
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);

  // ── Stato legato al PG attivo ──
  const prepared = activeChar?.preparedSpells ?? [];
  const favorites = activeChar?.favoriteSpells ?? [];
  /** Classe del PG attivo: la lista magie è filtrata e bloccata su di essa */
  const lockedClass = activeChar?.classes?.[0]?.className ?? null;

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
    // Con PG attivo la lista è BLOCCATA alla sua classe (il filtro manuale viene ignorato)
    if (lockedClass) {
      list = list.filter((s) => spellMatchesClass(s, lockedClass));
    } else if (classFilter) {
      list = list.filter((s) => spellMatchesClass(s, classFilter));
    }
    if (showPreparedOnly) {
      list = list.filter((s) => prepared.includes(s.name));
    }
    if (showFavoritesOnly) {
      list = list.filter((s) => favorites.includes(s.name));
    }

    return list;
  }, [search, levelFilter, classFilter, lockedClass, showPreparedOnly, showFavoritesOnly, prepared, favorites]);

  // ── Render spell (legato al PG attivo) ──
  const renderSpell = useCallback(({ item }: { item: Spell }) => {
    return (
      <SpellCard
        spell={item}
        isPrepared={prepared.includes(item.name)}
        isFavorite={favorites.includes(item.name)}
        hasActiveCharacter={hasActiveCharacter}
        onPress={() => setSelectedSpell(item)}
        onToggleFavorite={() => toggleFavoriteSpell(item.name)}
        onTogglePrepared={() => togglePreparedSpell(item.name)}
      />
    );
  }, [prepared, favorites, hasActiveCharacter, toggleFavoriteSpell, togglePreparedSpell]);

  // ── Main render ──
  return (
    <View style={[s.flex, { backgroundColor: t.colors.background }]}>
      <TabHeader
        title="Magie"
        icon="flash-outline"
        onBack={standalone ? () => navigation.goBack() : undefined}
        backLabel="Torna al Compendio"
      >
        {!standalone && <CharacterBar activeChar={activeChar} />}
        <SpellFilters
          search={search}
          onSearchChange={setSearch}
          levelFilter={levelFilter}
          onLevelFilterChange={setLevelFilter}
          classFilter={classFilter}
          onClassFilterChange={setClassFilter}
          lockedClass={lockedClass}
          showPreparedOnly={showPreparedOnly}
          onPreparedOnlyChange={setShowPreparedOnly}
          showFavoritesOnly={showFavoritesOnly}
          onFavoritesOnlyChange={setShowFavoritesOnly}
          filteredCount={filteredSpells.length}
          hasActiveCharacter={hasActiveCharacter}
        />
      </TabHeader>

      <FlatList
        ref={flatListRef}
        data={filteredSpells}
        renderItem={renderSpell}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ paddingBottom: bottomClearance }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ paddingHorizontal: t.spacing[4] }}
      />

      {/* Pulsante "Torna su" flottante — nascosto se il modale è aperto */}
      {showScrollTop && !selectedSpell && (
        <Pressable
          onPress={scrollToTop}
          style={{
            position: 'absolute',
            bottom: bottomClearance,
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

      <SpellDetailModal
        spell={selectedSpell}
        activeChar={activeChar}
        onClose={() => setSelectedSpell(null)}
        onToggleFavorite={() => selectedSpell && toggleFavoriteSpell(selectedSpell.name)}
        onTogglePrepared={() => selectedSpell && togglePreparedSpell(selectedSpell.name)}
      />
    </View>
  );
}
