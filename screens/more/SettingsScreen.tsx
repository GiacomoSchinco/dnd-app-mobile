import { ScrollView, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useScreenStyles } from '../../utils/styles';
import { useTokens } from '../../components/ui/prism-provider';
import { Button } from '../../components/ui/button';
import ScreenHeader from '../../components/custom/ScreenHeader';
import BackButton from '../../components/custom/BackButton';
import ThemePicker from '../../components/custom/ThemePicker';
import DndIcon from '../../components/custom/DndIcon';

export default function SettingsScreen() {
  const s = useScreenStyles();
  const t = useTokens();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.scrollContent, { flexGrow: 1 }]}>
      <View style={{ width: '100%', alignSelf: 'stretch', flexGrow: 1 }}>
        <BackButton onPress={() => navigation.goBack()} label="Torna alla Home" />
        <ScreenHeader title="Impostazioni" icon="settings-outline" />
        <ThemePicker />

        <Button
          variant="ghost"
          size="lg"
          fullWidth
          style={{ marginTop: 'auto' }}
          icon={<DndIcon name="info" size={18} color={t.colors.accent} />}
          onPress={() => Alert.alert('Info', 'Campaign Chronicle v1.0.0\nCreato con Prism UI')}
        >
          Info app
        </Button>
      </View>
    </ScrollView>
  );
}
