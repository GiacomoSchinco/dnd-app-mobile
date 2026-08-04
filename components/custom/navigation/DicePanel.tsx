import { useRef } from 'react';
import { View, ScrollView, Animated, Platform } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import ScreenHeader from '../ScreenHeader';
import DiceRoller from '../DiceRoller';
import { spacing } from '../../../utils/styles';

type Props = {
  isVisible: boolean;
  translateY: Animated.AnimatedInterpolation<number>;
  opacity: Animated.AnimatedInterpolation<number>;
  bottomMargin: number;
  navbarBg: string;
  navbarBorder: string;
  pillRadius: number;
};

export default function DicePanel({
  isVisible,
  translateY,
  opacity,
  bottomMargin,
  navbarBg,
  navbarBorder,
  pillRadius,
}: Props) {
  const t = useTokens();
  // Quando il contenuto cambia (es. compare il risultato del lancio) si
  // scrolla in fondo: il tasto di lancio resta sempre in basso, visibile.
  const scrollRef = useRef<ScrollView>(null);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: bottomMargin + 80,
        left: 16,
        right: 16,
        backgroundColor: navbarBg,
        borderRadius: pillRadius,
        borderWidth: 1,
        borderColor: navbarBorder,
        borderTopWidth: 3,
        borderTopColor: t.colors.accent,
        borderBottomWidth: 3,
        borderBottomColor: t.colors.accent,
        paddingHorizontal: spacing[6],
        paddingTop: spacing[3],
        paddingBottom: spacing[6],
        maxHeight: '65%',
        zIndex: 50,
        opacity,
        transform: [{ translateY }],
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
          },
          android: { elevation: 8 },
        }),
      }}
    >
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={{ marginBottom: -spacing[6], marginTop: spacing[4] }}>
          <ScreenHeader title="Lancia i tuoi dadi" center={true} />
        </View>
        <DiceRoller initialType="d20" initialQuantity={1} />
      </ScrollView>
    </Animated.View>
  );
}
