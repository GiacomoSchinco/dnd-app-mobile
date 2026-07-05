import { View, Text } from 'react-native';
import { useTokens } from '../components/ui/prism-provider';
import Screen from '../components/custom/Screen';
import { fontSizes } from '../utils/styles';

export default function CharactersScreen() {
  const t = useTokens();
  return (
    <Screen scrollable={false}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Text style={{ fontSize: 60 }}>👥</Text>
        <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', textAlign: 'center', color: t.colors.foreground }}>
          Personaggi
        </Text>
        <Text style={{ fontSize: fontSizes.base, textAlign: 'center', color: t.colors.foregroundSecondary }}>
          Gestione personaggi in sviluppo{'\n'}Tornerà con la nuova veste!
        </Text>
      </View>
    </Screen>
  );
}
