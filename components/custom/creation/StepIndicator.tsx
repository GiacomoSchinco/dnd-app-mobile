import { Pressable, Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { s } from '../../../utils/style-helpers';
import type { StepKey } from './wizardSteps';

export interface WizardStep {
  key: StepKey;
  label: string;
}

type Props = {
  /** Passi attivi (es. "Sottoclasse" solo se il livello la sblocca) */
  steps: WizardStep[];
  current: StepKey;
  onSelect: (key: StepKey) => void;
  /** Verifica se un passo già raggiunto è valido (rosso se da completare) */
  isValid?: (key: StepKey) => boolean;
};

/** Indicatore dei passi del wizard (chips cliccabili sui passi già raggiunti) */
export default function StepIndicator({ steps, current, onSelect, isValid }: Props) {
  const t = useTokens();
  const currentIndex = steps.findIndex((st) => st.key === current);

  return (
    <View style={[s.row, s.gap(t.spacing[1.5]), s.mb(t.spacing[3])]}>
      {steps.map((st, i) => {
        const isCurrent = st.key === current;
        const reached = i <= currentIndex;
        const incomplete = reached && !isCurrent && isValid != null && !isValid(st.key);
        const locked = !reached;
        return (
          <Pressable
            key={st.key}
            disabled={locked}
            onPress={() => { if (!locked) onSelect(st.key); }}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: t.spacing[1.5],
              borderRadius: t.radius.full,
              backgroundColor: isCurrent
                ? t.colors.accent
                : incomplete
                  ? t.colors.danger + '18'
                  : reached
                    ? t.colors.accentSubtle
                    : t.colors.backgroundTertiary,
              opacity: locked ? 0.5 : 1,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontSize: t.typography.xs,
                fontWeight: t.typography.medium,
                color: isCurrent
                  ? t.colors.accentForeground
                  : incomplete
                    ? t.colors.danger
                    : reached
                      ? t.colors.accent
                      : t.colors.foregroundTertiary,
              }}
            >
              {incomplete ? `${st.label} •` : st.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
