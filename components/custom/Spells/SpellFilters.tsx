import { View, Text, TouchableOpacity } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Input } from '../../ui/input';
import { spacing, fontSizes, radius } from '../../../utils/styles';
import { ClassName, CLASS_LABELS, getSchoolColor, getLevelCounts } from './types';
import { useMemo } from 'react';

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
}: Props) {
  const t = useTokens();
  const levelCounts = useMemo(() => getLevelCounts(), []);

  return (
    <View>
      <Input
        placeholder="Cerca incantesimo..."
        value={search}
        onChangeText={onSearchChange}
        style={{ marginBottom: spacing[3] }}
      />

      {/* Level filter */}
      <View style={{ marginBottom: spacing[3] }}>
        <View style={{ flexDirection: 'row', gap: spacing[1.5], flexWrap: 'wrap' }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
            const active = levelFilter === lvl;
            return (
              <TouchableOpacity
                key={lvl}
                onPress={() => onLevelFilterChange(active ? null : lvl)}
                style={{
                  paddingHorizontal: spacing[2.5],
                  paddingVertical: spacing[1],
                  borderRadius: radius.full,
                  backgroundColor: active ? getSchoolColor(Object.keys({})[lvl % 8] || 'abjuration') : t.colors.backgroundSecondary,
                  borderWidth: 1,
                  borderColor: active ? 'transparent' : t.colors.border,
                }}
              >
                <Text style={{
                  fontSize: fontSizes.xs,
                  fontWeight: active ? '600' : '400',
                  color: active ? '#FFFFFF' : t.colors.foregroundSecondary,
                }}>
                  {lvl === 0 ? '☆' : `${lvl}°`}
                  {' '}
                  {levelCounts[lvl] != null && (
                    <Text style={{ opacity: 0.6 }}>{levelCounts[lvl]}</Text>
                  )}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Class & toggle filters */}
      <View style={{ flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap', marginBottom: spacing[3] }}>
        <TouchableOpacity
          onPress={() => onClassFilterChange(classFilter ? null : (classFilter ?? null))}
          style={{
            paddingHorizontal: spacing[2.5], paddingVertical: spacing[1],
            borderRadius: radius.full,
            backgroundColor: classFilter ? t.colors.accent : t.colors.backgroundSecondary,
            borderWidth: 1, borderColor: classFilter ? 'transparent' : t.colors.border,
          }}
        >
          <Text style={{
            fontSize: fontSizes.xs,
            color: classFilter ? t.colors.accentForeground : t.colors.foregroundSecondary,
          }}>
            🎯 Tutte le classi
          </Text>
        </TouchableOpacity>

        {hasActiveCharacter && (
          <>
            <TouchableOpacity
              onPress={() => onPreparedOnlyChange(!showPreparedOnly)}
              style={{
                paddingHorizontal: spacing[2.5], paddingVertical: spacing[1],
                borderRadius: radius.full,
                backgroundColor: showPreparedOnly ? t.colors.accent : t.colors.backgroundSecondary,
                borderWidth: 1, borderColor: showPreparedOnly ? 'transparent' : t.colors.border,
              }}
            >
              <Text style={{
                fontSize: fontSizes.xs,
                color: showPreparedOnly ? t.colors.accentForeground : t.colors.foregroundSecondary,
              }}>
                ✓ Preparate
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onFavoritesOnlyChange(!showFavoritesOnly)}
              style={{
                paddingHorizontal: spacing[2.5], paddingVertical: spacing[1],
                borderRadius: radius.full,
                backgroundColor: showFavoritesOnly ? '#F59E0B' : t.colors.backgroundSecondary,
                borderWidth: 1, borderColor: showFavoritesOnly ? 'transparent' : t.colors.border,
              }}
            >
              <Text style={{
                fontSize: fontSizes.xs,
                color: showFavoritesOnly ? '#FFFFFF' : t.colors.foregroundSecondary,
              }}>
                ★ Preferite
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Results count */}
      <Text style={{
        fontSize: fontSizes.xs,
        color: t.colors.foregroundTertiary,
        marginBottom: spacing[2],
      }}>
        {filteredCount} incantesimi trovati
      </Text>
    </View>
  );
}
