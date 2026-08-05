import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import ItemsScreen from './ItemsScreen';

/** Voce "Oggetti" del Compendio: riusa ItemsScreen con il pulsante indietro */
export default function OggettiListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return <ItemsScreen onBack={() => navigation.goBack()} />;
}
