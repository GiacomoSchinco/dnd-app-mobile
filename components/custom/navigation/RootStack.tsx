import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from '../AppNavigator';
import CharacterCreateScreen from '../../../screens/characters/CharacterCreateScreen';
import SettingsScreen from '../../../screens/more/SettingsScreen';
import CompendioScreen from '../../../screens/compendium/CompendioScreen';
import CompendioMagieScreen from '../../../screens/compendium/CompendioMagieScreen';
import ClassiListScreen from '../../../screens/compendium/ClassiListScreen';
import RazzeListScreen from '../../../screens/compendium/RazzeListScreen';
import BackgroundListScreen from '../../../screens/compendium/BackgroundListScreen';
import TalentiListScreen from '../../../screens/compendium/TalentiListScreen';
import EquipaggiamentoListScreen from '../../../screens/compendium/EquipaggiamentoListScreen';
import OggettiListScreen from '../../../screens/compendium/OggettiListScreen';
import { ROUTES } from '../../../lib/routes';
import { ALTRO_ROUTES } from '../../../screens/more/altro-routes';

const Stack = createNativeStackNavigator();

/**
 * Stack alla radice dell'app:
 *  - "Main" = navigator a tab (tutta l'app)
 *  - schermate di dettaglio (Creazione Personaggio) pushate sopra con back standard
 *  - sezioni consultive (Impostazioni, Compendio e sottosezioni) pushate SOLO dalla
 *    Home — fuori dallo stack della tab Altro, senza storico nel menu.
 */
export default function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={AppNavigator} />
      <Stack.Screen name={ROUTES.CHARACTER_CREATE} component={CharacterCreateScreen} />

      {/* Sezioni consultive: raggiungibili solo dalla Home */}
      <Stack.Screen name={ALTRO_ROUTES.IMPOSTAZIONI} component={SettingsScreen} />
      <Stack.Screen name={ALTRO_ROUTES.COMPENDIO} component={CompendioScreen} />
      <Stack.Screen name={ALTRO_ROUTES.COMPENDIO_MAGIE} component={CompendioMagieScreen} />
      <Stack.Screen name={ALTRO_ROUTES.CLASSI} component={ClassiListScreen} />
      <Stack.Screen name={ALTRO_ROUTES.RAZZE} component={RazzeListScreen} />
      <Stack.Screen name={ALTRO_ROUTES.BACKGROUND} component={BackgroundListScreen} />
      <Stack.Screen name={ALTRO_ROUTES.TALENTI} component={TalentiListScreen} />
      <Stack.Screen name={ALTRO_ROUTES.EQUIPAGGIAMENTO} component={EquipaggiamentoListScreen} />
      <Stack.Screen name={ALTRO_ROUTES.OGGETTI} component={OggettiListScreen} />
    </Stack.Navigator>
  );
}
