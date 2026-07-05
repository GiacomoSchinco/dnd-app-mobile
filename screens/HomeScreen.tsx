import { View, Text } from 'react-native';
import { useTokens } from '../components/ui/prism-provider';
import { spacing, fontSizes } from '../utils/styles';

export default function HomeScreen() {
  const t = useTokens();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6], backgroundColor: t.colors.background }}>
      <Text style={{ fontSize: 60, marginBottom: spacing[4] }}>🏠</Text>
      <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', textAlign: 'center', color: t.colors.foreground }}>
        Home
      </Text>
      <Text style={{ fontSize: fontSizes.base, marginTop: spacing[2], textAlign: 'center', color: t.colors.foregroundSecondary }}>
        Benvenuto su DungeonCraft
      </Text>
    </View>
  );
}
