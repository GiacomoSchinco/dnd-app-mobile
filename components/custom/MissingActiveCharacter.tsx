import EmptyState from './EmptyState';

type Props = {
  /** Emoji decorativa (default 🔮) */
  emoji?: string;
  /** Sottotitolo con le istruzioni (dipende dalla schermata) */
  message?: string;
};

/**
 * Stato vuoto standard quando non c'è un personaggio attivo.
 * Ogni schermata legata al PG ripeteva lo stesso blocco "Nessun
 * personaggio selezionato" — qui centralizzato (titolo fisso).
 */
export default function MissingActiveCharacter({
  emoji = '🔮',
  message = 'Apri un personaggio dalla Home per gestire la sua scheda.',
}: Props) {
  return (
    <EmptyState emoji={emoji} title="Nessun personaggio selezionato" message={message} />
  );
}
