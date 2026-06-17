import { View, Text, Image } from 'react-native';
import { useTokens } from '../components/ui/prism-provider';
import { spacing, fontSizes } from '../utils/styles';

export default function HomeScreen() {
  const t = useTokens();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6], backgroundColor: t.colors.background }}>
      <Image source={require('../assets/logo.png')} style={{ width: 140, height: 140, marginBottom: spacing[6] }} resizeMode="contain" />
      <Text style={{ fontSize: fontSizes['3xl'], fontWeight: '800', textAlign: 'center', color: t.colors.foreground }}>
        DungeonCraft
      </Text>
      <Text style={{ fontSize: fontSizes.md, marginTop: spacing[2], textAlign: 'center', color: t.colors.foregroundSecondary }}>
        Il tuo compagno di avventure
      </Text>
    </View>
  );
}
