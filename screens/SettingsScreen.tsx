import { ScrollView, View, Alert } from 'react-native';
import { useScreenStyles } from '../utils/styles';
import { Button } from '../components/ui/button';
import ScreenHeader from '../components/custom/ScreenHeader';
import ThemePicker from '../components/custom/ThemePicker';

export default function SettingsScreen() {
  const s = useScreenStyles();

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.scrollContent}>
      <ScreenHeader title="⚙️ Impostazioni" />
      <ThemePicker />
      <Button variant="outline" size="lg" fullWidth onPress={() => Alert.alert('Esporta', 'PDF generato!')}>
        📤 Esporta scheda
      </Button>
      <Button variant="ghost" size="lg" fullWidth onPress={() => Alert.alert('Info', 'DungeonCraft v1.0.0\nCreato con Prism UI 🎨')}>
        ℹ️ Info app
      </Button>
    </ScrollView>
  );
}
