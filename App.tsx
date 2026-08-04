import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrismProvider } from './components/ui/prism-provider';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import RootStack from './components/custom/navigation/RootStack';
import DiceOverlay from './components/custom/DiceOverlay';
import { ROUTES } from './lib/routes';

// Scegli il tema che preferisci:
import theme from './components/ui/themes/default'; // ☀️ Default Apple (chiaro)
//import theme from './components/ui/themes/obsidian'; // 🌑 Obsidian (dark viola)
// import theme from './components/ui/themes/neon';     // 💚 Neon (verde glow)
// import theme from './components/ui/themes/stone';    // 🪨 Stone (marrone caldo)

// Route in cui il dado NON deve comparire (Home = lista PG, Crea PG = form a schermo intero)
const HIDE_DICE_ROUTES = [ROUTES.HOME, ROUTES.CHARACTER_CREATE];

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const [currentRoute, setCurrentRoute] = useState(ROUTES.HOME);

  // Sincronizza la route attiva (funziona anche con i navigatori annidati)
  const onReady = useCallback(() => {
    const sync = () => setCurrentRoute(navigationRef.getCurrentRoute()?.name ?? ROUTES.HOME);
    sync();
    navigationRef.addListener('state', sync);
  }, [navigationRef]);

  const showDice = !HIDE_DICE_ROUTES.includes(currentRoute);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PrismProvider theme={theme}>
          <NavigationContainer ref={navigationRef} onReady={onReady}>
            <View style={{ flex: 1 }}>
              <RootStack />
              <DiceOverlay visible={showDice} />
            </View>
          </NavigationContainer>
        </PrismProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}