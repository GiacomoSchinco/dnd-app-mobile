import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Input } from '../../ui/input';
import Modal from '../../ui/modal';
import { s } from '../../../utils/style-helpers';
import type { ClassName } from '../../../types';
import { CLASS_LABELS, SCHOOL_COLORS, getSchoolColor, getLevelCounts } from './types';

const SCHOOL_KEYS = Object.keys(SCHOOL_COLORS);

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
  const [classModalVisible, setClassModalVisible] = useState(false);

  const allClasses = Object.keys(CLASS_LABELS) as ClassName[];
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
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
            const active = levelFilter === lvl;
            return (
              <TouchableOpacity
                key={lvl}
                onPress={() => onLevelFilterChange(active ? null : lvl)}
                style={{
                  paddingHorizontal: t.spacing[2.5],
                  paddingVertical: t.spacing[1],
                  borderRadius: t.radius.full,
                  backgroundColor: active ? getSchoolColor(SCHOOL_KEYS[lvl % SCHOOL_KEYS.length]) : t.colors.backgroundSecondary,
                  borderWidth: 1,
                  borderColor: active ? 'transparent' : t.colors.border,
                }}
              >
                <Text style={{
                  fontSize: t.typography.xs,
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
      <View style={[s.rowWrap, s.gap(t.spacing[2]), s.mb(t.spacing[3])]}>
        <TouchableOpacity
          onPress={() => setClassModalVisible(true)}
          style={{
            paddingHorizontal: t.spacing[2.5], paddingVertical: t.spacing[1],
            borderRadius: t.radius.full,
            backgroundColor: classFilter ? t.colors.accent : t.colors.backgroundSecondary,
            borderWidth: 1, borderColor: classFilter ? 'transparent' : t.colors.border,
          }}
        >
          <Text style={{
            fontSize: t.typography.xs,
            fontWeight: classFilter ? '600' : '400',
            color: classFilter ? t.colors.accentForeground : t.colors.foregroundSecondary,
          }}>
            🎯 {selectedClassName ?? 'Tutte le classi'}
          </Text>
        </TouchableOpacity>

        {hasActiveCharacter && (
          <>
            <TouchableOpacity
              onPress={() => onPreparedOnlyChange(!showPreparedOnly)}
              style={{
                paddingHorizontal: t.spacing[2.5], paddingVertical: t.spacing[1],
                borderRadius: t.radius.full,
                backgroundColor: showPreparedOnly ? t.colors.accent : t.colors.backgroundSecondary,
                borderWidth: 1, borderColor: showPreparedOnly ? 'transparent' : t.colors.border,
              }}
            >
              <Text style={{
                fontSize: t.typography.xs,
                color: showPreparedOnly ? t.colors.accentForeground : t.colors.foregroundSecondary,
              }}>
                ✓ Preparate
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onFavoritesOnlyChange(!showFavoritesOnly)}
              style={{
                paddingHorizontal: t.spacing[2.5], paddingVertical: t.spacing[1],
                borderRadius: t.radius.full,
                backgroundColor: showFavoritesOnly ? '#F59E0B' : t.colors.backgroundSecondary,
                borderWidth: 1, borderColor: showFavoritesOnly ? 'transparent' : t.colors.border,
              }}
            >
              <Text style={{
                fontSize: t.typography.xs,
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
            {allClasses.map((c) => {
              const active = classFilter?.toLowerCase() === c;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => {
                    onClassFilterChange(active ? null : c);
                    setClassModalVisible(false);
                  }}
                  style={{
                    paddingHorizontal: t.spacing[3],
                    paddingVertical: t.spacing[2],
                    borderRadius: t.radius.full,
                    backgroundColor: active ? t.colors.accent : t.colors.backgroundSecondary,
                    borderWidth: 1,
                    borderColor: active ? 'transparent' : t.colors.border,
                  }}
                >
                  <Text style={{
                    fontSize: t.typography.sm,
                    fontWeight: active ? '600' : '400',
                    color: active ? t.colors.accentForeground : t.colors.foregroundSecondary,
                  }}>
                    {CLASS_LABELS[c]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </Modal.Sheet>
    </View>
  );
}
