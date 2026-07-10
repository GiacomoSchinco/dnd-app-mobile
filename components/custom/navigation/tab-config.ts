import type { ComponentType } from 'react';
import { ROUTES } from '../../../lib/routes';

// Schermate
import HomeScreen from '../../../screens/HomeScreen';
import CharactersScreen from '../../../screens/CharactersScreen';
import CompendioScreen from '../../../screens/CompendioScreen';
import ItemsScreen from '../../../screens/ItemsScreen';
import SpellsScreen from '../../../screens/SpellsScreen';
import MoreScreen from '../../../screens/MoreScreen';
import SettingsScreen from '../../../screens/SettingsScreen';
import CharacterDetailScreen from '../../../screens/CharacterDetailScreen';
import CharacterCreateScreen from '../../../screens/CharacterCreateScreen';

export type NavigationTab = {
  /** Nome della route a cui la tab fa riferimento (usa ROUTES.*) */
  routeName: string;
  /** Testo visualizzato nella tab bar */
  label: string;
  /** Componente della schermata */
  component: ComponentType<any>;
  iconActive: string;
  iconInactive: string;
  /** Nasconde la tab bar quando questa schermata è attiva */
  hideTabBar?: boolean;
  /** Se true, il bottone non viene mostrato nella tab bar (utile per schermate nascoste) */
  hideTabButton?: boolean;
};

export const NAVIGATION_TABS: NavigationTab[] = [
  {
    routeName: ROUTES.HOME,
    label: 'Home',
    component: HomeScreen,
    iconActive: 'home',
    iconInactive: 'home-outline',
    hideTabBar: true,
    hideTabButton: true,
  },
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
    routeName: ROUTES.OGGETTI,
    label: 'Oggetti',
    component: ItemsScreen,
    iconActive: 'cube',
    iconInactive: 'cube-outline',
  },
  {
    routeName: ROUTES.MAGIE,
    label: 'Magie',
    component: SpellsScreen,
    iconActive: 'flash',
    iconInactive: 'flash-outline',
  },
  {
    routeName: ROUTES.ALTRO,
    label: 'Altro',
    component: MoreScreen,
    iconActive: 'ellipsis-horizontal',
    iconInactive: 'ellipsis-horizontal-outline',
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
    routeName: ROUTES.CHARACTER_DETAIL,
    label: 'Dettaglio PG',
    component: CharacterDetailScreen,
    iconActive: 'person',
    iconInactive: 'person-outline',
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
