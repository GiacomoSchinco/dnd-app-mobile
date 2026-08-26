import { View, Image, StyleProp, ViewStyle } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { getClassToken } from '../../utils/class-tokens';
import DndIcon, { type IconName } from './DndIcon';

type Props = {
  /** Chiave classe (es. 'wizard') — se assente usa il fallback */
  className?: string;
  /** Diametro dell'avatar (default 52) */
  size?: number;
  /** Icona DndIcon di fallback quando la classe non ha token */
  fallback?: IconName;
  style?: StyleProp<ViewStyle>;
};

/**
 * Avatar circolare con la token della classe (assets/classes/token_*.png).
 * Riutilizzato in Home, Scheda Personaggio e Compendio Classi.
 */
export default function ClassAvatar({ className, size = 52, fallback = 'classical-knowledge', style }: Props) {
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
        <DndIcon name={fallback} size={size * 0.5} color={t.colors.accent} />
      )}
    </View>
  );
}
