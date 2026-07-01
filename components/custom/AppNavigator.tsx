import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../ui/prism-provider';
import Tabs from '../ui/tabs';
import HomeScreen from '../../screens/HomeScreen';
import SpellsScreen from '../../screens/SpellsScreen';
import CharactersScreen from '../../screens/CharactersScreen';
import MoreScreen from '../../screens/MoreScreen';

export default function AppNavigator() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const isDark = t.colors.background.startsWith('#0');

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background, paddingTop: insets.top , paddingBottom: insets.bottom }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tabs
        position="bottom"
        tabs={[
          { label: '🏠 Home', content: <HomeScreen /> },
          { label: '👤 PG', content: <CharactersScreen /> },
          { label: '✨ Magie', content: <SpellsScreen /> },
          { label: '☰ Altro', content: <MoreScreen /> },
        ]}
      />
    </View>
  );
}
