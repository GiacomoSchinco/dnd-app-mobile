import { Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';

type Props = {
  /** Titolo: testo semplice (alternativa a children) */
  text?: string;
  /** Titolo: contenuto libero (alternativa a text) */
  children?: ReactNode;
  /** Contatore inline grigio subito dopo il titolo (es. '(2/5)') */
  count?: string;
  /** Contenuto allineato a destra sulla stessa riga (es. contatore, sigla) */
  right?: ReactNode;
  /** Sottotitolo opzionale sotto il titolo */
  note?: string;
  /** Margine inferiore (default t.spacing[2]) */
  marginBottom?: number;
  /** Margine superiore (default nessuno) */
  marginTop?: number;
  /** Variante grande (font sm + colore foreground) invece dell'uppercase piccolo */
  large?: boolean;
  /** Variante accent (uppercase sm/700 colore accent) — usata dai dettagli del Compendio */
  variant?: 'default' | 'accent';
};

/** Titolo di sezione condiviso: uppercase piccolo di default, variante `large` per i blocchi dei wizard, `accent` per i dettagli del Compendio. */
export default function SectionTitle({
  text,
  children,
  count,
  right,
  note,
  marginBottom,
  marginTop,
  large,
  variant = 'default',
}: Props) {
  const t = useTokens();
  const titleStyle = large
    ? { fontSize: t.typography.sm, fontWeight: '600' as const, color: t.colors.foreground }
    : variant === 'accent'
      ? {
          fontSize: t.typography.sm,
          fontWeight: '700' as const,
          color: t.colors.accent,
          textTransform: 'uppercase' as const,
          letterSpacing: 0.5,
        }
      : {
          fontSize: t.typography.xs,
          fontWeight: '600' as const,
          color: t.colors.foregroundTertiary,
          textTransform: 'uppercase' as const,
          letterSpacing: 0.5,
        };

  const title = (
    <Text style={[titleStyle, right != null ? s.flex : null]}>
      {children ?? text}
      {count ? <Text style={{ color: t.colors.foregroundTertiary }}>{` ${count}`}</Text> : null}
    </Text>
  );

  return (
    <View style={{ marginTop, marginBottom: marginBottom ?? t.spacing[2] }}>
      {right != null ? (
        <View style={[s.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
          {title}
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>{right}</Text>
        </View>
      ) : (
        title
      )}
      {note ? (
        <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: t.spacing[0.5] }}>
          {note}
        </Text>
      ) : null}
    </View>
  );
}
