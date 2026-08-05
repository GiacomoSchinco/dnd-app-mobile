// Dichiarazioni di tipo per prism-provider.js (modulo JS puro).
// Mantenute volutamente "larghe" per non rompere i ~50 file che lo importano.
import React from 'react';

export interface PrismTheme {
  name: string;
  colors: Record<string, string>;
  typography: Record<string, any>;
  spacing: Record<string, any>;
  radius: Record<string, any>;
  shadow: Record<string, any>;
  animation: Record<string, any>;
  gradients: Record<string, any>;
  transition: { enabled: boolean; duration: number; easing: string };
  haptic: { enabled: boolean; type: string };
  [key: string]: any;
}

export interface PrismContextValue {
  theme: PrismTheme;
  setTheme: (theme: PrismTheme, options?: { animated?: boolean; haptic?: boolean }) => void;
  transitioning: boolean;
  prevTheme: PrismTheme | null;
}

export interface PrismProviderProps {
  theme?: PrismTheme;
  children?: React.ReactNode;
}

export function PrismProvider(props: PrismProviderProps): React.ReactElement;
export function useTheme(): PrismContextValue;
export function useTokens(): PrismTheme;
export function useThemeTransition(): { transitioning: boolean; prevTheme: PrismTheme | null };
export function useHaptics(): {
  trigger: (type?: string) => void;
  selection: () => void;
  light: () => void;
  medium: () => void;
  heavy: () => void;
};
