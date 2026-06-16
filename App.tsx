import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrismProvider } from './components/ui/prism-provider';
import AppNavigator from './components/custom/AppNavigator';

// Scegli il tema che preferisci:
import theme from './components/ui/themes/obsidian'; // 🌑 Obsidian (dark viola)
// import theme from './components/ui/themes/default'; // ☀️ Default Apple (chiaro)
// import theme from './components/ui/themes/neon';     // 💚 Neon (verde glow)
// import theme from './components/ui/themes/stone';    // 🪨 Stone (marrone caldo)

export default function App() {
  return (
    <SafeAreaProvider>
      <PrismProvider theme={theme}>
        <AppNavigator />
      </PrismProvider>
    </SafeAreaProvider>
  );
}