import { useMemo, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { View, Text, FlatList, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../ui/prism-provider';
import { Input } from '../../ui/input';
import ScreenHeader from '../ScreenHeader';
import BackButton from '../BackButton';
import BottomModal from '../BottomModal';
import SectionTitle from '../SectionTitle';
import DndIcon, { type IconName } from '../DndIcon';
import { s } from '../../../utils/style-helpers';

type Props<T> = {
  title: string;
  icon: IconName;
  onBack: () => void;
  items: T[];
  keyExtractor: (item: T) => string;
  renderCard: (item: T, onPress: () => void) => ReactNode;
  renderDetail: (item: T) => ReactNode;
  searchPlaceholder?: string;
  filterBy?: (item: T, query: string) => boolean;
};

/**
 * Lista generica per le sezioni del Compendio:
 * header con BackButton, ricerca, FlatList di card e modale di dettaglio.
 */
export default function CompendiumList<T>({
  title,
  icon,
  onBack,
  items,
  keyExtractor,
  renderCard,
  renderDetail,
  searchPlaceholder,
  filterBy,
}: Props<T>) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<T | null>(null);

  const filtered = useMemo(() => {
    if (!query || !filterBy) return items;
    const q = query.trim().toLowerCase();
    return items.filter((it) => filterBy(it, q));
  }, [items, query, filterBy]);

  const handleSelect = useCallback((item: T) => setSelected(item), []);

  // renderItem memoizzato: evita di ricreare le arrow a ogni render
  const renderRow = useCallback(
    ({ item }: { item: T }) => <>{renderCard(item, () => handleSelect(item))}</>,
    [renderCard, handleSelect]
  );

  return (
    <View style={[s.flex, { backgroundColor: t.colors.background }]}>
      <View
        style={{
          paddingTop: insets.top + t.spacing[3],
          paddingHorizontal: t.spacing[4],
          paddingBottom: t.spacing[2],
        }}
      >
        <BackButton onPress={onBack} label="Torna al Compendio" />
        <ScreenHeader
          title={title}
          iconNode={<DndIcon name={icon} size={22} color={t.colors.accent} />}
        />
        {searchPlaceholder && (
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder}
          />
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderRow}
        maxToRenderPerBatch={12}
        windowSize={7}
        removeClippedSubviews={Platform.OS !== 'web'}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90, paddingHorizontal: t.spacing[4] }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text
            style={{
              fontSize: t.typography.base,
              color: t.colors.foregroundSecondary,
              textAlign: 'center',
              marginTop: t.spacing[10],
            }}
          >
            Nessun risultato
          </Text>
        }
      />

      {selected && (
        <BottomModal visible={!!selected} onClose={() => setSelected(null)}>
          {renderDetail(selected)}
        </BottomModal>
      )}
    </View>
  );
}

/** Titolo di sezione usato nei dettagli del Compendio (delega a SectionTitle variant accent) */
export function CompendiumSectionTitle({ children }: { children: ReactNode }) {
  const t = useTokens();
  return (
    <SectionTitle variant="accent" marginTop={t.spacing[4]} marginBottom={t.spacing[2]}>
      {children}
    </SectionTitle>
  );
}

/** Riga "etichetta → valore" usata nei dettagli del Compendio */
export function CompendiumRow({ label, value }: { label: string; value: string }) {
  const t = useTokens();
  return (
    <View style={[s.row, s.gap(t.spacing[2]), s.mt(t.spacing[1])]}>
      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary, width: 110 }}>{label}</Text>
      <Text style={{ fontSize: t.typography.sm, color: t.colors.foreground, flex: 1 }}>{value}</Text>
    </View>
  );
}
