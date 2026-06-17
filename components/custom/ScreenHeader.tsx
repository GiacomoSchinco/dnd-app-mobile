import { Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { spacing, fontSizes } from '../../utils/styles';

type Props = {
  title: string;
  subtitle?: string;
};

export default function ScreenHeader({ title, subtitle }: Props) {
  const t = useTokens();

  return (
    <>
      <Text
        style={{
          color: t.colors.foreground,
          fontSize: fontSizes.xl,
          fontWeight: '700',
          marginBottom: subtitle ? spacing[1] : spacing[6],
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            color: t.colors.foregroundSecondary,
            fontSize: fontSizes.sm,
            marginBottom: spacing[6],
          }}
        >
          {subtitle}
        </Text>
      )}
    </>
  );
}
