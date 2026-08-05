import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoreScreen from './MoreScreen';
import { ALTRO_ROUTES } from './altro-routes';

const Stack = createNativeStackNavigator();

/**
 * Stack interno della tab "Altro": ora contiene solo il menu.
 * Impostazioni e Compendio (e sottosezioni) NON vivono più qui: sono pushate
 * sullo stack radice e raggiungibili solo dalla Home.
 */
export default function AltroStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ALTRO_ROUTES.MENU} component={MoreScreen} />
    </Stack.Navigator>
  );
}
