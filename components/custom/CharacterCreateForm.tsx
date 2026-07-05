import { View, Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { spacing, fontSizes } from '../../utils/styles';

type Props = {
  onCreate: (name: string, className: any, level: number) => void;
  onCancel: () => void;
};

export default function CharacterCreateForm({ onCreate, onCancel }: Props) {
  const t = useTokens();

  return (
    <View style={{ padding: spacing[4], alignItems: 'center' }}>
      <Text style={{ fontSize: fontSizes.base, color: t.colors.foregroundSecondary, textAlign: 'center' }}>
        Creazione personaggio in sviluppo{'\n'}Tornerà con la nuova veste!
      </Text>
    </View>
  );
}
