import { useMemo, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../components/ui/prism-provider';
import ScreenHeader from '../../components/custom/ScreenHeader';
import EmptyState from '../../components/custom/EmptyState';
import { SpellCard, SpellFilters, SpellDetailModal, Spell, useSpellFilters, applySpellFilters } from '../../components/custom/Spells';
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
  const { activeChar, togglePreparedSpell, toggleFavoriteSpell } = useActiveCharacter();

  const {
    search,
    setSearch,
    levelFilter,
    setLevelFilter,
    classFilter,
    setClassFilter,
    showPreparedOnly,
    setShowPreparedOnly,
    showFavoritesOnly,
    setShowFavoritesOnly,
  } = useSpellFilters();

  // Modale di dettaglio della magia (per leggerla prima di assegnarla)
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);

  const prepared = activeChar?.preparedSpells ?? [];
  const favorites = activeChar?.favoriteSpells ?? [];
  const lockedClass = activeChar?.classes?.[0]?.className ?? null;

  const filteredSpells = useMemo(
    () =>
      applySpellFilters(spellsData as Spell[], {
        search,
        levelFilter,
        classFilter,
        lockedClass,
        showPreparedOnly,
        showFavoritesOnly,
        prepared,
        favorites,
      }),
    [search, levelFilter, classFilter, lockedClass, showPreparedOnly, showFavoritesOnly, prepared, favorites]
  );

  if (!activeChar) {
    return (
      <EmptyState
        emoji="🔮"
        title="Nessun personaggio selezionato"
        message="Apri un personaggio dalla Home per gestire le sue magie."
      />
    );
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
        lockedClass={lockedClass}
        showPreparedOnly={showPreparedOnly}
        onPreparedOnlyChange={setShowPreparedOnly}
        showFavoritesOnly={showFavoritesOnly}
        onFavoritesOnlyChange={setShowFavoritesOnly}
        filteredCount={filteredSpells.length}
        hasActiveCharacter
      />

      {filteredSpells.length === 0 ? (
        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[4], textAlign: 'center' }}>
          Nessun incantesimo corrisponde ai filtri.
        </Text>
      ) : (
        <FlatList
          data={filteredSpells}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <SpellCard
              spell={item}
              isPrepared={prepared.includes(item.name)}
              isFavorite={favorites.includes(item.name)}
              hasActiveCharacter
              onPress={() => setSelectedSpell(item)}
              onToggleFavorite={() => toggleFavoriteSpell(item.name)}
              onTogglePrepared={() => togglePreparedSpell(item.name)}
            />
          )}
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
      />
    </View>
  );
}
