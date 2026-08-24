import type { ComponentType, ComponentProps } from 'react';
import { ROUTES } from '../../../lib/routes';
import { Ionicons } from '@expo/vector-icons';

// Schermate
import HomeScreen from '../../../screens/home/HomeScreen';
import SkillsScreen from '../../../screens/characters/SkillsScreen';
import SpellsScreen from '../../../screens/compendium/SpellsScreen';
import FeatsScreen from '../../../screens/characters/FeatsScreen';
import EquipmentScreen from '../../../screens/characters/EquipmentScreen';
import AltroStack from '../../../screens/more/AltroStack';
import CharacterDetailScreen from '../../../screens/characters/CharacterDetailScreen';

export type NavigationTab = {
  /** Nome della route a cui la tab fa riferimento (usa ROUTES.*) */
  routeName: string;
  /** Testo visualizzato nella tab bar */
  label: string;
  /**
   * Componente della schermata. `any` è richiesto da React Navigation
   * (`ScreenComponentType` è tipizzato come `ComponentType<any>` dalla libreria).
   */
  component: ComponentType<any>;
  iconActive: ComponentProps<typeof Ionicons>['name'];
  iconInactive: ComponentProps<typeof Ionicons>['name'];
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

  // ── TALENTI (solo con PG attivo) ──
  {
    routeName: ROUTES.TALENTI,
    label: 'Talenti',
    component: FeatsScreen,
    iconActive: 'star',
    iconInactive: 'star-outline',
    show: 'withCharacter',
  },

  // ── EQUIPAGGIAMENTO (solo con PG attivo) ──
  {
    routeName: ROUTES.EQUIPAGGIAMENTO,
    label: 'Equip.',
    component: EquipmentScreen,
    iconActive: 'bag-handle',
    iconInactive: 'bag-handle-outline',
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
