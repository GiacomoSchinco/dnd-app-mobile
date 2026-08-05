import { Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { getAllBackgrounds } from '../../../lib/rules/backgrounds';
import type { ToolOption } from '../../../lib/rules/apply-feat';
import CardCarousel from '../CardCarousel';
import type { CardCarouselItem } from '../CardCarousel';
import FilterChip from '../FilterChip';
import StepLabel from './StepLabel';
import FeatChoice, { type FeatChoiceState } from './FeatChoice';
import { s } from '../../../utils/style-helpers';

type Props = {
  backgroundId: number | null;
  onSelect: (id: number) => void;
  // Scelte strumenti del background (CHOICE)
  bgToolOptions: ToolOption[];
  bgToolChoices: string[];
  bgToolCount: number;
  toggleBgTool: (slug: string) => void;
  // Scelta del talento di origine (strumenti / Abile / Iniziato alla Magia)
  featChoice: FeatChoiceState;
};

const BACKGROUNDS = getAllBackgrounds();

const BACKGROUND_ITEMS: CardCarouselItem[] = BACKGROUNDS.map((b) => ({
  key: String(b.id),
  label: b.name,
  desc: b.description,
  sublabel: `Talento: ${b.feat.name}`,
}));

function ToolPicker({
  title,
  options,
  selected,
  count,
  onToggle,
}: {
  title: string;
  options: ToolOption[];
  selected: string[];
  count: number;
  onToggle: (slug: string) => void;
}) {
  const t = useTokens();
  if (options.length === 0 || count === 0) return null;
  const remaining = Math.max(0, count - selected.length);
  return (
    <View style={{ marginTop: t.spacing[3] }}>
      <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground, marginBottom: t.spacing[2] }}>
        {title}{' '}
        <Text style={{ color: t.colors.foregroundTertiary }}>({selected.length}/{count})</Text>
      </Text>
      <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
        {options.map((o) => (
          <FilterChip
            key={o.slug}
            label={o.label}
            active={selected.includes(o.slug)}
            onPress={() => onToggle(o.slug)}
          />
        ))}
      </View>
      {remaining > 0 && (
        <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: t.spacing[1] }}>
          Scegli {remaining} altro{remaining > 1 ? 'i' : ''}.
        </Text>
      )}
    </View>
  );
}

/** Step 5 — Background (carousel + scelte strumenti + scelta talento) */
export default function BackgroundStep({
  backgroundId,
  onSelect,
  bgToolOptions,
  bgToolChoices,
  bgToolCount,
  toggleBgTool,
  featChoice,
}: Props) {
  const t = useTokens();

  return (
    <View>
      <StepLabel>BACKGROUND</StepLabel>
      <CardCarousel
        items={BACKGROUND_ITEMS}
        selected={backgroundId != null ? String(backgroundId) : null}
        onSelect={(key) => onSelect(Number(key))}
      />
      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary, marginTop: t.spacing[2] }}>
        Il background determina boost alle caratteristiche, competenze, strumenti e un talento.
      </Text>

      {featChoice.name && (
        <View style={{ marginTop: t.spacing[3], padding: t.spacing[3], borderRadius: t.radius.md, backgroundColor: t.colors.backgroundSecondary }}>
          <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
            🎖 Talento: {featChoice.name}
          </Text>
        </View>
      )}

      <ToolPicker
        title="Competenza strumenti (background)"
        options={bgToolOptions}
        selected={bgToolChoices}
        count={bgToolCount}
        onToggle={toggleBgTool}
      />

      <FeatChoice choice={featChoice} />
    </View>
  );
}
