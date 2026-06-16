import { Alert } from 'react-native';
import { Button } from '../ui/button';

type Props = {
  name: string;
  sides: number;
};

export default function DiceButton({ name, sides }: Props) {
  return (
    <Button
      variant="solid"
      size="lg"
      onPress={() => {
        const result = Math.floor(Math.random() * sides) + 1;
        Alert.alert(`🎲 ${name}`, `Risultato: ${result}`);
      }}
    >
      {name}
    </Button>
  );
}
