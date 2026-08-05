// Dichiarazioni di tipo per themes/registry.js
import { PrismTheme } from '../prism-provider';

export interface ThemeListItem {
  key: string;
  theme: PrismTheme;
  label: string;
  desc: string;
}

export const THEMES: Record<string, PrismTheme>;
export const THEME_LIST: ThemeListItem[];
