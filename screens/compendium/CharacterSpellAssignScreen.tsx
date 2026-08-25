import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../components/ui/prism-provider';
import ScreenHeader from '../../components/custom/ScreenHeader';
import MissingActiveCharacter from '../../components/custom/MissingActiveCharacter';
import EmptyState from '../../components/custom/EmptyState';
import { SpellCard, SpellFilters, SpellDetailModal, Spell, useSpellFilters, applySpellFilters, getSpellSourceBadges, resolveSpellBadgeForSpell } from '../../components/custom/Spells';
import { useActiveCharacter } from '../../store/useActiveCharacter';
import { s } from '../../utils/style-helpers';
import spellsData from '../../lib/data/spells.json';

/**
 * Schermata dedicata "Gestisci magie": assegna al PG attivo le magie della sua
 * classe (✓ preparata) e le preferite (★). Raggiungibile dalla tab Magie
 * (bottone "+ Aggiungi"). Tap sulla card = apre il dettaglio per leggere; le
 * azioni assegna/preferita stanno sui tasti della card e nel modale.
 */
export default function CharacterSpellAssignScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeChar, togglePreparedSpell, toggleFavoriteSpell, setSpellBadge } = useActiveCharacter();

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

  // Modale di dettaglio della magia (per leggerla prima di assegnarla)
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);

  const prepared = activeChar?.preparedSpells ?? [];
  const favorites = activeChar?.favoriteSpells ?? [];
  const initialClass = activeChar?.classes?.[0]?.className ?? null;

  // Pre-seleziona la classe del PG al primo montaggio (il filtro resta modificabile)
  useEffect(() => {
    if (initialClass) setClassFilter(initialClass);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSpells = useMemo(
    () =>
      applySpellFilters(spellsData as Spell[], {
        search,
        levelFilter,
        classFilter,
        schoolFilter,
        showPreparedOnly,
        showFavoritesOnly,
        prepared,
        favorites,
      }),
    [search, levelFilter, classFilter, schoolFilter, showPreparedOnly, showFavoritesOnly, prepared, favorites]
  );

  // Badge magie: Map precalcolata UNA volta per character, riusata per ogni riga
  const autoBadges = useMemo(() => getSpellSourceBadges(activeChar), [activeChar]);

  // renderItem memoizzato per la FlatList (evita ri-render di tutte le righe)
  const renderSpellCard = useCallback(
    ({ item }: { item: Spell }) => (
      <SpellCard
        spell={item}
        isPrepared={prepared.includes(item.name)}
        isFavorite={favorites.includes(item.name)}
        hasActiveCharacter
        badge={resolveSpellBadgeForSpell(activeChar, item, autoBadges)}
        onPress={() => setSelectedSpell(item)}
        onToggleFavorite={() => toggleFavoriteSpell(item.name)}
        onTogglePrepared={() => togglePreparedSpell(item.name)}
      />
    ),
    [prepared, favorites, activeChar, toggleFavoriteSpell, togglePreparedSpell, autoBadges]
  );

  if (!activeChar) {
    return <MissingActiveCharacter message="Apri un personaggio dalla Home per gestire le sue magie." />;
  }

  return (
    <View style={[s.flex, { backgroundColor: t.colors.background, paddingTop: insets.top + t.spacing[2], paddingHorizontal: t.spacing[4] }]}>
      <ScreenHeader
        title="Gestisci magie"
        icon="flash"
        onBack={() => navigation.goBack()}
        backLabel="Torna alle Magie"
        subtitle="Tocca ✓ per assegnare una magia, ★ per le preferite. Quelle assegnate compaiono nella scheda magie."
      />

      <SpellFilters
        search={search}
        onSearchChange={setSearch}
        levelFilter={levelFilter}
        onLevelFilterChange={setLevelFilter}
        classFilter={classFilter}
        onClassFilterChange={setClassFilter}
        schoolFilter={schoolFilter}
        onSchoolFilterChange={setSchoolFilter}
        showPreparedOnly={showPreparedOnly}
        onPreparedOnlyChange={setShowPreparedOnly}
        showFavoritesOnly={showFavoritesOnly}
        onFavoritesOnlyChange={setShowFavoritesOnly}
        filteredCount={filteredSpells.length}
        hasActiveCharacter
      />

      {filteredSpells.length === 0 ? (
        <View style={[s.flex]}>
          <EmptyState
            emoji="🔍"
            title="Nessun risultato"
            message="Nessun incantesimo corrisponde ai filtri. Prova a cambiare ricerca o filtro."
          />
        </View>
      ) : (
        <FlatList
          data={filteredSpells}
          keyExtractor={(item) => item.name}
          renderItem={renderSpellCard}
          maxToRenderPerBatch={12}
          windowSize={7}
          style={[s.flex, { marginTop: t.spacing[1] }]}
          contentContainerStyle={{ paddingBottom: insets.bottom + t.spacing[10] }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <SpellDetailModal
        spell={selectedSpell}
        activeChar={activeChar}
        onClose={() => setSelectedSpell(null)}
        onToggleFavorite={() => selectedSpell && toggleFavoriteSpell(selectedSpell.name)}
        onTogglePrepared={() => selectedSpell && togglePreparedSpell(selectedSpell.name)}
        onSetBadge={(b) => { if (selectedSpell) setSpellBadge(selectedSpell.name, b); }}
      />
    </View>
  );
}
