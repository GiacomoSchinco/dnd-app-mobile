import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from '../AppNavigator';
import CharacterCreateScreen from '../../../screens/characters/CharacterCreateScreen';
import { ROUTES } from '../../../lib/routes';

const Stack = createNativeStackNavigator();

/**
 * Stack alla radice dell'app:
 *  - "Main" = navigator a tab (tutta l'app)
 *  - schermate di dettaglio (es. Creazione Personaggio) vengono "pushate" sopra
 *    con back standard (goBack / pop) — niente più tab nascoste per i dettagli.
 */
export default function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={AppNavigator} />
      <Stack.Screen name={ROUTES.CHARACTER_CREATE} component={CharacterCreateScreen} />
    </Stack.Navigator>
  );
}
