// Registro condiviso dei temi: unica fonte per chiave → oggetto tema.
// Usato sia da PrismProvider (persistenza) sia da ThemePicker (lista UI).
import defaultTheme from './default.js';
import darkFantasyTheme from './dark_fantasy.js';
import lightFantasyTheme from './light_fantasy.js';
import obsidianTheme from './obsidian.js';
import neonTheme from './neon.js';
import stoneTheme from './stone.js';

// Chiave → oggetto tema. La chiave coincide con `theme.name`.
// Include anche i temi "disattivati" così una scelta salvata in passato non va persa.
export const THEMES = {
  default: defaultTheme,
  dark_fantasy: darkFantasyTheme,
  light_fantasy: lightFantasyTheme,
  obsidian: obsidianTheme,
  neon: neonTheme,
  stone: stoneTheme,
};

// Lista per il ThemePicker (solo i temi attivi).
export const THEME_LIST = [
  { key: 'default', theme: defaultTheme, label: 'Default', desc: 'Chiaro · stile Apple' },
  { key: 'dark_fantasy', theme: darkFantasyTheme, label: 'Dark Fantasy', desc: 'Antracite · oro araldico' },
  { key: 'light_fantasy', theme: lightFantasyTheme, label: 'Light Fantasy', desc: 'Pergamena · rosso cremisi' },
];
