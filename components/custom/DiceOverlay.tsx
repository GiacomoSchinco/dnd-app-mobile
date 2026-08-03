import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../ui/prism-provider';
import CentralDiceButton from './navigation/CentralDiceButton';
import DicePanel from './navigation/DicePanel';
import { useDiceStore } from '../../store/useDiceStore';

/** Converte un colore esadecimale (#HEX) in rgba con opacità */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Overlay globale del dado, renderizzato a livello di App (sopra TUTTO,
 * anche gli stack nativi come AltroStack/Compendio) così il pulsante e il
 * pannello sono sempre visibili ovunque, tranne dove `visible` è false (Home).
 */
export default function DiceOverlay({ visible }: { visible: boolean }) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { isOpen, anim, toggle } = useDiceStore();

  if (!visible) return null;

  const bottomMargin = insets.bottom > 0 ? insets.bottom : 16;
  const navbarBg = hexToRgba(t.colors.card, 0.97);
  const navbarBorder = hexToRgba(t.colors.cardBorder, 0.8);
  const pillRadius = t.radius.xl || 24;

  const dicePanelTranslateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  const dicePanelOpacity = anim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <>
      <DicePanel
        isVisible={isOpen}
        translateY={dicePanelTranslateY}
        opacity={dicePanelOpacity}
        bottomMargin={bottomMargin}
        navbarBg={navbarBg}
        navbarBorder={navbarBorder}
        pillRadius={pillRadius}
      />
      <View
        style={{
          position: 'absolute',
          bottom: bottomMargin - 24,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 100,
          pointerEvents: 'box-none',
        }}
      >
        <CentralDiceButton onPress={toggle} isExpanded={isOpen} />
      </View>
    </>
  );
}
