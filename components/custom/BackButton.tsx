import { View, Text, Pressable } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';

type Props = {
  onPress: () => void;
  label?: string;
};

export default function BackButton({ onPress, label = 'Indietro' }: Props) {
  const t = useTokens();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...s.row,
        alignSelf: 'flex-start',
        marginBottom: t.spacing[2],
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text
        style={{
          color: t.colors.accent,
          fontSize: t.typography.lg,
          marginRight: t.spacing[1],
          lineHeight: t.typography.lg * 1.2,
        }}
      >
        ‹
      </Text>
      <Text
        style={{
          color: t.colors.accent,
          fontSize: t.typography.sm,
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
