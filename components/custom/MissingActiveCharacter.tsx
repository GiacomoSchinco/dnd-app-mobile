import EmptyState from './EmptyState';
import type { IconName } from './DndIcon';

type Props = {
  /** Icona DndIcon (SVG) mostrata in grande (default: personaggio invisibile) */
  dndIcon?: IconName;
  /** Sottotitolo con le istruzioni (dipende dalla schermata) */
  message?: string;
};

/**
 * Stato vuoto standard quando non c'è un personaggio attivo.
 * Ogni schermata legata al PG ripeteva lo stesso blocco "Nessun
 * personaggio selezionato" — qui centralizzato (titolo fisso).
 */
export default function MissingActiveCharacter({
  dndIcon = 'invisible',
  message = 'Apri un personaggio dalla Home per gestire la sua scheda.',
}: Props) {
  return (
    <EmptyState dndIcon={dndIcon} title="Nessun personaggio selezionato" message={message} />
  );
}
