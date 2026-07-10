import { View, Text } from 'react-native';
import { useTokens } from '../components/ui/prism-provider';
import { s } from '../utils/style-helpers';

export default function CharacterDetailScreen({ characterId }: { characterId: string }) {
  const t = useTokens();
  return (
    <View style={[s.flex, s.center, s.p(t.spacing[6]), { backgroundColor: t.colors.background }]}>
      <Text style={{ fontSize: 60, ...s.mb(t.spacing[4]) }}>🔮</Text>
      <Text style={{ fontSize: t.typography.base, color: t.colors.foregroundSecondary, textAlign: 'center' }}>
        Dettaglio personaggio{'\n'}in fase di Creazione
      </Text>
    </View>
  );
}
