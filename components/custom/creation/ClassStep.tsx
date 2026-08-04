import { Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import ClassCarousel from '../ClassCarousel';
import type { ClassCarouselItem } from '../ClassCarousel';
import StepLabel from './StepLabel';
import type { ClassName } from '../../../types';

type Props = {
  items: ClassCarouselItem[];
  selected: ClassName;
  onSelect: (key: ClassName) => void;
};

/** Step 2 — Scelta della classe (carousel) */
export default function ClassStep({ items, selected, onSelect }: Props) {
  const t = useTokens();

  return (
    <View>
      <StepLabel>CLASSE</StepLabel>
      <ClassCarousel items={items} selected={selected} onSelect={onSelect} />
      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary, marginTop: t.spacing[2] }}>
        La classe determina dado vita, tiri salvezza, competenze e (se incantatore) la progressione magica.
      </Text>
    </View>
  );
}
