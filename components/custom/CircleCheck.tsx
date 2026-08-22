import { Pressable, Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';

type Props = {
  checked: boolean;
  onPress: () => void;
  /** Colore principale (default accent) */
  color?: string;
  /** Icona interna quando checked (default '✓') */
  icon?: string;
  /** Colore dell'icona interna quando checked (default accentForeground) */
  iconColor?: string;
  /** Diametro del cerchio (default 26) */
  size?: number;
  /** Area tocco extra (default 8) */
  hitSlop?: number;
};

/**
 * Checkbox circolare (cerchio con bordo 2, riempito quando attivo, ✓ dentro).
 * Pattern duplicato per equipaggiare oggetti e completare note.
 */
export default function CircleCheck({
  checked,
  onPress,
  color,
  icon = '✓',
  iconColor,
  size = 26,
  hitSlop = 8,
}: Props) {
  const t = useTokens();
  const accent = color ?? t.colors.accent;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: checked ? accent : t.colors.border,
        backgroundColor: checked ? accent : 'transparent',
        ...s.center,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {checked && (
        <Text
          style={{
            color: iconColor ?? t.colors.accentForeground,
            fontSize: t.typography.sm,
            fontWeight: '700',
          }}
        >
          {icon}
        </Text>
      )}
    </Pressable>
  );
}
