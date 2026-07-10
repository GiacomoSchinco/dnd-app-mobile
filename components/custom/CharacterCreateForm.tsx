import { View, Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';

type Props = {
  onCreate: (name: string, className: any, level: number) => void;
  onCancel: () => void;
};

export default function CharacterCreateForm({ onCreate, onCancel }: Props) {
  const t = useTokens();

  return (
    <View style={[s.p(t.spacing[4]), s.center]}>
      <Text style={{ fontSize: t.typography.base, color: t.colors.foregroundSecondary, textAlign: 'center' }}>
        Creazione personaggio in sviluppo{'\n'}Tornerà con la nuova veste!
      </Text>
    </View>
  );
}
