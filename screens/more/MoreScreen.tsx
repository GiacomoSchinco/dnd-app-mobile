import { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AltroStackParamList } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import { s } from '../../utils/style-helpers';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';
import BottomModal from '../../components/custom/BottomModal';
import SectionButton from '../../components/custom/SectionButton';
import { Button } from '../../components/ui/button';
import { ROUTES } from '../../lib/routes';
import { useActiveCharacter } from '../../store/useActiveCharacter';

/**
 * Menu della tab "Altro": qui vivono le sezioni di secondo piano / delicate.
 * Impostazioni e Compendio restano raggiungibili dalla Home.
 */
export default function MoreScreen() {
  const t = useTokens();
  const navigation = useNavigation<NativeStackNavigationProp<AltroStackParamList>>();
  const { activeChar, deleteCharacter } = useActiveCharacter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (!activeChar) return;
    deleteCharacter(activeChar.id);
    setConfirmDelete(false);
    // Torna alla Home (lista personaggi) — risale al navigator a tab
    navigation.getParent()?.getParent()?.navigate(ROUTES.HOME);
  };

  return (
    <>
      <Screen>
        <ScreenHeader title="Altro" icon="ellipsis-horizontal-outline" />

        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginBottom: t.spacing[4], alignSelf: 'flex-start' }}>
          Altre funzioni e sezioni di secondo piano
        </Text>

        <View style={[s.fullWidth, s.gap(t.spacing[3])]}>
          <SectionButton
            icon="🗑️"
            label="Elimina personaggio"
            description={activeChar ? activeChar.name : 'Nessun personaggio attivo'}
            danger
            onPress={() => setConfirmDelete(true)}
          />
        </View>
      </Screen>

      {/* Conferma eliminazione — FUORI dallo Screen (ScrollView), come nella Scheda PG */}
      <BottomModal visible={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <Text style={{ fontSize: t.typography.xl, fontWeight: '700', color: t.colors.foreground }}>
          Eliminare &quot;{activeChar?.name}&quot;?
        </Text>
        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[2], marginBottom: t.spacing[4] }}>
          Questa azione è irreversibile: il personaggio e tutti i suoi dati verranno rimossi.
        </Text>
        <View style={[s.row, s.gap(t.spacing[3])]}>
          <Button variant="outline" onPress={() => setConfirmDelete(false)} style={{ flex: 1 }}>Annulla</Button>
          <Button variant="danger" onPress={handleDelete} style={{ flex: 1 }}>Elimina</Button>
        </View>
      </BottomModal>
    </>
  );
}
