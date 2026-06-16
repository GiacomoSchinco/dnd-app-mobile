import { View, Text, Image, StyleSheet } from 'react-native';
import { useTokens } from '../components/ui/prism-provider';

export default function HomeScreen() {
  const t = useTokens();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={[styles.title, { color: t.colors.foreground }]}>
        DungeonCraft
      </Text>
      <Text style={[styles.subtitle, { color: t.colors.foregroundSecondary }]}>
        Il tuo compagno di avventure
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});
