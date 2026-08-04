import { useRef, useState } from 'react';
import { View, Text, Image, Pressable, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { Carousel, type CarouselRef } from 'react-native-reanimated-carousel';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';

export interface CardCarouselItem {
  key: string;
  label: string;
  desc: string;
  /** Badge sopra il titolo (es. taglia 'Media / Piccola') */
  badge?: string;
  /** Riga di dettaglio sotto il titolo (es. 'Velocità 9 m') */
  sublabel?: string;
  /** Immagine opzionale mostrata in alto (es. token PNG della classe) */
  image?: ImageSourcePropType;
}

type Props = {
  items: CardCarouselItem[];
  selected: string | null;
  onSelect: (key: string) => void;
  /** Altezza delle card (default 340) */
  cardHeight?: number;
};

const DEFAULT_HEIGHT = 340;
const IMAGE_BOX_HEIGHT = 58;
const IMAGE_SIZE = 116;

/**
 * Carousel orizzontale INFINITO generico (scelta classe, razza, …).
 * Basato su react-native-reanimated-carousel (v5): loop nativo + dot custom.
 * NOTA: NON usa la Pagination della libreria — leggeva `progress.value` durante
 * il render (warning Reanimated 4 strict). I dot sono guidati da `currentIndex`
 * (React state via onSnapToItem), quindi niente shared value letti in render.
 * La larghezza è misurata via onLayout così la card resta sempre centrata.
 */
export default function CardCarousel({
  items,
  selected,
  onSelect,
  cardHeight = DEFAULT_HEIGHT,
}: Props) {
  const t = useTokens();
  const { width } = useWindowDimensions();
  const ref = useRef<CarouselRef>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Larghezza pagina = larghezza reale del container (misurata via onLayout),
  // con fallback sulla larghezza schermo meno i margini orizzontali.
  const pageWidth = containerWidth || Math.max(width - t.spacing[4] * 2, 0);

  return (
    <View
      style={{ width: '100%', alignItems: 'center' }}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Carousel
        ref={ref}
        loop
        data={items}
        keyExtractor={(item) => item.key}
        defaultIndex={0}
        style={{ width: pageWidth, height: cardHeight }}
        onSnapToItem={(index) => {
          setCurrentIndex(index);
          const item = items[index];
          if (item) onSelect(item.key);
        }}
        renderItem={({ item }) => {
          const isSelected = selected === item.key;
          return (
            <View style={[s.flex, { marginHorizontal: 8, paddingVertical: 6 }]}>
              <Pressable
                onPress={() => onSelect(item.key)}
                style={{
                  flex: 1,
                  borderRadius: t.radius.xl,
                  borderWidth: 2,
                  borderColor: isSelected ? t.colors.accent : t.colors.border,
                  backgroundColor: t.colors.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: t.spacing[6],
                  ...(isSelected && {
                    shadowColor: t.colors.accent,
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 8,
                  }),
                }}
              >
                {item.image && (
                  <View
                    style={[
                      s.box(IMAGE_SIZE, IMAGE_BOX_HEIGHT),
                      {
                        overflow: 'hidden',
                        marginBottom: t.spacing[5],
                        borderWidth: 2,
                        borderColor: isSelected ? t.colors.accent : t.colors.border,
                        backgroundColor: t.colors.backgroundSecondary,
                      },
                    ]}
                  >
                    <Image
                      source={item.image}
                      style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
                      resizeMode="cover"
                    />
                  </View>
                )}

                {item.badge && (
                  <Text
                    style={{
                      fontSize: t.typography.xs,
                      fontWeight: t.typography.semibold,
                      color: t.colors.accent,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      marginBottom: t.spacing[1],
                    }}
                  >
                    {item.badge}
                  </Text>
                )}

                <Text style={{ fontSize: t.typography.xl, fontWeight: '800', color: t.colors.foreground, textAlign: 'center' }}>
                  {item.label}
                </Text>

                {item.sublabel && (
                  <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[1] }}>
                    {item.sublabel}
                  </Text>
                )}

                <Text
                  style={{
                    fontSize: t.typography.sm,
                    color: t.colors.foregroundSecondary,
                    textAlign: 'center',
                    marginTop: t.spacing[2],
                    paddingHorizontal: t.spacing[4],
                  }}
                  numberOfLines={4}
                >
                  {item.desc}
                </Text>
              </Pressable>
            </View>
          );
        }}
      />

      {/* Dot custom (niente shared value letti in render → no warning Reanimated strict) */}
      <View style={[s.row, { justifyContent: 'center', gap: 8, marginTop: t.spacing[4] }]}>
        {items.map((item, i) => {
          const active = i === currentIndex;
          return (
            <Pressable
              key={item.key}
              onPress={() => ref.current?.scrollTo({ index: i, animated: true })}
              style={{
                width: active ? 22 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: active ? t.colors.accent : t.colors.border,
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
