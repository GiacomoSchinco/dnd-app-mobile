import { View, Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { Button } from '../ui/button';
import DndIcon from './DndIcon';
import { s } from '../../utils/style-helpers';

type Props = {
  /** Nasconde la card per questo personaggio (va persistita nello store) */
  onDismiss: () => void;
  /** Apre il modale "Regole da verificare" (strumenti manuali) */
  onOpenTools: () => void;
  /** Margine inferiore (per il posizionamento nella Scheda) */
  marginBottom?: number;
};

/**
 * Banner informativo "Regole da verificare" per la Scheda del personaggio.
 * Visibile solo finché non si preme "Ho capito": dopo, la schermata mostra
 * l'icona info in alto a destra della card del nome (che riapre lo stesso modale,
 * gestito da `ManualToolsModal`).
 */
export default function ManualCheckCard({ onDismiss, onOpenTools, marginBottom }: Props) {
  const t = useTokens();

  return (
    <View
      style={[
        {
          backgroundColor: t.colors.warningSubtle,
          borderWidth: 1,
          borderColor: t.colors.warning,
          borderRadius: t.radius.lg,
          padding: t.spacing[4],
          gap: t.spacing[2],
        },
        marginBottom != null && { marginBottom },
        s.fullWidth,
      ]}
    >
      <View style={[s.row, { gap: t.spacing[3], alignItems: 'center' }]}>
        <View
          style={[
            s.center,
            { width: 40, height: 40, borderRadius: t.radius.md, backgroundColor: t.colors.warning },
          ]}
        >
          <DndIcon name="info" size={22} color={t.colors.accentForeground} />
        </View>
        <Text
          style={{
            fontSize: t.typography.md,
            fontWeight: t.typography.bold,
            color: t.colors.foreground,
            flex: 1,
          }}
        >
          Regole da verificare
        </Text>
      </View>

      <Text
        style={{
          fontSize: t.typography.base,
          color: t.colors.foregroundSecondary,
          lineHeight: 22,
        }}
      >
        Alcune regole non sono automatiche (magie da talenti o sottoclasse, bonus
        particolari). Controlla i manuali, la sezione talenti e regola il personaggio con gli strumenti.
      </Text>

      <View style={[s.row, { gap: t.spacing[2], marginTop: t.spacing[1] }]}>
        <Button size="sm" onPress={onOpenTools} style={{ flex: 1 }}>
          Apri gli strumenti
        </Button>
        <Button size="sm" variant="ghost" onPress={onDismiss}>
          Ho capito
        </Button>
      </View>
    </View>
  );
}
