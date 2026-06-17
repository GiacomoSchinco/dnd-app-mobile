import { ScrollView } from 'react-native';
import { useScreenStyles } from '../utils/styles';
import ScreenHeader from '../components/custom/ScreenHeader';
import DiceRoller from '../components/custom/DiceRoller';

export default function DicesScreen() {
  const s = useScreenStyles();

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.scrollContent}>
      <ScreenHeader title="🎲 Lancia i dadi" />
      <DiceRoller initialType="d20" initialQuantity={1} />
    </ScrollView>
  );
}
