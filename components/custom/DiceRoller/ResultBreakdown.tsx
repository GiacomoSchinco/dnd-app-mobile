import { View, Text, StyleSheet } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { s } from '../../../utils/style-helpers';
import { spacing, radius, fontSizes } from '../../../utils/styles';
import type { RollResult } from '../../../types';
import { formatRollNotation } from '../../../utils/dice';

type Props = {
  result: RollResult;
  selectedColor: string;
};

export default function ResultBreakdown({ result, selectedColor }: Props) {
  const t = useTokens();

  return (
    <View style={styles.container}>
      <Text style={[styles.notation, { color: t.colors.foregroundSecondary }]}>
        {formatRollNotation(result.request)}
      </Text>

      {/* Individual dice chips */}
      <View style={styles.chipsRow}>
        {result.rolls.map((value, i) => (
          <View
            key={i}
            style={[
              styles.chip,
              {
                backgroundColor: selectedColor + '20',
                borderColor: selectedColor,
              },
            ]}
          >
            <Text style={[styles.chipValue, { color: selectedColor }]}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Total */}
      <View style={[s.row, s.gap(t.spacing[2]), { alignItems: 'baseline' }]}>
        <Text style={{ fontSize: t.typography['2xl'], fontWeight: '800', color: t.colors.foreground }}>
          {result.total}
        </Text>
        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary }}>
          = {result.rolls.join(' + ')}
          {result.modifier !== 0 && (result.modifier > 0 ? ` + ${result.modifier}` : ` - ${Math.abs(result.modifier)}`)}
        </Text>
      </View>

      {/* Modifier */}
      {result.modifier !== 0 && (
        <Text style={[styles.modifier, { color: t.colors.foregroundTertiary }]}>
          {result.modifier > 0
            ? `+${result.modifier} (modificatore)`
            : `${result.modifier} (modificatore)`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing[2],
  },
  notation: {
    fontSize: fontSizes.base,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[2],
  },
  chip: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipValue: {
    fontSize: fontSizes.md,
    fontWeight: '800',
  },
  modifier: {
    fontSize: fontSizes.sm,
    fontStyle: 'italic',
  },
});
