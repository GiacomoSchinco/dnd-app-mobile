import { Pressable } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';

type Props = {
  visible: boolean;
  onPress: () => void;
  /** Distanza dal bordo inferiore (es. `insets.bottom + 80`) */
  bottom: number;
  /** Distanza dal bordo destro (default 20) */
  right?: number;
};

/**
 * FAB "Torna su" (chevron ↑) flottante in basso a destra.
 * Usato dalle liste lunghe (Oggetti, Magie). Ritorna `null` se non visibile.
 */
export default function ScrollToTopFab({ visible, onPress, bottom, right = 20 }: Props) {
  const t = useTokens();
  if (!visible) return null;

  return (
    <Pressable
      onPress={onPress}
      style={{
        position: 'absolute',
        bottom,
        right,
        ...s.box(50, 25),
        backgroundColor: t.colors.accent,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 6,
        zIndex: 999,
      }}
    >
      <SvgXml
        xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${t.colors.accentForeground}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`}
        width={24}
        height={24}
      />
    </Pressable>
  );
}
