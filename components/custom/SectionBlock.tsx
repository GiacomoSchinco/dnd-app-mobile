import { View } from 'react-native';
import type { ReactNode } from 'react';
import SectionTitle from './SectionTitle';

type Props = {
  /** Titolo della sezione (passato a SectionTitle) */
  title?: string;
  /** Contenuto allineato a destra sul titolo (es. contatore) */
  right?: ReactNode;
  /** Sottotitolo sotto il titolo */
  note?: string;
  /** Margine inferiore dell'intera sezione */
  marginBottom?: number;
  /** Margine inferiore passato al SectionTitle (default di SectionTitle) */
  titleMarginBottom?: number;
  /** Variante grande del titolo */
  large?: boolean;
  children: ReactNode;
};

/**
 * Blocco di sezione standard: `View(marginBottom) + SectionTitle + contenuto`.
 * Il pattern "SectionTitle + lista/card" era ripetuto decine di volte nelle
 * schermate — qui incapsulato con margine e titolo.
 */
export default function SectionBlock({
  title,
  right,
  note,
  marginBottom,
  titleMarginBottom,
  large,
  children,
}: Props) {
  return (
    <View style={marginBottom != null ? { marginBottom } : undefined}>
      <SectionTitle
        text={title}
        right={right}
        note={note}
        marginBottom={titleMarginBottom}
        large={large}
      />
      {children}
    </View>
  );
}
