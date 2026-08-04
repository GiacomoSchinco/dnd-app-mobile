import { Text } from 'react-native';
import { type ReactNode } from 'react';
import { useTokens } from '../../ui/prism-provider';

type Props = { children: ReactNode };

/** Etichetta di sezione standard per gli step del wizard */
export default function StepLabel({ children }: Props) {
  const t = useTokens();
  return (
    <Text
      style={{
        fontSize: t.typography.sm,
        fontWeight: t.typography.semibold,
        color: t.colors.foregroundSecondary,
        marginBottom: t.spacing[1.5],
      }}
    >
      {children}
    </Text>
  );
}
