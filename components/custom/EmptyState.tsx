import { View, Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';

type Props = {
  /** Emoji decorativa mostrata in grande (es. 🎯, 🔮) */
  emoji: string;
  /** Titolo principale (es. 'Nessun personaggio selezionato') */
  title: string;
  /** Sottotitolo opzionale con istruzioni */
  message?: string;
};

/**
 * Stato vuoto centrato riutilizzabile (emoji + titolo + messaggio).
 * Usato quando non c'è un personaggio attivo o una lista è vuota.
 */
export default function EmptyState({ emoji, title, message }: Props) {
  const t = useTokens();

  return (
    <View
      style={[
        s.flex,
        s.center,
        s.gap(t.spacing[4]),
        { backgroundColor: t.colors.background, paddingHorizontal: t.spacing[6] },
      ]}
    >
      <Text style={{ fontSize: 60 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: t.typography.lg,
          fontWeight: '600',
          color: t.colors.foreground,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {message && (
        <Text
          style={{
            fontSize: t.typography.base,
            color: t.colors.foregroundSecondary,
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
}
