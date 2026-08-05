import { Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { getAllRaces, getLineages, getRaceById } from '../../../lib/rules/races';
import type { SkillName } from '../../../types';
import { s } from '../../../utils/style-helpers';
import CardCarousel from '../CardCarousel';
import type { CardCarouselItem } from '../CardCarousel';
import FilterChip from '../FilterChip';
import StepLabel from './StepLabel';
import Chip from './Chip';

type Props = {
  raceId: number | null;
  onRaceChange: (id: number) => void;
  lineageId: number | null;
  onLineageChange: (id: number) => void;
  // Competenze in abilità concesse dalla razza (es. Umano, Elfo)
  raceSkillOptions: { key: SkillName; label: string }[];
  raceSkills: SkillName[];
  raceSkillCount: number;
  toggleRaceSkill: (skill: SkillName) => void;
};

const RACES = getAllRaces();

const RACE_ITEMS: CardCarouselItem[] = RACES.map((r) => ({
  key: String(r.id),
  label: r.name,
  desc: r.description,
  badge: r.sizeOptions.join(' / '),
  sublabel: `Velocità ${r.baseSpeed} ${r.speedUnit}`,
}));

/** Step 4 — Razza (carousel) + sottorazza (lineage) + competenze in abilità */
export default function RaceStep({
  raceId,
  onRaceChange,
  lineageId,
  onLineageChange,
  raceSkillOptions,
  raceSkills,
  raceSkillCount,
  toggleRaceSkill,
}: Props) {
  const t = useTokens();
  const race = raceId != null ? getRaceById(raceId) : undefined;
  const lineages = race ? getLineages(race) : null;

  return (
    <View>
      <StepLabel>RAZZA</StepLabel>
      <CardCarousel
        items={RACE_ITEMS}
        selected={raceId != null ? String(raceId) : null}
        onSelect={(key) => onRaceChange(Number(key))}
      />

      {lineages && lineages.length > 0 && (
        <View style={{ marginTop: t.spacing[4] }}>
          <StepLabel>SOTTORAZZA</StepLabel>
          <View style={[s.row, s.gap(t.spacing[2]), { flexWrap: 'wrap' }]}>
            {lineages.map((l) => (
              <Chip
                key={l.id}
                label={l.name}
                selected={l.id === lineageId}
                onPress={() => onLineageChange(l.id)}
              />
            ))}
          </View>
        </View>
      )}

      {raceSkillOptions.length > 0 && (
        <View style={{ marginTop: t.spacing[4] }}>
          <StepLabel>COMPETENZE</StepLabel>
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginBottom: t.spacing[2] }}>
            Scegli {raceSkillCount} competenza{raceSkillCount > 1 ? 'e' : ''} in abilità ({raceSkills.length}/{raceSkillCount})
          </Text>
          <View style={[s.row, s.gap(t.spacing[1.5]), { flexWrap: 'wrap' }]}>
            {raceSkillOptions.map((o) => (
              <FilterChip
                key={o.key}
                label={o.label}
                active={raceSkills.includes(o.key)}
                onPress={() => toggleRaceSkill(o.key)}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
