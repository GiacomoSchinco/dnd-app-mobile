import { ScrollView, View, Text, Alert } from 'react-native';
import { useTokens } from '../components/ui/prism-provider';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import ScreenHeader from '../components/custom/ScreenHeader';
import ThemePicker from '../components/custom/ThemePicker';

export default function SettingsScreen() {
  const t = useTokens();

  return (
    <ScrollView style={{ flex: 1, padding: 24 }} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="⚙️ Impostazioni" />
      <View style={{ gap: 16 }}>
        <ThemePicker />
        <Button variant="outline" size="lg" fullWidth onPress={() => Alert.alert('Esporta', 'PDF generato!')}>
          📤 Esporta scheda
        </Button>
        <Button variant="ghost" size="lg" fullWidth onPress={() => Alert.alert('Info', 'DungeonCraft v1.0.0\nCreato con Prism UI 🎨')}>
          ℹ️ Info app
        </Button>
      </View>
    </ScrollView>
  );
}
