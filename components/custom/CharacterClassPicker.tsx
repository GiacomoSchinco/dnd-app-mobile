import { View, Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';

type Props = {
  selected: any;
  onSelect: (cls: any) => void;
};

export default function CharacterClassPicker({ selected, onSelect }: Props) {
  const t = useTokens();
  return (
    <View style={s.p(t.spacing[2])}>
      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
        Selettore classe in sviluppo
      </Text>
    </View>
  );
}
