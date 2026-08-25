/**
 * Catalogo centralizzato di tutte le route dell'app.
 * Ogni route ha un nome univoco usato per la navigazione.
 */
export const ROUTES = {
  HOME: 'Home',
  ABILITA: 'Skills',
  MAGIE: 'Spells',
  TALENTI: 'Feats',
  EQUIPAGGIAMENTO: 'Equipment',
  ALTRO: 'More',
  DADI: 'Dice',
  CHARACTER_DETAIL: 'CharacterDetail',
  CHARACTER_CREATE: 'CharacterCreate',
  SPELL_ASSIGN: 'SpellAssign',
  ITEM_ASSIGN: 'ItemAssign',
  NOTES: 'Notes',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
