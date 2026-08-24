import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { getProficiencyBonus } from '../../../lib/rules/progression';
import { s } from '../../../utils/style-helpers';
import StepLabel from './StepLabel';
import ClassSwitcher from './ClassSwitcher';
import type { ClassName } from '../../../types';

type Props = {
  level: number;
  onLevelChange: (level: number) => void;
  hitDie?: number;
  levelFeatures: string[];
  // Multiclasse
  classNameLabel: string;
  totalLevel: number;
  /** Livello massimo consentito per la classe attiva (il totale resta ≤ 20) */
  maxLevel: number;
  /** Switcher classe attiva (multiclasse) */
  classList: { className: ClassName; level: number }[];
  activeIndex: number;
  onSelectActive: (i: number) => void;
};

/** Step 3 — Livello della classe attiva (1–20) */
export default function LevelStep({
  level,
  onLevelChange,
  hitDie,
  levelFeatures,
  classNameLabel,
  totalLevel,
  maxLevel,
  classList,
  activeIndex,
  onSelectActive,
}: Props) {
  const t = useTokens();

  return (
    <View style={[s.gap(t.spacing[4])]}>
      {/* Switcher classe attiva (multiclasse): cambia QUALe classe stai livellando */}
      <ClassSwitcher classList={classList} activeIndex={activeIndex} onSelectActive={onSelectActive} />

      <StepLabel>LIVELLO — {classNameLabel.toUpperCase()}</StepLabel>

      {/* Selettore livello 1–20 (oltre il tetto del totale resta disabilitato) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[s.row, s.gap(t.spacing[1.5])]}>
          {Array.from({ length: 20 }, (_, i) => i + 1).map((lv) => {
            const sel = lv === level;
            const disabled = lv > maxLevel;
            return (
              <Pressable
                key={lv}
                onPress={() => onLevelChange(lv)}
                disabled={disabled}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: t.radius.md,
                  borderWidth: 1,
                  borderColor: sel ? t.colors.accent : t.colors.border,
                  backgroundColor: sel ? t.colors.accent : t.colors.card,
                  opacity: disabled ? 0.3 : 1,
                  ...s.center,
                }}
              >
                <Text style={{ fontSize: t.typography.md, fontWeight: t.typography.semibold, color: sel ? t.colors.accentForeground : t.colors.foreground }}>
                  {lv}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Riepilogo del livello */}
      <Card variant="elevated">
        <View style={[s.row, s.gap(t.spacing[2]), { flexWrap: 'wrap' }]}>
          <Badge variant="solid" size="sm">{classNameLabel} {level}°</Badge>
          <Badge variant="subtle" size="sm">Totale {totalLevel}°</Badge>
          <Badge variant="subtle" size="sm">PB +{getProficiencyBonus(totalLevel)}</Badge>
          {hitDie != null && <Badge variant="subtle" size="sm">Dado vita d{hitDie}</Badge>}
        </View>
        {maxLevel < 20 && (
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: t.spacing[2] }}>
            Livello massimo di questa classe: {maxLevel} (il totale del personaggio non può superare 20).
          </Text>
        )}
        <View style={{ marginTop: t.spacing[3] }}>
          <Text style={{ fontSize: t.typography.sm, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
            Nuove caratteristiche
          </Text>
          {levelFeatures.length > 0 ? (
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[1] }}>
              {levelFeatures.join(', ')}
            </Text>
          ) : (
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary, marginTop: t.spacing[1] }}>
              Nessuna nuova caratteristica a questo livello.
            </Text>
          )}
        </View>
      </Card>
    </View>
  );
}
