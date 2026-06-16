import { Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';

type Props = {
  title: string;
  subtitle?: string;
};

export default function ScreenHeader({ title, subtitle }: Props) {
  const t = useTokens();

  return (
    <>
      <Text style={{ color: t.colors.foreground, fontSize: 24, fontWeight: '700', marginBottom: subtitle ? 4 : 24 }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ color: t.colors.foregroundSecondary, fontSize: t.typography.sm, marginBottom: 24 }}>
          {subtitle}
        </Text>
      )}
    </>
  );
}
