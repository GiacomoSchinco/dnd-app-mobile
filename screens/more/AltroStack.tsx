import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoreScreen from './MoreScreen';
import CharacterEditorScreen from './CharacterEditorScreen';
import { ALTRO_ROUTES } from './altro-routes';

const Stack = createNativeStackNavigator();

/**
 * Stack interno della tab "Altro": menu + editor di correzione del PG attivo.
 * Impostazioni e Compendio (e sottosezioni) NON vivono più qui: sono pushate
 * sullo stack radice e raggiungibili solo dalla Home.
 */
export default function AltroStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ALTRO_ROUTES.MENU} component={MoreScreen} />
      <Stack.Screen name={ALTRO_ROUTES.MODIFICA_PG} component={CharacterEditorScreen} />
    </Stack.Navigator>
  );
}
