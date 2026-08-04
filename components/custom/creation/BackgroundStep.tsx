import { Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { getAllBackgrounds } from '../../../lib/rules/backgrounds';
import CardCarousel from '../CardCarousel';
import type { CardCarouselItem } from '../CardCarousel';
import StepLabel from './StepLabel';

type Props = {
  backgroundId: number | null;
  onSelect: (id: number) => void;
};

const BACKGROUNDS = getAllBackgrounds();

const BACKGROUND_ITEMS: CardCarouselItem[] = BACKGROUNDS.map((b) => ({
  key: String(b.id),
  label: b.name,
  desc: b.description,
  sublabel: `Talento: ${b.feat.name}`,
}));

/** Step 5 — Background (carousel) */
export default function BackgroundStep({ backgroundId, onSelect }: Props) {
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
    </View>
  );
}
