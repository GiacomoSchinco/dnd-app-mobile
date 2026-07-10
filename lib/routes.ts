/**
 * Catalogo centralizzato di tutte le route dell'app.
 * Ogni route ha un nome univoco usato per la navigazione.
 */
export const ROUTES = {
  HOME: 'Home',
  PERSONAGGI: 'Personaggi',
  COMPENDIO: 'Compendio',
  OGGETTI: 'Oggetti',
  MAGIE: 'Magie',
  ALTRO: 'Altro',
  DADI: 'Dadi',
  CHARACTER_DETAIL: 'CharacterDetail',
  CHARACTER_CREATE: 'CharacterCreate',
  SPELL_ASSIGNMENT: 'SpellAssignment',
  IMPOSTAZIONI: 'Impostazioni',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
