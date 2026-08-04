import { Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import CardCarousel from '../CardCarousel';
import type { CardCarouselItem } from '../CardCarousel';
import StepLabel from './StepLabel';
import type { SubclassDefinition } from '../../../lib/rules/subclasses';

type Props = {
  subclassLabel?: string;
  firstSubclassLevel?: number;
  subclassId: number | null;
  onSubclassChange: (id: number | null) => void;
  subclasses: SubclassDefinition[];
};

/** Step dedicato — Sottoclasse (mostrato solo se il livello la sblocca) */
export default function SubclassStep({
  subclassLabel,
  firstSubclassLevel,
  subclassId,
  onSubclassChange,
  subclasses,
}: Props) {
  const t = useTokens();

  const items: CardCarouselItem[] = subclasses.map((sc) => ({
    key: String(sc.id),
    label: sc.name,
    desc: sc.description,
  }));

  return (
    <View>
      <StepLabel>SOTTOCLASSE ({subclassLabel ?? 'Sottoclasse'})</StepLabel>
      {firstSubclassLevel != null && (
        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary, marginBottom: t.spacing[2] }}>
          Disponibile dal livello {firstSubclassLevel} — scegli il tuo cammino.
        </Text>
      )}
      <CardCarousel
        items={items}
        selected={subclassId != null ? String(subclassId) : null}
        onSelect={(key) => onSubclassChange(Number(key))}
      />
    </View>
  );
}
