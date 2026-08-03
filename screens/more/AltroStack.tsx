import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoreScreen from './MoreScreen';
import SettingsScreen from './SettingsScreen';
import CompendioScreen from '../compendium/CompendioScreen';
import ClassiListScreen from '../compendium/ClassiListScreen';
import RazzeListScreen from '../compendium/RazzeListScreen';
import BackgroundListScreen from '../compendium/BackgroundListScreen';
import TalentiListScreen from '../compendium/TalentiListScreen';
import EquipaggiamentoListScreen from '../compendium/EquipaggiamentoListScreen';
import OggettiListScreen from '../compendium/OggettiListScreen';
import { ALTRO_ROUTES } from './altro-routes';

const Stack = createNativeStackNavigator();

/**
 * Stack interno della tab "Altro": menu + sezioni (Impostazioni, Compendio)
 * e sottosezioni del Compendio. Ogni voce è una schermata reale dello stack,
 * quindi il tasto indietro (hardware/gesture iOS) torna naturalmente nella history.
 */
export default function AltroStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ALTRO_ROUTES.MENU} component={MoreScreen} />
      <Stack.Screen name={ALTRO_ROUTES.IMPOSTAZIONI} component={SettingsScreen} />
      <Stack.Screen name={ALTRO_ROUTES.COMPENDIO} component={CompendioScreen} />
      <Stack.Screen name={ALTRO_ROUTES.CLASSI} component={ClassiListScreen} />
      <Stack.Screen name={ALTRO_ROUTES.RAZZE} component={RazzeListScreen} />
      <Stack.Screen name={ALTRO_ROUTES.BACKGROUND} component={BackgroundListScreen} />
      <Stack.Screen name={ALTRO_ROUTES.TALENTI} component={TalentiListScreen} />
      <Stack.Screen name={ALTRO_ROUTES.EQUIPAGGIAMENTO} component={EquipaggiamentoListScreen} />
      <Stack.Screen name={ALTRO_ROUTES.OGGETTI} component={OggettiListScreen} />
    </Stack.Navigator>
  );
}
