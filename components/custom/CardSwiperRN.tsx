import { useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useTokens } from '../ui/prism-provider';
import { spacing, fontSizes, radius } from '../../utils/styles';
import { s } from '../../utils/style-helpers';

export interface CardSwiperEntry {
  id: number;
  /** URI remota (string) o asset locale (require) */
  imageSrc?: string | number;
  label?: string;
}

type Props = {
  items: CardSwiperEntry[];
  onSelect?: (item: CardSwiperEntry) => void;
  stackSize?: number;
};

export default function CardSwiperRN({ items, onSelect, stackSize = 3 }: Props) {
  const t = useTokens();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const swiperRef = useRef<any>(null);

  // Tracciamo l'indice reale globale (cresce all'infinito)
  const [globalIndex, setGlobalIndex] = useState(0);

  // Card con proporzione più bassa
  const cardHMargin = screenWidth * 0.06;
  const cardVMargin = screenHeight * 0.04;

  // Altezza wrapper: card (proporzione 4:3) + margini
  const cardVisualRatio = 1.1;
  const swiperHeight = (screenWidth - cardHMargin * 2) * cardVisualRatio + cardVMargin * 2;

  // Indice corrente relativo all'array (con modulo per l'infinito)
  const currentIndex = useMemo(() => {
    if (!items.length) return 0;
    return globalIndex % items.length;
  }, [globalIndex, items.length]);

  const handleSwipedRight = useCallback((cardIndex: number) => {
    // Swipe a destra → seleziona e avanza
    const itemIndex = cardIndex % items.length;
    const currentItem = items[itemIndex];
    if (currentItem) {
      onSelect?.(currentItem);
    }
    setGlobalIndex((prev) => prev + 1);
  }, [items, onSelect]);

  const handleSwipedLeft = useCallback(() => {
    // Swipe a sinistra → scarta/salta, avanza e basta
    setGlobalIndex((prev) => prev + 1);
  }, []);

  if (!items || items.length === 0) {
    return (
      <View style={[styles.wrapper, { height: swiperHeight }]}>
        <Text style={[styles.emptyText, { color: t.colors.foregroundTertiary }]}>
          Nessun elemento disponibile
        </Text>
      </View>
    );
  }

  return (
    <View style={{ width: screenWidth }}>
      <View style={[styles.wrapper, { height: swiperHeight }]}>
        <Swiper
          ref={swiperRef}
          cards={items}
          renderCard={(card) => {
            if (!card) return null;
            return (
              <View style={[s.flex, { borderRadius: radius.xl, overflow: 'hidden', backgroundColor: 'transparent' }]}>
                {card.imageSrc && (
                  <Image
                    source={typeof card.imageSrc === 'string' ? { uri: card.imageSrc } : card.imageSrc}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                )}
              </View>
            );
          }}
          onSwipedLeft={handleSwipedLeft}
          onSwipedRight={handleSwipedRight}
          cardIndex={0}
          backgroundColor="transparent"
          stackSize={stackSize}
        cardVerticalMargin={cardVMargin}
        cardHorizontalMargin={cardHMargin}
          stackScale={3}
          stackSeparation={10}
          disableBottomSwipe
          disableTopSwipe
          animateOverlayLabelsOpacity
          animateCardOpacity
          showSecondCard
          infinite={true}
        />
      </View>

      <View style={styles.counterRow}>
        <Text style={[styles.counter, { color: t.colors.foregroundSecondary }]}>
          {currentIndex + 1} / {items.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: spacing[12],
    fontSize: fontSizes.base,
  },
  counterRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[6],
    width: '100%',
  },
  counter: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
