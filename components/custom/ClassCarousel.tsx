import { useRef, useState } from 'react';
import { View, Text, Image, Pressable, useWindowDimensions } from 'react-native';
import { Carousel, type CarouselRef } from 'react-native-reanimated-carousel';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';
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
};

const CARD_HEIGHT = 340;

/**
 * Carousel orizzontale INFINITO per la scelta della classe.
 * Basato su react-native-reanimated-carousel (v5): loop nativo + dot custom.
 * Ogni card mostra la token PNG della classe (assets/classes/token_*.png).
 * NOTA: NON usa la Pagination della libreria — leggeva `progress.value` durante
 * il render (warning Reanimated 4 strict). I dot sono guidati da `currentIndex`
 * (React state via onSnapToItem), quindi niente shared value letti in render.
 */
export default function ClassCarousel({ items, selected, onSelect }: Props) {
  const t = useTokens();
  const { width } = useWindowDimensions();
  const ref = useRef<CarouselRef>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Larghezza pagina = schermo meno i margini orizzontali (t.spacing[4] per lato)
  const pageWidth = width - t.spacing[4] * 2;

  return (
    <View>
      <Carousel
        ref={ref}
        loop
        data={items}
        keyExtractor={(item) => item.key}
        defaultIndex={0}
        style={{ width: pageWidth, height: CARD_HEIGHT }}
        onSnapToItem={(index) => {
          setCurrentIndex(index);
          const item = items[index];
          if (item) onSelect(item.key);
        }}
        renderItem={({ item }) => {
          const isSelected = selected === item.key;
          const token = getClassToken(item.key);
          return (
            <View style={[s.flex, { marginHorizontal: 8, paddingVertical: 6 }]}>
              <View
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
                {token && (
                  <View
                    style={[
                      s.box(116, 58),
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
                      source={token}
                      style={{ width: 116, height: 116 }}
                      resizeMode="cover"
                    />
                  </View>
                )}
                <Text style={{ fontSize: t.typography.xl, fontWeight: '800', color: t.colors.foreground }}>
                  {item.label}
                </Text>
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
              </View>
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