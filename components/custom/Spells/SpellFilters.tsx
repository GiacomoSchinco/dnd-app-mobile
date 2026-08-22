import { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Input } from '../../ui/input';
import FilterChip from '../FilterChip';
import ChipPickerPanel from '../ChipPickerPanel';
import { s } from '../../../utils/style-helpers';
import type { ClassName } from '../../../types';
import { CLASS_LABELS, SCHOOL_LABELS, SCHOOL_COLORS, FAVORITE_COLOR, getSchoolColor, getLevelCounts } from './types';

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
  schoolFilter: string | null;
  onSchoolFilterChange: (school: string | null) => void;
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
  schoolFilter,
  onSchoolFilterChange,
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
  const [schoolModalVisible, setSchoolModalVisible] = useState(false);

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

      {/* Class, school & toggle filters — il filtro classe sparisce se la lista è legata al PG */}
      <View style={[s.rowWrap, s.gap(t.spacing[2]), s.mb(t.spacing[3])]}>
        <FilterChip
          label={schoolFilter ? `Scuola: ${SCHOOL_LABELS[schoolFilter] ?? schoolFilter}` : 'Tutte le scuole'}
          active={!!schoolFilter}
          activeBg={schoolFilter ? getSchoolColor(schoolFilter) : undefined}
          activeFg="#FFFFFF"
          onPress={() => setSchoolModalVisible(!schoolModalVisible)}
        />
        {!isClassLocked && (
          <FilterChip
            label={classFilter ? `Classe: ${selectedClassName ?? '—'}` : 'Tutte le classi'}
            active={!!classFilter}
            onPress={() => setClassModalVisible(!classModalVisible)}
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
              activeBg={FAVORITE_COLOR}
              activeFg="#FFFFFF"
            />
          </>
        )}
      </View>

      {/* Class picker inline — niente modale nativo (evita la striscia bianca della barra) */}
      {classModalVisible && !isClassLocked && (
        <ChipPickerPanel title="Filtra per classe">
          <FilterChip
            label="Tutte le classi"
            active={!classFilter}
            onPress={() => {
              onClassFilterChange(null);
              setClassModalVisible(false);
            }}
          />
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
        </ChipPickerPanel>
      )}

      {/* School picker inline (stesso pattern del filtro classe) */}
      {schoolModalVisible && (
        <ChipPickerPanel title="Filtra per scuola di magia">
          <FilterChip
            label="Tutte le scuole"
            active={!schoolFilter}
            onPress={() => {
              onSchoolFilterChange(null);
              setSchoolModalVisible(false);
            }}
          />
          {SCHOOL_KEYS.map((school) => {
            const active = schoolFilter === school;
            return (
              <FilterChip
                key={school}
                size="sm"
                active={active}
                onPress={() => {
                  onSchoolFilterChange(active ? null : school);
                  setSchoolModalVisible(false);
                }}
                activeBg={getSchoolColor(school)}
                activeFg="#FFFFFF"
                label={SCHOOL_LABELS[school] ?? school}
              />
            );
          })}
        </ChipPickerPanel>
      )}

      {/* Results count */}
      <Text style={{
        fontSize: t.typography.xs,
        color: t.colors.foregroundTertiary,
        marginBottom: t.spacing[2],
      }}>
        {filteredCount} incantesimi trovati
      </Text>

    </View>
  );
}
