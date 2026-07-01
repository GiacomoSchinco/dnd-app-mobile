import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Input } from '../../ui/input';
import { spacing, fontSizes, radius } from '../../../utils/styles';
import { useActiveCharacter } from '../../../store/useActiveCharacter';
import { getSpellProgression } from '../../../lib/rules/spellcasting';
import spellsData from '../../../assets/spells.json';
import type { Spell, ClassName } from '../../../types';
import {
  CLASS_LABELS,
  SCHOOL_LABELS,
  SCHOOL_MAP,
  spellMatchesClass,
  SCHOOL_COLORS,
  getSchoolColor,
  getLevelCounts,
} from './types';
import SpellCard from './SpellCard';

const SCHOOL_KEYS = Object.keys(SCHOOL_COLORS);

type Props = {
  characterId: string;
};

export default function SpellAssignment({ characterId }: Props) {
  const t = useTokens();
  const { characters, togglePreparedSpell, toggleFavoriteSpell } = useActiveCharacter();
  const char = characters.find((c) => c.id === characterId);

  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [showPreparedOnly, setShowPreparedOnly] = useState(false);

  if (!char) return null;

  // ── Calcola progressione ──
  const progression = useMemo(
    () => getSpellProgression(char.classes?.[0]?.className || '', char.level),
    [char.classes?.[0]?.className, char.level],
  );

  const isPreparer = progression?.spellsPreparable != null; // cleric, druid, paladin, wizard
  const hasSpellsKnown = progression?.spellsKnown != null;  // bard, sorcerer, ranger, warlock
  const maxSpells = progression?.spellsPreparable ?? progression?.spellsKnown ?? null;
  const maxCantrips = progression?.cantrips ?? 0;

  // ── Livelli di slot disponibili per questo PG ──
  const availableLevels = useMemo(() => {
    const levels: number[] = [0]; // trucchetti sempre disponibili se la classe li ha
    if (char && progression) {
      for (let lvl = 1; lvl <= 9; lvl++) {
        if ((progression.spellSlots[lvl] ?? 0) > 0) {
          levels.push(lvl);
        }
      }
      // Warlock: livelli disponibili dal pact magic
      if (progression.pactMagic) {
        for (let lvl = 1; lvl <= progression.pactMagic.level; lvl++) {
          if (!levels.includes(lvl)) levels.push(lvl);
        }
        if (progression.pactMagic.mysticArcanum) {
          for (const lvl of progression.pactMagic.mysticArcanum) {
            if (!levels.includes(lvl)) levels.push(lvl);
          }
        }
      }
    }
    return levels.sort((a, b) => a - b);
  }, [char, progression]);

  // ── Conteggio preparati per livello ──
  const preparedByLevel = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const name of char.preparedSpells) {
      const spell = (spellsData as Spell[]).find((s) => s.name === name);
      if (spell) counts[spell.level] = (counts[spell.level] || 0) + 1;
    }
    return counts;
  }, [char.preparedSpells]);

  const cantripCount = preparedByLevel[0] ?? 0;
  const spellCount = Object.entries(preparedByLevel)
    .filter(([lvl]) => Number(lvl) > 0)
    .reduce((sum, [, count]) => sum + count, 0);

  // ── Filtra incantesimi per classe e livello ──
  const classSpells = useMemo(() => {
    if (!char) return [];
    let list = spellsData as Spell[];
      list = list.filter((s) => spellMatchesClass(s, char.classes?.[0]?.className || ''));
    // Mostra solo i livelli che il PG può effettivamente lanciare
    list = list.filter((s) => availableLevels.includes(s.level));
    if (levelFilter !== null) {
      list = list.filter((s) => s.level === levelFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (showPreparedOnly && char) {
      list = list.filter((s) => char.preparedSpells.includes(s.name));
    }
    return list;
  }, [char, availableLevels, levelFilter, search, showPreparedOnly]);

  // ── Raggruppa per livello ──
  const grouped = useMemo(() => {
    const groups: Record<number, Spell[]> = {};
    for (const s of classSpells) {
      if (!groups[s.level]) groups[s.level] = [];
      groups[s.level].push(s);
    }
    return Object.entries(groups)
      .map(([level, spells]) => ({ level: Number(level), spells }))
      .sort((a, b) => a.level - b.level);
  }, [classSpells]);

  return (
    <View style={{ gap: spacing[3] }}>
      {/* Barra di ricerca */}
      <Input
        placeholder="Cerca incantesimo per nome..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Riepilogo per livello */}
      <View
        style={{
          backgroundColor: t.colors.card,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: t.colors.cardBorder,
          overflow: 'hidden',
        }}
      >
        {/* Trucchetti */}
        {maxCantrips > 0 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: spacing[2.5],
              paddingHorizontal: spacing[4],
              borderBottomWidth: 1,
              borderBottomColor: t.colors.cardBorder,
            }}
          >
            <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: t.colors.foreground, flex: 1 }}>
              ☆ Trucchetti
            </Text>
            <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: t.colors.foreground }}>
              <Text style={{ color: cantripCount >= maxCantrips ? t.colors.accent : t.colors.foreground }}>
                {cantripCount}
              </Text>
              <Text style={{ color: t.colors.foregroundTertiary }}>/{maxCantrips}</Text>
            </Text>
          </View>
        )}

        {/* Per ogni livello di slot disponibile (esclusi trucchetti) */}
        {availableLevels.filter((lvl) => lvl > 0).map((lvl) => {
          const prepared = preparedByLevel[lvl] ?? 0;
          const hasSlot = (progression?.spellSlots[lvl] ?? 0) > 0;
          const slotMax = progression?.spellSlots[lvl] ?? 0;
          return (
            <View
              key={lvl}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: spacing[2.5],
                paddingHorizontal: spacing[4],
                borderBottomWidth: lvl < Math.max(...availableLevels) ? 1 : 0,
                borderBottomColor: t.colors.cardBorder,
              }}
            >
              <Text style={{ fontSize: fontSizes.sm, color: t.colors.foreground, flex: 1 }}>
                {lvl}° Livello
                {hasSlot && (
                  <Text style={{ color: t.colors.foregroundTertiary }}> ({slotMax} slot)</Text>
                )}
              </Text>
              <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: prepared > 0 ? t.colors.accent : t.colors.foregroundTertiary }}>
                {prepared > 0 ? `${prepared} ` : ''}
                <Text style={{ color: t.colors.foregroundTertiary }}>
                  {prepared > 0 ? 'preparat' + (prepared > 1 ? 'i' : 'o') : '—'}
                </Text>
              </Text>
            </View>
          );
        })}

        {/* Totale magie livellate (solo per preparer/spells-known) */}
        {(isPreparer || hasSpellsKnown) && maxSpells != null && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: spacing[3],
              paddingHorizontal: spacing[4],
              backgroundColor: t.colors.backgroundSecondary,
            }}
          >
            <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: t.colors.foreground, flex: 1 }}>
              {isPreparer ? 'Totale preparati' : 'Totale conosciuti'}
            </Text>
            <Text style={{ fontSize: fontSizes.base, fontWeight: '800', color: spellCount >= maxSpells ? t.colors.accent : t.colors.foreground }}>
              {spellCount}
              <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: t.colors.foregroundTertiary }}>
                /{maxSpells}
              </Text>
            </Text>
          </View>
        )}
      </View>

      {/* Filtri livello — solo livelli che il PG può lanciare */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: spacing[1.5] }}>
          {availableLevels.map((lvl) => {
            const active = levelFilter === lvl;
            return (
              <TouchableOpacity
                key={lvl}
                onPress={() => setLevelFilter(active ? null : lvl)}
                style={{
                  paddingHorizontal: spacing[3],
                  paddingVertical: spacing[1.5],
                  borderRadius: radius.full,
                  backgroundColor: active
                    ? getSchoolColor(SCHOOL_KEYS[lvl % SCHOOL_KEYS.length])
                    : t.colors.backgroundSecondary,
                  borderWidth: 1,
                  borderColor: active ? 'transparent' : t.colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: fontSizes.xs,
                    fontWeight: active ? '700' : '400',
                    color: active ? '#FFFFFF' : t.colors.foregroundSecondary,
                  }}
                >
                  {lvl === 0 ? '☆' : `${lvl}°`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Toggle prepared only */}
      <View style={{ flexDirection: 'row', gap: spacing[2], alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => setShowPreparedOnly(!showPreparedOnly)}
          style={{
            paddingHorizontal: spacing[2.5],
            paddingVertical: spacing[1],
            borderRadius: radius.full,
            backgroundColor: showPreparedOnly ? t.colors.accent : t.colors.backgroundSecondary,
            borderWidth: 1,
            borderColor: showPreparedOnly ? 'transparent' : t.colors.border,
          }}
        >
          <Text
            style={{
              fontSize: fontSizes.xs,
              fontWeight: showPreparedOnly ? '600' : '400',
              color: showPreparedOnly ? t.colors.accentForeground : t.colors.foregroundSecondary,
            }}
          >
            {showPreparedOnly ? '✓ Solo preparati' : 'Solo preparati'}
          </Text>
        </TouchableOpacity>
        <Text style={{ fontSize: fontSizes.xs, color: t.colors.foregroundTertiary }}>
          {classSpells.length} incantesimi
        </Text>
      </View>

      {/* Lista incantesimi */}
      {grouped.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: spacing[8] }}>
          <Text style={{ fontSize: fontSizes.base, color: t.colors.foregroundSecondary }}>
            Nessun incantesimo trovato
          </Text>
        </View>
      ) : (
        grouped.map((group) => (
          <View key={group.level}>
            <Text
              style={{
                fontSize: fontSizes.xs,
                fontWeight: '700',
                color: t.colors.foregroundTertiary,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: spacing[2],
                marginTop: spacing[1],
              }}
            >
              {group.level === 0 ? 'TRUCCHETTI' : `LIVELLO ${group.level}`}
            </Text>
            {group.spells.map((spell) => {
              const isPrepared = char.preparedSpells.includes(spell.name);
              const isFav = char.favoriteSpells.includes(spell.name);
              const isCantrip = spell.level === 0;
              const atCantripLimit = isCantrip && cantripCount >= maxCantrips && !isPrepared;
              const atSpellLimit = !isCantrip && maxSpells != null && spellCount >= maxSpells && !isPrepared;
              const canPrepare = !atCantripLimit && !atSpellLimit;

              return (
                <SpellCard
                  key={spell.name}
                  spell={spell}
                  isPrepared={isPrepared}
                  isFavorite={isFav}
                  hasActiveCharacter={true}
                  onPress={() => {}}
                  onToggleFavorite={() => toggleFavoriteSpell(spell.name)}
                  onTogglePrepared={() => {
                    if (canPrepare) togglePreparedSpell(spell.name);
                  }}
                />
              );
            })}
          </View>
        ))
      )}
    </View>
  );
}
