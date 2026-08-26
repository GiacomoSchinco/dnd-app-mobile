import { View, Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';
import DndIcon, { type IconName } from './DndIcon';

type Props = {
  /** Icona DndIcon (SVG) mostrata in grande. Opzionale: se assente non viene mostrata. */
  dndIcon?: IconName;
  /** Titolo principale (es. 'Nessun personaggio selezionato') */
  title: string;
  /** Sottotitolo opzionale con istruzioni */
  message?: string;
};

/**
 * Stato vuoto centrato riutilizzabile (icona + titolo + messaggio).
 * Usato quando non c'è un personaggio attivo o una lista è vuota.
 */
export default function EmptyState({ dndIcon, title, message }: Props) {
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
      {dndIcon && <DndIcon name={dndIcon} size={56} color={t.colors.accent} />}
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
