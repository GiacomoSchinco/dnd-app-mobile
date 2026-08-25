import CardCarousel, { type CardCarouselItem } from './CardCarousel';
import { getClassToken } from '../../utils/class-tokens';
import type { ClassName } from '../../types';

export interface ClassCarouselItem {
  key: ClassName;
  label: string;
  desc: string;
}

type Props = {
  items: ClassCarouselItem[];
  selected: ClassName | null;
  onSelect: (key: ClassName) => void;
  /** Mostra il pulsante info "(i)" e apre il dettaglio completo */
  onShowDetails?: (item: CardCarouselItem) => void;
};

/**
 * Carousel orizzontale INFINITO per la scelta della classe.
 * Wrapper sottile su `CardCarousel`: aggiunge la token PNG della classe.
 */
export default function ClassCarousel({ items, selected, onSelect, onShowDetails }: Props) {
  const cardItems: CardCarouselItem[] = items.map((it) => ({
    key: it.key,
    label: it.label,
    desc: it.desc,
    image: getClassToken(it.key),
  }));

  return (
    <CardCarousel
      items={cardItems}
      selected={selected}
      onSelect={(key) => onSelect(key as ClassName)}
      onShowDetails={onShowDetails}
    />
  );
}