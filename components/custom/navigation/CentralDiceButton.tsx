import { useEffect, useRef } from 'react';
import { Pressable, Animated, Platform } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import DndIcon from '../DndIcon';

type Props = {
  onPress: () => void;
  isExpanded: boolean;
};

export default function CentralDiceButton({ onPress, isExpanded }: Props) {
  const t = useTokens();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Pressable
      onPress={onPress}
      style={{
        top: -40,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: isExpanded ? t.colors.accent : t.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: t.colors.accent,
        zIndex: 100,
        ...Platform.select({
          ios: {
            shadowColor: t.colors.accent,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
          },
          android: { elevation: 24 },
        }),
      }}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <DndIcon name="d20" size={34} color={isExpanded ? '#FFFFFF' : t.colors.accent} />
      </Animated.View>
    </Pressable>
  );
}
