import type { ComponentType } from 'react';
import { ROUTES } from '../../../lib/routes';

// Schermate
import HomeScreen from '../../../screens/home/HomeScreen';
import CharactersScreen from '../../../screens/characters/CharactersScreen';
import CompendioScreen from '../../../screens/compendium/CompendioScreen';
import ItemsScreen from '../../../screens/compendium/ItemsScreen';
import SpellsScreen from '../../../screens/compendium/SpellsScreen';
import MoreScreen from '../../../screens/more/MoreScreen';
import SettingsScreen from '../../../screens/more/SettingsScreen';
import CharacterDetailScreen from '../../../screens/characters/CharacterDetailScreen';
import CharacterCreateScreen from '../../../screens/characters/CharacterCreateScreen';

export type NavigationTab = {
  /** Nome della route a cui la tab fa riferimento (usa ROUTES.*) */
  routeName: string;
  /** Testo visualizzato nella tab bar */
  label: string;
  /** Componente della schermata */
  component: ComponentType<any>;
  iconActive: string;
  iconInactive: string;
  /** Quando mostrare il pulsante: 'always', 'noCharacter', 'withCharacter' */
  show?: 'always' | 'noCharacter' | 'withCharacter';
  /** Nasconde la tab bar quando questa schermata è attiva */
  hideTabBar?: boolean;
  /** Se true, il bottone non viene mostrato nella tab bar */
  hideTabButton?: boolean;
};

/**
 * Tutte le tab dell'app. Ogni tab ha un gruppo di visibilità:
 * - `show: 'always'` → sempre visibile (es. Altro, Dadi)
 * - `show: 'noCharacter'` → visibile solo senza PG attivo (es. Home)
 * - `show: 'withCharacter'` → visibile solo con PG attivo (es. Scheda PG)
 * - `hideTabButton: true` → sempre nascosta (schermate interne)
 */
export const NAVIGATION_TABS: NavigationTab[] = [
  // ── HOME ──
  {
    routeName: ROUTES.HOME,
    label: 'Home',
    component: HomeScreen,
    iconActive: 'home',
    iconInactive: 'home-outline',
    hideTabBar: true,
    hideTabButton: true,
  },

  // ── SCHEDA PG (sostituisce Home nella tab bar quando PG attivo) ──
  {
    routeName: ROUTES.CHARACTER_DETAIL,
    label: 'Scheda',
    component: CharacterDetailScreen,
    iconActive: 'person',
    iconInactive: 'person-outline',
    show: 'withCharacter',
  },

  // ── MAGIE ──
  {
    routeName: ROUTES.MAGIE,
    label: 'Magie',
    component: SpellsScreen,
    iconActive: 'flash',
    iconInactive: 'flash-outline',
    show: 'always',
  },

  // ── OGGETTI ──
  {
    routeName: ROUTES.OGGETTI,
    label: 'Oggetti',
    component: ItemsScreen,
    iconActive: 'cube',
    iconInactive: 'cube-outline',
    show: 'always',
  },

  // ── ALTRO ──
  {
    routeName: ROUTES.ALTRO,
    label: 'Altro',
    component: MoreScreen,
    iconActive: 'ellipsis-horizontal',
    iconInactive: 'ellipsis-horizontal-outline',
    show: 'always',
  },

  // ── SCHERMATE NASCOSTE ──
  {
    routeName: ROUTES.PERSONAGGI,
    label: 'Personaggi',
    component: CharactersScreen,
    iconActive: 'people',
    iconInactive: 'people-outline',
    hideTabBar: true,
    hideTabButton: true,
  },
  {
    routeName: ROUTES.COMPENDIO,
    label: 'Compendio',
    component: CompendioScreen,
    iconActive: 'book',
    iconInactive: 'book-outline',
    hideTabBar: true,
    hideTabButton: true,
  },
  {
    routeName: ROUTES.IMPOSTAZIONI,
    label: 'Impostazioni',
    component: SettingsScreen,
    iconActive: 'settings',
    iconInactive: 'settings-outline',
    hideTabBar: true,
    hideTabButton: true,
  },
  {
    routeName: ROUTES.CHARACTER_CREATE,
    label: 'Crea PG',
    component: CharacterCreateScreen,
    iconActive: 'person-add',
    iconInactive: 'person-add-outline',
    hideTabBar: true,
    hideTabButton: true,
  },
];
