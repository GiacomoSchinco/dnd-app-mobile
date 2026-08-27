import { View, Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import BottomModal from './BottomModal';
import { Button } from '../ui/button';
import { s } from '../../utils/style-helpers';

type Props = {
  visible: boolean;
  /** Nome del personaggio mostrato nella domanda di conferma */
  characterName: string;
  onClose: () => void;
  onConfirm: () => void;
};

/**
 * Modale di conferma per l'eliminazione del personaggio.
 * Incapsula il BottomModal + testo fisso + pulsanti Annulla/Elimina
 * (duplicati tra Scheda PG e tab Altro).
 */
export default function ConfirmDeleteCharacterModal({
  visible,
  characterName,
  onClose,
  onConfirm,
}: Props) {
  const t = useTokens();
  return (
    <BottomModal visible={visible} onClose={onClose} showCloseButton>
      <Text style={{ fontSize: t.typography.xl, fontWeight: '700', color: t.colors.foreground }}>
        Eliminare &quot;{characterName}&quot;?
      </Text>
      <Text
        style={{
          fontSize: t.typography.sm,
          color: t.colors.foregroundSecondary,
          marginTop: t.spacing[2],
          marginBottom: t.spacing[4],
        }}
      >
        Questa azione è irreversibile: il personaggio e tutti i suoi dati verranno rimossi.
      </Text>
      <View style={[s.row, s.gap(t.spacing[3])]}>
        <Button variant="outline" onPress={onClose} style={{ flex: 1 }}>
          Annulla
        </Button>
        <Button variant="danger" onPress={onConfirm} style={{ flex: 1 }}>
          Elimina
        </Button>
      </View>
    </BottomModal>
  );
}
