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

// ── Standardised screen styles (theme-aware) ────────────────────
export function useScreenStyles() {
  const t = useTokens();

  return {
    /** Full‑screen wrapper with theme background */
    screen: {
      flex: 1,
      backgroundColor: t.colors.background,
    } as const,

    /** Content container for ScrollViews */
    scrollContent: {
      alignItems: 'center',
      paddingVertical: t.spacing[6],
      paddingHorizontal: t.spacing[4],
    } as const,

    /** Section wrapper with vertical gap */
    section: {
      width: '100%',
      gap: t.spacing[4],
    } as const,

    /** Small uppercase label for control groups */
    label: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: t.colors.foregroundTertiary,
    } as const,

    /** Stepper button (circular ±) — usa backgroundColor dal tema, non hardcoded */
    stepperBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    } as const,

    /** Row of horizontally aligned controls */
    controlsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: t.spacing[4],
    } as const,
  };
}
