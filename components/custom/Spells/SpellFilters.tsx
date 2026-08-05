import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Input } from '../../ui/input';
import Modal from '../../ui/modal';
import FilterChip from '../FilterChip';
import { s } from '../../../utils/style-helpers';
import type { ClassName } from '../../../types';
import { CLASS_LABELS, SCHOOL_COLORS, getSchoolColor, getLevelCounts } from './types';

const SCHOOL_KEYS = Object.keys(SCHOOL_COLORS);
const LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const CLASS_KEYS = Object.keys(CLASS_LABELS) as ClassName[];

type Props = {
  search: string;
  onSearchChange: (text: string) => void;
  levelFilter: number | null;
  onLevelFilterChange: (level: number | null) => void;
  classFilter: string | null;
  onClassFilterChange: (className: string | null) => void;
  showPreparedOnly: boolean;
  onPreparedOnlyChange: (v: boolean) => void;
  showFavoritesOnly: boolean;
  onFavoritesOnlyChange: (v: boolean) => void;
  filteredCount: number;
  hasActiveCharacter: boolean;
  /** Classe "bloccata" del PG attivo: la lista è filtrata su di essa e il filtro non è modificabile */
  lockedClass?: string | null;
};

export default function SpellFilters({
  search,
  onSearchChange,
  levelFilter,
  onLevelFilterChange,
  classFilter,
  onClassFilterChange,
  showPreparedOnly,
  onPreparedOnlyChange,
  showFavoritesOnly,
  onFavoritesOnlyChange,
  filteredCount,
  hasActiveCharacter,
  lockedClass,
}: Props) {
  const t = useTokens();
  const levelCounts = useMemo(() => getLevelCounts(), []);
  const [classModalVisible, setClassModalVisible] = useState(false);

  // Se il PG attivo ha una classe il filtro è forzato su di essa → il tasto sparisce
  const isClassLocked = !!lockedClass;
  const selectedClassName = classFilter
    ? (CLASS_LABELS[classFilter as ClassName] ?? classFilter)
    : null;

  return (
    <View>
      <Input
        placeholder="Cerca incantesimo..."
        value={search}
        onChangeText={onSearchChange}
        style={s.mb(t.spacing[3])}
      />

      {/* Level filter */}
      <View style={s.mb(t.spacing[3])}>
        <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
          {LEVELS.map((lvl) => {
            const active = levelFilter === lvl;
            return (
              <FilterChip
                key={lvl}
                active={active}
                onPress={() => onLevelFilterChange(active ? null : lvl)}
                activeBg={getSchoolColor(SCHOOL_KEYS[lvl % SCHOOL_KEYS.length])}
                activeFg="#FFFFFF"
                label={
                  <>
                    {lvl === 0 ? '☆' : `${lvl}°`}
                    {' '}
                    {levelCounts[lvl] != null && (
                      <Text style={{ opacity: 0.6 }}>{levelCounts[lvl]}</Text>
                    )}
                  </>
                }
              />
            );
          })}
        </View>
      </View>

      {/* Class & toggle filters — il filtro classe sparisce se la lista è legata al PG */}
      <View style={[s.rowWrap, s.gap(t.spacing[2]), s.mb(t.spacing[3])]}>
        {!isClassLocked && (
          <FilterChip
            label={`🎯 ${selectedClassName ?? 'Tutte le classi'}`}
            active={!!classFilter}
            onPress={() => setClassModalVisible(true)}
          />
        )}

        {hasActiveCharacter && (
          <>
            <FilterChip
              label="✓ Preparate"
              active={showPreparedOnly}
              onPress={() => onPreparedOnlyChange(!showPreparedOnly)}
            />
            <FilterChip
              label="★ Preferite"
              active={showFavoritesOnly}
              onPress={() => onFavoritesOnlyChange(!showFavoritesOnly)}
              activeBg="#F59E0B"
              activeFg="#FFFFFF"
            />
          </>
        )}
      </View>

      {/* Results count */}
      <Text style={{
        fontSize: t.typography.xs,
        color: t.colors.foregroundTertiary,
        marginBottom: t.spacing[2],
      }}>
        {filteredCount} incantesimi trovati
      </Text>

      {/* Class picker bottom sheet */}
      <Modal.Sheet
        visible={classModalVisible}
        onClose={() => setClassModalVisible(false)}
        title="Filtra per classe"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => {
              onClassFilterChange(null);
              setClassModalVisible(false);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: t.spacing[3],
              paddingVertical: t.spacing[2.5],
              borderRadius: t.radius.lg,
              marginBottom: t.spacing[3],
              backgroundColor: !classFilter ? t.colors.accent : t.colors.backgroundSecondary,
              borderWidth: 1,
              borderColor: !classFilter ? 'transparent' : t.colors.border,
            }}
          >
            <Text style={{
              fontSize: t.typography.md,
              fontWeight: '600',
              color: !classFilter ? t.colors.accentForeground : t.colors.foreground,
            }}>
              Tutte le classi
            </Text>
            {!classFilter && (
              <Text style={{ fontSize: t.typography.md, color: t.colors.accentForeground }}>✓</Text>
            )}
          </TouchableOpacity>

          <View style={[s.rowWrap, s.gap(t.spacing[2])]}>
            {CLASS_KEYS.map((c) => {
              const active = classFilter?.toLowerCase() === c;
              return (
                <FilterChip
                  key={c}
                  size="sm"
                  active={active}
                  onPress={() => {
                    onClassFilterChange(active ? null : c);
                    setClassModalVisible(false);
                  }}
                  label={CLASS_LABELS[c]}
                />
              );
            })}
          </View>
        </ScrollView>
      </Modal.Sheet>
    </View>
  );
}
