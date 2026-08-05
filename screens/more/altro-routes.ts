/**
 * Route delle schermate consultive (Impostazioni, Compendio e sottosezioni).
 * Dal 2026-08-05 NON vivono più nello stack della tab Altro: sono pushate sullo
 * stack RADICE (RootStack), raggiungibili SOLO dalla Home e senza storico nel menu.
 * `MENU` resta la schermata iniziale della tab Altro.
 * Separate da ROUTES (le tab) per evitare collisioni di nomi tra navigatori.
 */
export const ALTRO_ROUTES = {
  MENU: 'AltroMenu',
  IMPOSTAZIONI: 'Impostazioni',
  COMPENDIO: 'Compendio',
  COMPENDIO_MAGIE: 'CompendioMagie',
  CLASSI: 'Classi',
  RAZZE: 'Razze',
  BACKGROUND: 'Background',
  TALENTI: 'Talenti',
  EQUIPAGGIAMENTO: 'Equipaggiamento',
  OGGETTI: 'Oggetti',
} as const;

export type AltroRoute = (typeof ALTRO_ROUTES)[keyof typeof ALTRO_ROUTES];
