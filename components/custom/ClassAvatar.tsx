import { View, Text, Image, StyleProp, ViewStyle } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { getClassToken } from '../../utils/class-tokens';

type Props = {
  /** Chiave classe (es. 'wizard') — se assente usa il fallback */
  className?: string;
  /** Diametro dell'avatar (default 52) */
  size?: number;
  /** Emoji di fallback quando la classe non ha token */
  fallback?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Avatar circolare con la token della classe (assets/classes/token_*.png).
 * Riutilizzato in Home, Scheda Personaggio e Compendio Classi.
 */
export default function ClassAvatar({ className, size = 52, fallback = '🧙', style }: Props) {
  const t = useTokens();
  const token = getClassToken(className);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: t.colors.accent + '18',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {token ? (
        <Image source={token} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <Text style={{ fontSize: size * 0.5 }}>{fallback}</Text>
      )}
    </View>
  );
}
