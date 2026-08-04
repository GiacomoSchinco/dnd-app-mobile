import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { getProficiencyBonus } from '../../../lib/rules/progression';
import { s } from '../../../utils/style-helpers';
import StepLabel from './StepLabel';

type Props = {
  level: number;
  onLevelChange: (level: number) => void;
  hitDie?: number;
  levelFeatures: string[];
};

/** Step 3 — Livello (1–20) */
export default function LevelStep({ level, onLevelChange, hitDie, levelFeatures }: Props) {
  const t = useTokens();

  return (
    <View style={[s.gap(t.spacing[4])]}>
      <StepLabel>LIVELLO</StepLabel>

      {/* Selettore livello 1–20 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[s.row, s.gap(t.spacing[1.5])]}>
          {Array.from({ length: 20 }, (_, i) => i + 1).map((lv) => {
            const sel = lv === level;
            return (
              <Pressable
                key={lv}
                onPress={() => onLevelChange(lv)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: t.radius.md,
                  borderWidth: 1,
                  borderColor: sel ? t.colors.accent : t.colors.border,
                  backgroundColor: sel ? t.colors.accent : t.colors.card,
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
        <View style={[s.row, s.gap(t.spacing[2])]}>
          <Badge variant="solid" size="sm">Livello {level}</Badge>
          <Badge variant="subtle" size="sm">PB +{getProficiencyBonus(level)}</Badge>
          {hitDie != null && <Badge variant="subtle" size="sm">Dado vita d{hitDie}</Badge>}
        </View>
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
