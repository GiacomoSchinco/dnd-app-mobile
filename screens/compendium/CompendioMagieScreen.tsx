import SpellsScreen from './SpellsScreen';

/**
 * Voce "Incantesimi" del Compendio: elenco magie STANDALONE.
 * Staccato dal PG come tutte le altre sezioni del Compendio:
 * niente CharacterBar, niente filtro classe bloccato, niente toggle.
 */
export default function CompendioMagieScreen() {
  return <SpellsScreen standalone />;
}
