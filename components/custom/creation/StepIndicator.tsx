import { Pressable, ScrollView, Text, View } from 'react-native';
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

/**
 * Indicatore dei passi del wizard (mobile-friendly):
 * - Riga "Passo N di M" + etichetta corrente (leggibile anche su schermi stretti).
 * - Barra di avanzamento.
 * - Pills numerate (1..N) scorrevoli per saltare ai passi già raggiunti;
 *   quelle raggiunte ma incomplete sono evidenziate in rosso.
 */
export default function StepIndicator({ steps, current, onSelect, isValid }: Props) {
  const t = useTokens();
  const currentIndex = steps.findIndex((st) => st.key === current);
  const total = steps.length;
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  return (
    <View style={[s.gap(t.spacing[2]), s.mb(t.spacing[3])]}>
      {/* Pager: "Passo N di M" + etichetta corrente */}
      <View style={[s.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.foregroundTertiary }}>
          Passo {currentIndex + 1} di {total}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontSize: t.typography.xs,
            fontWeight: t.typography.semibold,
            color: t.colors.foregroundSecondary,
            flexShrink: 1,
            marginLeft: t.spacing[2],
          }}
        >
          {steps[currentIndex]?.label ?? ''}
        </Text>
      </View>

      {/* Barra di avanzamento */}
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: t.colors.backgroundTertiary,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${progress}%` as `${number}%`,
            height: '100%',
            backgroundColor: t.colors.accent,
            borderRadius: 3,
          }}
        />
      </View>

      {/* Pills numerate per saltare ai passi raggiunti (orizzontali, compatte) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.gap(t.spacing[1.5])}>
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
              accessibilityRole="button"
              accessibilityState={{ selected: isCurrent, disabled: locked }}
              accessibilityLabel={`Passo ${i + 1}: ${st.label}`}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: isCurrent ? t.colors.accent : t.colors.border,
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
                style={{
                  fontSize: t.typography.xs,
                  fontWeight: t.typography.semibold,
                  color: isCurrent
                    ? t.colors.accentForeground
                    : incomplete
                      ? t.colors.danger
                      : reached
                        ? t.colors.accent
                        : t.colors.foregroundTertiary,
                }}
              >
                {i + 1}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
