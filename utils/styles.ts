import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../components/ui/prism-provider';

// ── Spacing constants (match theme values) ──────────────────────
export const spacing = {
  px: 1,
  '0.5': 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
} as const;

// ── Radius constants (match theme values) ───────────────────────
export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// ── Typography size constants (match theme values) ──────────────
export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
} as const;

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

    /** Section wrapper con gap verticale basato sui token */
    section: {
      width: '100%' as const,
      gap: t.spacing[4],
    },

    /** Small uppercase label per i gruppi di controllo (es. schede D&D) */
    label: {
      fontSize: fontSizes.xs, // Usa le costanti per coerenza
      fontWeight: '600' as const,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      color: t.colors.foregroundTertiary,
    },

    /** Bottone dello stepper (circolare ±) — flessibile e con colori del tema */
    stepperBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },

    /** Riga per allineare i controlli orizzontalmente */
    controlsRow: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      gap: t.spacing[4],
    },
  };
}
