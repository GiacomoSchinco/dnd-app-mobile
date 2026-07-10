import { View, Text } from 'react-native';
import { useTokens } from '../components/ui/prism-provider';
import { s } from '../utils/style-helpers';

export default function SpellAssignmentScreen({ characterId, onBack }: { characterId: string; onBack: () => void }) {
  const t = useTokens();
  return (
    <View style={[s.flex, s.center, s.p(t.spacing[6]), { backgroundColor: t.colors.background }]}>
      <Text style={{ fontSize: 60, ...s.mb(t.spacing[4]) }}>📖</Text>
      <Text style={{ fontSize: t.typography.base, color: t.colors.foregroundSecondary, textAlign: 'center' }}>
        Assegnazione incantesimi{'\n'}in fase di sviluppo
      </Text>
    </View>
  );
}
