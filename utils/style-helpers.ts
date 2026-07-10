/**
 * Style helpers — riducono la verbosità degli inline style.
 *
 * Pattern più comuni nel progetto:
 *   - righe flessibili (flexDirection: 'row', alignItems: 'center')
 *   - centratura (alignItems + justifyContent: 'center')
 *   - contenitori per icone (square + centrato + bordo arrotondato)
 *   - pulsanti "card" (row, padding, border, background dinamico)
 *
 * Uso tipico:
 *   const t = useTokens();
 *   <View style={[s.row, { gap: t.spacing[4] }]}>        → riga con gap
 *   <View style={s.by(48, 12)}>                           → scatola icona 48×48
 *   <View style={[s.flex, s.center]}>                     → pieno e centrato
 */

import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';

// ── Types ───────────────────────────────────────────────────────

export type PrismTokens = {
  spacing: Record<string, number>;
  radius: Record<string, number>;
  colors: Record<string, string>;
};

// ── Helpers statici (non richiedono useTokens()) ────────────────

export const s = {
  /** Flex row con allineamento centrato */
  get row(): ViewStyle {
    return { flexDirection: 'row', alignItems: 'center' };
  },

  /** Flex row con wrap */
  get rowWrap(): ViewStyle {
    return { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' };
  },

  /** Centro su entrambi gli assi */
  get center(): ViewStyle {
    return { alignItems: 'center', justifyContent: 'center' };
  },

  /** Flex: 1 */
  get flex(): ViewStyle {
    return { flex: 1 };
  },

  /** Larghezza piena */
  get fullWidth(): ViewStyle {
    return { width: '100%' };
  },

  /** Contenitore quadrato per icone (centrato + border-radius) */
  box: (size: number, radius: number): ViewStyle => ({
    width: size,
    height: size,
    borderRadius: radius,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  /** Scorciatoia: box icona 48×48 con raggio default 12 */
  iconBox: (size = 48, borderRadius = 12): ViewStyle =>
    s.box(size, borderRadius),

  /** Gap generico */
  gap: (n: number): ViewStyle => ({ gap: n }),

  /** Margine superiore */
  mt: (n: number): ViewStyle => ({ marginTop: n }),

  /** Margine inferiore */
  mb: (n: number): ViewStyle => ({ marginBottom: n }),

  /** Padding orizzontale + verticale uguali */
  p: (n: number): ViewStyle => ({ padding: n }),

  /** Padding solo orizzontale */
  px: (n: number): ViewStyle => ({ paddingHorizontal: n }),

  /** Padding solo verticale */
  py: (n: number): ViewStyle => ({ paddingVertical: n }),
};

// ── Helpers che richiedono i token del tema ─────────────────────

/**
 * Crea una card/pulsante "row" stile HomeScreen / CompendioScreen.
 */
export function cardRow(t: PrismTokens, pressed: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[4],
    padding: t.spacing[4],
    backgroundColor: pressed
      ? t.colors.backgroundSecondary
      : 'transparent',
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.backgroundSecondary,
  };
}

/**
 * Crea un contenitore icona grande stile HomeScreen (50×50, raggio 12).
 */
export function iconContainer(
  t: PrismTokens,
  size = 50,
  borderRadius = 12,
): ViewStyle {
  return {
    width: size,
    height: size,
    borderRadius,
    backgroundColor: t.colors.accent + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.spacing[4],
  };
}
