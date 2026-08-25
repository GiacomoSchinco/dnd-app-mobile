import { Pressable, Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import ClassCarousel from '../ClassCarousel';
import type { ClassCarouselItem } from '../ClassCarousel';
import type { CardCarouselItem } from '../CardCarousel';
import { getClassNameItalian } from '../../../lib/rules/classes';
import { s } from '../../../utils/style-helpers';
import StepLabel from './StepLabel';
import Chip from './Chip';
import type { ClassName } from '../../../types';

type Props = {
  items: ClassCarouselItem[];
  selected: ClassName;
  onSelect: (key: ClassName) => void;
  /** Apre il dettaglio completo della classe (pulsante info sul carousel) */
  onShowDetails?: (item: CardCarouselItem) => void;
  // Multiclasse
  classList: { className: ClassName; level: number }[];
  activeIndex: number;
  onSelectActive: (i: number) => void;
  onAddClass: () => void;
  onRemoveClass: (i: number) => void;
  canAddClass: boolean;
  totalLevel: number;
};

/** Step 2 — Scelta della classe (carousel) + gestione multiclasse */
export default function ClassStep({
  items,
  selected,
  onSelect,
  onShowDetails,
  classList,
  activeIndex,
  onSelectActive,
  onAddClass,
  onRemoveClass,
  canAddClass,
  totalLevel,
}: Props) {
  const t = useTokens();

  return (
    <View>
      <StepLabel>CLASSE</StepLabel>
      <ClassCarousel items={items} selected={selected} onSelect={onSelect} onShowDetails={onShowDetails} />
      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary, marginTop: t.spacing[2] }}>
        La classe determina dado vita, tiri salvezza, competenze e (se incantatore) la progressione magica.
      </Text>

      {/* Classi configurate (multiclasse) */}
      {classList.length > 0 && (
        <View style={{ marginTop: t.spacing[4] }}>
          <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.foregroundTertiary, marginBottom: t.spacing[1] }}>
            CLASSI DEL PERSONAGGIO · TOTALE {totalLevel}°
          </Text>
          <View style={[s.row, { gap: t.spacing[1.5], flexWrap: 'wrap' }]}>
            {classList.map((c, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Chip
                  label={`${getClassNameItalian(c.className)} ${c.level}°${i === 0 ? ' · primaria' : ''}`}
                  selected={i === activeIndex}
                  compact
                  onPress={() => onSelectActive(i)}
                />
                {i > 0 && (
                  <Pressable
                    onPress={() => onRemoveClass(i)}
                    hitSlop={10}
                    style={{ marginLeft: -t.spacing[1], padding: t.spacing[0.5], zIndex: 2 }}
                  >
                    <Text style={{ color: t.colors.danger, fontSize: t.typography.sm, fontWeight: '700' }}>✕</Text>
                  </Pressable>
                )}
              </View>
            ))}
            {canAddClass && (
              <Chip label="＋ Aggiungi classe" compact onPress={onAddClass} />
            )}
          </View>
          {classList.length > 1 && (
            <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: t.spacing[1] }}>
              Tocca una classe per configurarne livello, sottoclasse e competenze. La prima è la classe primaria (dado vita max, tiri salvezza, equipaggiamento iniziale).
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
