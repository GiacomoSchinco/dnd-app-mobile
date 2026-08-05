/**
 * Catalogo centralizzato di tutte le route dell'app.
 * Ogni route ha un nome univoco usato per la navigazione.
 */
export const ROUTES = {
  HOME: 'Home',
  ABILITA: 'Abilita',
  MAGIE: 'Magie',
  ALTRO: 'Altro',
  DADI: 'Dadi',
  CHARACTER_DETAIL: 'CharacterDetail',
  CHARACTER_CREATE: 'CharacterCreate',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
