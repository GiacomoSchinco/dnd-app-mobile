import type { ComponentType } from 'react';
import { ROUTES } from '../../../lib/routes';

// Schermate
import HomeScreen from '../../../screens/home/HomeScreen';
import SkillsScreen from '../../../screens/characters/SkillsScreen';
import SpellsScreen from '../../../screens/compendium/SpellsScreen';
import AltroStack from '../../../screens/more/AltroStack';
import CharacterDetailScreen from '../../../screens/characters/CharacterDetailScreen';

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
    hideTabBar: false,
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

  // ── ABILITÀ (sostituisce la tab Oggetti) ──
  {
    routeName: ROUTES.ABILITA,
    label: 'Abilità',
    component: SkillsScreen,
    iconActive: 'bulb',
    iconInactive: 'bulb-outline',
    show: 'always',
  },

  // ── ALTRO ──
  {
    routeName: ROUTES.ALTRO,
    label: 'Altro',
    component: AltroStack,
    iconActive: 'ellipsis-horizontal',
    iconInactive: 'ellipsis-horizontal-outline',
    show: 'always',
  },
];
