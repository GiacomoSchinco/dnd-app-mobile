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
  /** Gestione magie assegnate al PG — raggiungibile dalla tab Magie */
  SpellAssign: undefined;
  /** Sezioni consultive — raggiungibili SOLO dalla Home, senza storico nel menu Altro */
  Impostazioni: undefined;
  Compendio: undefined;
  CompendioMagie: undefined;
  Classi: undefined;
  Razze: undefined;
  Background: undefined;
  Talenti: undefined;
  Equipaggiamento: undefined;
  Oggetti: undefined;
};

/** Stack interno della tab Altro (AltroStack) — ora contiene solo il menu */
export type AltroStackParamList = {
  AltroMenu: undefined;
};

/** Tab navigator (Main) */
export type TabParamList = {
  Home: undefined;
  CharacterDetail: undefined;
  Magie: undefined;
  Abilita: undefined;
  /** Tab "Altro" = AltroStack annidato: consente di navigare a una sua schermata
   *  direttamente (es. `navigate('Altro', { screen: 'Impostazioni' })`). */
  Altro: NavigatorScreenParams<AltroStackParamList>;
  Dadi: undefined;
};

/** Navigazione da una schermata tab verso lo stack radice (es. Home → Crea PG) */
export type TabToRootNav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;
