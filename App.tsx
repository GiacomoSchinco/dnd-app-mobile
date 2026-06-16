import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { PrismProvider } from './components/ui/prism-provider';
import { Button } from './components/ui/button';

export default function App() {
  return (
    <PrismProvider>
      <View style={styles.container}>
        <Button variant="solid" size="lg" onPress={() => alert('Ciao!')}>
          Premi qui
        </Button>
        <StatusBar style="auto" />
      </View>
    </PrismProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 5,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
