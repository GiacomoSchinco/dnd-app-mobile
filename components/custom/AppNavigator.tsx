import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../ui/prism-provider';
import Tabs from '../ui/tabs';
import HomeScreen from '../../screens/HomeScreen';
import DicesScreen from '../../screens/DicesScreen';
import SettingsScreen from '../../screens/SettingsScreen';

export default function AppNavigator() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const isDark = t.colors.background.startsWith('#0');

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background, paddingTop: insets.top }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tabs
        tabs={[
          { label: '🏠 Home', content: <HomeScreen /> },
          { label: '🎲 Dadi', content: <DicesScreen /> },
          { label: '⚙️', content: <SettingsScreen /> },
        ]}
      />
    </View>
  );
}
