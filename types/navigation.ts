import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

/**
 * Parametri delle route di navigazione (per tipizzare `useNavigation`).
 */

/** Stack radice (Main = tab navigator + schermate pushate) */
export type RootStackParamList = {
  Main: undefined;
  CharacterCreate: undefined;
};

/** Stack interno della tab Altro (AltroStack) */
export type AltroStackParamList = {
  AltroMenu: undefined;
  Impostazioni: undefined;
  Compendio: undefined;
  Classi: undefined;
  Razze: undefined;
  Background: undefined;
  Talenti: undefined;
  Equipaggiamento: undefined;
  Oggetti: undefined;
};

/** Tab navigator (Main) */
export type TabParamList = {
  Home: undefined;
  CharacterDetail: undefined;
  Magie: undefined;
  Oggetti: undefined;
  Altro: undefined;
  Dadi: undefined;
};

/** Navigazione da una schermata tab verso lo stack radice (es. Home → Crea PG) */
export type TabToRootNav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

/** Navigazione da una schermata AltroStack verso la tab bar (es. Compendio → Magie) */
export type AltroToTabNav = CompositeNavigationProp<
  NativeStackNavigationProp<AltroStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;
