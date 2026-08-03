import { create } from 'zustand';
import { Animated } from 'react-native';

/**
 * Stato condiviso del pannello dado + Animated.Value condiviso:
 * così il pannello (DiceOverlay, a livello App) e la tab bar (AppNavigator)
 * restano sincronizzati nell'animazione di apertura/chiusura.
 */
type DiceState = {
  isOpen: boolean;
  anim: Animated.Value;
  toggle: () => void;
};

export const useDiceStore = create<DiceState>((set, get) => ({
  isOpen: false,
  anim: new Animated.Value(0),
  toggle: () => {
    const { isOpen, anim } = get();
    if (isOpen) {
      Animated.timing(anim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() =>
        set({ isOpen: false }),
      );
    } else {
      set({ isOpen: true });
      Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    }
  },
}));
