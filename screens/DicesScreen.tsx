import { View, Text, StyleSheet } from 'react-native';
import { useTokens } from '../components/ui/prism-provider';
import ScreenHeader from '../components/custom/ScreenHeader';
import DiceButton from '../components/custom/DiceButton';

export default function DicesScreen() {
  const t = useTokens();

  return (
    <View style={styles.diceContainer}>
      <ScreenHeader title="🎲 Lancia i dadi" />
      <View style={styles.diceGrid}>
        {[
          { name: 'd4', sides: 4 },
          { name: 'd6', sides: 6 },
          { name: 'd8', sides: 8 },
          { name: 'd10', sides: 10 },
          { name: 'd12', sides: 12 },
          { name: 'd20', sides: 20 },
        ].map((d) => (
          <DiceButton key={d.name} name={d.name} sides={d.sides} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  diceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  diceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 300,
  },
});
