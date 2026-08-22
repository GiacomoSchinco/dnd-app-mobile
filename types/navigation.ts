import type { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

/**
 * Parametri delle route di navigazione (per tipizzare `useNavigation`).
 */

/** Stack radice (Main = tab navigator + schermate pushate a schermo intero) */
export type RootStackParamList = {
  Main: undefined;
  CharacterCreate: undefined;
  /** Gestione magie assegnate al PG — raggiungibile dalla tab Spells */
  SpellAssign: undefined;
  /** Appunti / todo-list del PG attivo — raggiungibile dalla Scheda */
  Notes: undefined;
  /** Sezioni consultive — raggiungibili SOLO dalla Home, senza storico nel menu More */
  Settings: undefined;
  Compendium: undefined;
  CompendiumSpells: undefined;
  Classes: undefined;
  Races: undefined;
  Background: undefined;
  Feats: undefined;
  Equipment: undefined;
  Items: undefined;
};

/** Stack interno della tab Altro (AltroStack) — menu + editor del PG attivo */
export type AltroStackParamList = {
  MoreMenu: undefined;
  ModificaPersonaggio: undefined;
};

/** Tab navigator (Main) */
export type TabParamList = {
  Home: undefined;
  CharacterDetail: undefined;
  Spells: undefined;
  Skills: undefined;
  Feats: undefined;
  Equipment: undefined;
  /** Tab "More" = AltroStack annidato: consente di navigare a una sua schermata
   *  direttamente (es. `navigate('More', { screen: 'Settings' })`). */
  More: NavigatorScreenParams<AltroStackParamList>;
  Dice: undefined;
};

/** Navigazione da una schermata tab verso lo stack radice (es. Home → Crea PG) */
export type TabToRootNav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;
