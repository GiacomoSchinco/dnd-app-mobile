import { Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import CardCarousel from '../CardCarousel';
import type { CardCarouselItem } from '../CardCarousel';
import StepLabel from './StepLabel';
import ClassSwitcher from './ClassSwitcher';
import type { SubclassDefinition } from '../../../lib/rules/subclasses';
import type { ClassName } from '../../../types';

type Props = {
  subclassLabel?: string;
  firstSubclassLevel?: number;
  subclassId: number | null;
  onSubclassChange: (id: number | null) => void;
  subclasses: SubclassDefinition[];
  /** Etichetta della classe attiva (multiclasse) */
  classNameLabel?: string;
  /** Switcher classe attiva (multiclasse) */
  classList: { className: ClassName; level: number }[];
  activeIndex: number;
  onSelectActive: (i: number) => void;
};

/** Step dedicato — Sottoclasse (mostrato solo se il livello la sblocca) */
export default function SubclassStep({
  subclassLabel,
  firstSubclassLevel,
  subclassId,
  onSubclassChange,
  subclasses,
  classNameLabel,
  classList,
  activeIndex,
  onSelectActive,
}: Props) {
  const t = useTokens();

  const items: CardCarouselItem[] = subclasses.map((sc) => ({
    key: String(sc.id),
    label: sc.name,
    desc: sc.description,
  }));

  return (
    <View>
      <ClassSwitcher classList={classList} activeIndex={activeIndex} onSelectActive={onSelectActive} />

      <StepLabel>
        {classNameLabel ? `SOTTOCLASSE ${classNameLabel.toUpperCase()}` : `SOTTOCLASSE (${subclassLabel ?? 'Sottoclasse'})`}
      </StepLabel>
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
