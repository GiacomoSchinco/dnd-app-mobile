import Screen from '../components/custom/Screen';
import ScreenHeader from '../components/custom/ScreenHeader';
import DiceRoller from '../components/custom/DiceRoller';

export default function DicesScreen() {
  return (
    <Screen>
      <ScreenHeader title="🎲 Lancia i dadi" />
      <DiceRoller initialType="d20" initialQuantity={1} />
    </Screen>
  );
}
