import { Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Input } from '../../ui/input';
import StepLabel from './StepLabel';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

/** Step 1 — Nome del personaggio */
export default function NameStep({ value, onChange }: Props) {
  const t = useTokens();

  return (
    <View>
      <StepLabel>NOME DEL PERSONAGGIO</StepLabel>
      <Input
        value={value}
        onChangeText={onChange}
        placeholder="Es. Aric Elvendusk"
      />
      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary, marginTop: t.spacing[2] }}>
        Il nome appare sulla Scheda Personaggio e nell'elenco della Home.
      </Text>
    </View>
  );
}
