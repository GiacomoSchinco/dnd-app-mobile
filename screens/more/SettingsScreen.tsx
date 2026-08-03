import { ScrollView, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useScreenStyles } from '../../utils/styles';
import { Button } from '../../components/ui/button';
import ScreenHeader from '../../components/custom/ScreenHeader';
import BackButton from '../../components/custom/BackButton';
import ThemePicker from '../../components/custom/ThemePicker';

export default function SettingsScreen() {
  const s = useScreenStyles();
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.scrollContent, { flexGrow: 1 }]}>
      <View style={{ width: '100%', alignSelf: 'stretch', flexGrow: 1 }}>
        <BackButton onPress={() => navigation.goBack()} label="Torna al menu" />
        <ScreenHeader title="Impostazioni" icon="settings-outline" />
        <ThemePicker />

        <Button variant="ghost" size="lg" fullWidth style={{ marginTop: 'auto' }} onPress={() => Alert.alert('Info', 'DungeonCraft v1.0.0\nCreato con Prism UI 🎨')}>
          ℹ️ Info app
        </Button>
      </View>
    </ScrollView>
  );
}
