/**
 * Route dello stack interno della tab "Altro" (menu + sezioni + sottosezioni Compendio).
 * Separate da ROUTES (le tab) per evitare collisioni di nomi tra navigatori.
 */
export const ALTRO_ROUTES = {
  MENU: 'AltroMenu',
  IMPOSTAZIONI: 'Impostazioni',
  COMPENDIO: 'Compendio',
  CLASSI: 'Classi',
  RAZZE: 'Razze',
  BACKGROUND: 'Background',
  TALENTI: 'Talenti',
  EQUIPAGGIAMENTO: 'Equipaggiamento',
  OGGETTI: 'Oggetti',
} as const;

export type AltroRoute = (typeof ALTRO_ROUTES)[keyof typeof ALTRO_ROUTES];
