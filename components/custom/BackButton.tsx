import { View, Text, Pressable } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { spacing, fontSizes } from '../../utils/styles';

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
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: spacing[2],
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text
        style={{
          color: t.colors.accent,
          fontSize: fontSizes.lg,
          marginRight: spacing[1],
          lineHeight: fontSizes.lg * 1.2,
        }}
      >
        ‹
      </Text>
      <Text
        style={{
          color: t.colors.accent,
          fontSize: fontSizes.sm,
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
