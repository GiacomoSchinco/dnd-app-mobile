import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../components/ui/prism-provider';
import defaultTheme from '../components/ui/themes/default';

// ── Spacing/Radius/Typography ───────────────────────────────────
// Valori derivati dal tema Prism di default (fonte unica).
// Non cambiano con dark/light mode, solo i colori sono dinamici.
export const spacing = defaultTheme.spacing;
export const radius = defaultTheme.radius;
export const fontSizes = defaultTheme.typography;

// ── Floating tab bar height (from AppNavigator) ─────────────────
export const FLOATING_TAB_HEIGHT = 64;
export const FLOATING_TAB_GAP = 16;

// ── Standardised screen styles (theme-aware & notch-aware) ──────
export function useScreenStyles() {
  const t = useTokens();
  const insets = useSafeAreaInsets(); // Risolve i problemi di notch/barre di stato

  const bottomSafe = insets.bottom + FLOATING_TAB_HEIGHT + FLOATING_TAB_GAP;

  return {
    /** Full‑screen wrapper con il background del tema */
    screen: {
      flex: 1,
      backgroundColor: t.colors.background,
    },

    /** Padding sicuro per schermate fisse (non scrollabili) */
    safePadding: {
      paddingTop: insets.top + t.spacing[4],
      paddingBottom: bottomSafe,
      paddingHorizontal: t.spacing[4],
    },

    /** Content container per ScrollViews sensibile alle Safe Area di iOS/Android */
    scrollContent: {
      alignItems: 'center' as const,
      paddingTop: insets.top + t.spacing[4],       // Protegge il notch in alto
      paddingBottom: bottomSafe,                    // Protegge dalla floating tab bar
      paddingHorizontal: t.spacing[4],
    },
  };
}
