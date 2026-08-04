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
};

/** Indicatore dei passi del wizard (chips cliccabili sui passi già raggiunti) */
export default function StepIndicator({ steps, current, onSelect }: Props) {
  const t = useTokens();
  const currentIndex = steps.findIndex((st) => st.key === current);

  return (
    <View style={[s.row, s.gap(t.spacing[1.5]), s.mb(t.spacing[3])]}>
      {steps.map((st, i) => {
        const isCurrent = st.key === current;
        const reached = i <= currentIndex;
        return (
          <Pressable
            key={st.key}
            disabled={!reached}
            onPress={() => { if (reached) onSelect(st.key); }}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: t.spacing[1.5],
              borderRadius: t.radius.full,
              backgroundColor: isCurrent
                ? t.colors.accent
                : reached
                  ? t.colors.accentSubtle
                  : t.colors.backgroundTertiary,
              opacity: reached ? 1 : 0.5,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontSize: t.typography.xs,
                fontWeight: t.typography.medium,
                color: isCurrent
                  ? t.colors.accentForeground
                  : reached
                    ? t.colors.accent
                    : t.colors.foregroundTertiary,
              }}
            >
              {st.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
