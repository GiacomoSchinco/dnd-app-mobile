import { Pressable, Text } from 'react-native';
import type { ReactNode } from 'react';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';

type Props = {
  onPress: () => void;
  children: ReactNode;
};

/** Bottone quadrato ± per stepper (punti ferita, denaro, conteggi…) */
export default function StepperButton({ onPress, children }: Props) {
  const t = useTokens();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 34,
        height: 34,
        borderRadius: t.radius.sm,
        backgroundColor: pressed ? t.colors.accent : t.colors.accent + '18',
        ...s.center,
      })}
    >
      <Text style={{ fontSize: t.typography.base, fontWeight: '700', color: t.colors.accent }}>{children}</Text>
    </Pressable>
  );
}
