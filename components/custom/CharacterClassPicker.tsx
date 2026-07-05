import { View, Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { spacing, fontSizes } from '../../utils/styles';

type Props = {
  selected: any;
  onSelect: (cls: any) => void;
};

export default function CharacterClassPicker({ selected, onSelect }: Props) {
  const t = useTokens();
  return (
    <View style={{ padding: spacing[2] }}>
      <Text style={{ fontSize: fontSizes.sm, color: t.colors.foregroundSecondary }}>
        Selettore classe in sviluppo
      </Text>
    </View>
  );
}
