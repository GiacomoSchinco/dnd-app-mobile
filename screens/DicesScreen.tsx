import Screen from '../components/custom/Screen';
import ScreenHeader from '../components/custom/ScreenHeader';
import DiceRoller from '../components/custom/DiceRoller';

type Props = {
  onBack?: () => void;
  backLabel?: string;
};

export default function DicesScreen({ onBack, backLabel }: Props) {
  return (
    <Screen>
      {onBack && <ScreenHeader title="🎲 Lancia dadi" onBack={onBack} backLabel={backLabel} />}
      <DiceRoller initialType="d20" initialQuantity={1} />
    </Screen>
  );
}
