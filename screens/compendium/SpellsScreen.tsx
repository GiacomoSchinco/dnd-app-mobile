import { useMemo, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, SectionList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../components/ui/prism-provider';
import TabHeader from '../../components/custom/TabHeader';
import ScrollToTopFab from '../../components/custom/ScrollToTopFab';
import { useScrollToTop } from '../../components/custom/useScrollToTop';
import EmptyState from '../../components/custom/EmptyState';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { s } from '../../utils/style-helpers';
import spellsData from '../../lib/data/spells.json';
import { ROUTES } from '../../lib/routes';
import type { TabToRootNav } from '../../types/navigation';
import { useActiveCharacter } from '../../store/useActiveCharacter';

import {
  SpellCard,
  SpellFilters,
  SpellDetailModal,
  CharacterBar,
  SpellSlotsBar,
  SpellCastRow,
  Spell,
  useSpellFilters,
  applySpellFilters,
  getSpellSourceBadges,
  resolveSpellBadgeForSpell,
} from '../../components/custom/Spells';

type Props = {
  /**
   * Se true, l'elenco è STANDALONE (usato dal Compendio): NIENTE legame col PG —
   * niente CharacterBar, niente slot, niente toggle prepara/preferita.
   */
  standalone?: boolean;
};

export default function SpellsScreen({ standalone = false }: Props) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TabToRootNav>();
  const {
    activeChar: boundChar,
    togglePreparedSpell,
    toggleFavoriteSpell,
    setSpellBadge,
    useSpellSlot,
    recoverSpellSlot,
    restoreSpellSlots,
  } = useActiveCharacter();
  // In modalità standalone il PG viene ignorato del tutto
  const activeChar = standalone ? null : boundChar;
  const hasActiveCharacter = !!activeChar;
  // "Scheda magie del PG": solo con PG attivo e NON standalone → lista delle SUE magie
  const isSheet = hasActiveCharacter && !standalone;

  const bottomClearance = standalone ? insets.bottom + t.spacing[6] : insets.bottom + 80;

  // ── Scroll to top ──
  const flatListRef = useRef<FlatList>(null);
  const sectionListRef = useRef<SectionList<Spell>>(null);
  const { showScrollTop, handleScroll } = useScrollToTop();

  const scrollToTop = useCallback(() => {
    if (isSheet) {
      sectionListRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true });
    } else {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [isSheet]);

  // ── Filtri magie (hook condiviso: compendio, scheda PG, gestione magie) ──
  const {
    search,
    setSearch,
    levelFilter,
    setLevelFilter,
    classFilter,
    setClassFilter,
    schoolFilter,
    setSchoolFilter,
    showPreparedOnly,
    setShowPreparedOnly,
    showFavoritesOnly,
    setShowFavoritesOnly,
  } = useSpellFilters();

  // ── Modal state ──
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);

  // ── Stato legato al PG attivo ──
  const prepared = activeChar?.preparedSpells ?? [];
  const favorites = activeChar?.favoriteSpells ?? [];
  /** Classe del PG attivo: la lista magie è filtrata e bloccata su di essa */
  const lockedClass = activeChar?.classes?.[0]?.className ?? null;

  // ── Elenco completo (filtri attivi) — usato nel compendio ──
  const filteredSpells = useMemo(
    () =>
      applySpellFilters(spellsData as Spell[], {
        search,
        levelFilter,
        classFilter,
        schoolFilter,
        lockedClass,
        showPreparedOnly,
        showFavoritesOnly,
        prepared,
        favorites,
      }),
    [search, levelFilter, classFilter, schoolFilter, lockedClass, showPreparedOnly, showFavoritesOnly, prepared, favorites]
  );

  // ── Magie ASSEGNATE al PG (le sue preparate), risolte dall'elenco ──
  const sheetSpells = useMemo(() => {
    if (!isSheet) return [];
    const byName = new Map((spellsData as Spell[]).map((s) => [s.name, s]));
    const list = (activeChar?.preparedSpells ?? [])
      .map((n) => byName.get(n))
      .filter((s): s is Spell => !!s);
    return applySpellFilters(list, { search, levelFilter }).sort(
      (a, b) => a.level - b.level || a.name.localeCompare(b.name)
    );
  }, [isSheet, activeChar?.preparedSpells, search, levelFilter]);

  // ── Magie assegnate raggruppate per livello (scheda PG) ──
  const sheetSections = useMemo(() => {
    const groups = new Map<number, Spell[]>();
    for (const spell of sheetSpells) {
      const arr = groups.get(spell.level) ?? [];
      arr.push(spell);
      groups.set(spell.level, arr);
    }
    return Array.from(groups.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([level, spells]) => ({ level, spells }));
  }, [sheetSpells]);

  // ── Lancia: consuma uno slot del livello (i trucchetti non hanno slot) ──
  const handleCast = useCallback((spell: Spell) => {
    if (spell.level === 0) return;
    useSpellSlot(spell.level);
  }, [useSpellSlot]);

  // ── Se il PG non ha slot incantesimo, niente tasto "Lancia" ──
  const hasSpellSlots = useMemo(() => {
    const slots = activeChar?.spellSlots ?? {};
    return Object.values(slots).some((s) => (s?.max ?? 0) > 0);
  }, [activeChar?.spellSlots]);

  // Badge magie: Map precalcolata UNA volta per character, riusata per ogni riga
  const autoBadges = useMemo(() => getSpellSourceBadges(activeChar), [activeChar]);

  // ── Render compendio ──
  const renderSpell = useCallback(({ item }: { item: Spell }) => {
    return (
      <SpellCard
        spell={item}
        isPrepared={prepared.includes(item.name)}
        isFavorite={favorites.includes(item.name)}
        hasActiveCharacter={hasActiveCharacter}
        badge={resolveSpellBadgeForSpell(activeChar, item, autoBadges)}
        onPress={() => setSelectedSpell(item)}
        onToggleFavorite={() => toggleFavoriteSpell(item.name)}
        onTogglePrepared={() => togglePreparedSpell(item.name)}
      />
    );
  }, [prepared, favorites, hasActiveCharacter, toggleFavoriteSpell, togglePreparedSpell, activeChar, autoBadges]);

  // ── Render foglio PG ──
  const renderSheetSpell = useCallback(({ item }: { item: Spell }) => (
    <SpellCastRow
      spell={item}
      t={t}
      canCast={hasSpellSlots}
      onCast={handleCast}
      onInfo={setSelectedSpell}
      badge={resolveSpellBadgeForSpell(activeChar, item, autoBadges)}
    />
  ), [t, hasSpellSlots, handleCast, activeChar, autoBadges]);

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

        {isSheet ? (
          <View style={[s.row, s.gap(t.spacing[2]), s.mb(t.spacing[2])]}>
            <Input placeholder="Cerca le tue magie..." value={search} onChangeText={setSearch} style={{ flex: 1 }} />
            <Button variant="outline" size="md" onPress={() => navigation.navigate(ROUTES.SPELL_ASSIGN)}>+ Aggiungi</Button>
          </View>
        ) : (
          <SpellFilters
            search={search}
            onSearchChange={setSearch}
            levelFilter={levelFilter}
            onLevelFilterChange={setLevelFilter}
            classFilter={classFilter}
            onClassFilterChange={setClassFilter}
            schoolFilter={schoolFilter}
            onSchoolFilterChange={setSchoolFilter}
            lockedClass={lockedClass}
            showPreparedOnly={showPreparedOnly}
            onPreparedOnlyChange={setShowPreparedOnly}
            showFavoritesOnly={showFavoritesOnly}
            onFavoritesOnlyChange={setShowFavoritesOnly}
            filteredCount={filteredSpells.length}
            hasActiveCharacter={hasActiveCharacter}
          />
        )}
      </TabHeader>

      {isSheet && sheetSpells.length === 0 ? (
        <View style={[s.flex, { paddingHorizontal: t.spacing[4] }]}>
          <EmptyState
            emoji="🔮"
            title="Nessuna magia assegnata"
            message="Tocca '+ Aggiungi' per scegliere le magie del personaggio dalla sua classe."
          />
        </View>
      ) : isSheet ? (
        <SectionList
          ref={sectionListRef}
          sections={sheetSections.map((sec) => ({ level: sec.level, data: sec.spells }))}
          renderItem={renderSheetSpell}
          renderSectionHeader={({ section }) => (
            <View style={[s.row, { alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[2], marginBottom: t.spacing[1] }]}>
              <Text
                style={{
                  fontSize: t.typography.xs,
                  fontWeight: '600',
                  color: t.colors.foregroundTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {section.level === 0 ? 'Trucchetti' : `Livello ${section.level}`}
              </Text>
              <View
                style={{
                  backgroundColor: t.colors.accentSubtle,
                  borderRadius: t.radius.full,
                  paddingHorizontal: t.spacing[1.5],
                  paddingVertical: t.spacing[0.25],
                }}
              >
                <Text style={{ fontSize: t.typography.xs, fontWeight: '700', color: t.colors.accent }}>
                  {section.data.length}
                </Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.name}
          ListHeaderComponent={
            <SpellSlotsBar
              spellSlots={activeChar?.spellSlots}
              onUseSlot={useSpellSlot}
              onRecoverSlot={recoverSpellSlot}
              onRestoreAll={() => restoreSpellSlots()}
            />
          }
          contentContainerStyle={{ paddingBottom: bottomClearance }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ paddingHorizontal: t.spacing[3] }}
          stickySectionHeadersEnabled={false}
        />
      ) : (
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
      )}

      {/* Pulsante "Torna su" flottante — nascosto se un modale è aperto */}
      <ScrollToTopFab visible={showScrollTop && !selectedSpell} onPress={scrollToTop} bottom={bottomClearance} />

      <SpellDetailModal
        spell={selectedSpell}
        activeChar={activeChar}
        onClose={() => setSelectedSpell(null)}
        onCast={isSheet && hasSpellSlots ? handleCast : undefined}
        onSetBadge={activeChar ? (b) => { if (selectedSpell) setSpellBadge(selectedSpell.name, b); } : undefined}
      />
    </View>
  );
}
