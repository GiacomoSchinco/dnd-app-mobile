import { View, Text } from 'react-native';
import { useTokens } from '../components/ui/prism-provider';
import { spacing, fontSizes } from '../utils/styles';

export default function CharacterDetailScreen({ characterId }: { characterId: string }) {
  const t = useTokens();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6], backgroundColor: t.colors.background }}>
      <Text style={{ fontSize: 60, marginBottom: spacing[4] }}>🔮</Text>
      <Text style={{ fontSize: fontSizes.base, color: t.colors.foregroundSecondary, textAlign: 'center' }}>
        Dettaglio personaggio{'\n'}in fase di重构
      </Text>
    </View>
  );
}
