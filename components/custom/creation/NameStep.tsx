import { Text, TextInput, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
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
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Es. Aric Elvendusk"
        placeholderTextColor={t.colors.placeholder}
        style={{
          backgroundColor: t.colors.input,
          borderWidth: 1,
          borderColor: t.colors.inputBorder,
          borderRadius: t.radius.md,
          paddingHorizontal: t.spacing[3],
          paddingVertical: t.spacing[2.5],
          fontSize: t.typography.md,
          color: t.colors.foreground,
        }}
      />
      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary, marginTop: t.spacing[2] }}>
        Il nome appare sulla Scheda Personaggio e nell'elenco della Home.
      </Text>
    </View>
  );
}
