import { View, Text } from 'react-native';
import { useTokens } from '../../components/ui/prism-provider';
import { s } from '../../utils/style-helpers';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';

/**
 * Menu della tab "Altro": vuoto — Impostazioni e Compendio sono state staccate
 * da qui e sono raggiungibili solo dalla Home.
 */
export default function MoreScreen() {
  const t = useTokens();

  return (
    <Screen>
      <ScreenHeader title="Altro" icon="ellipsis-horizontal-outline" />

      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginBottom: t.spacing[4], alignSelf: 'flex-start' }}>
        Tutte le altre funzioni
      </Text>

      <View style={[s.center, s.gap(t.spacing[4]), s.fullWidth, s.mt(t.spacing[12])]}>
        <Text style={{ fontSize: 48 }}>🧭</Text>
        <Text style={{ fontSize: t.typography.base, color: t.colors.foregroundSecondary, textAlign: 'center' }}>
          Nessuna voce disponibile.{'\n'}Impostazioni e Compendio si raggiungono dalla Home.
        </Text>
      </View>
    </Screen>
  );
}
