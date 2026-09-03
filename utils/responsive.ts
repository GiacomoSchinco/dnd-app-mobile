// ── Responsive scaling (tablet / schermi larghi) ────────────────────────
// L'app è disegnata con token pensati per un telefono (dp fissi). Su tablet
// (schermo molto più largo) gli stessi dp occupano una frazione minuscola e
// la UI "sembra piccola". Qui calcoliamo un fattore `scale` che scatta SOLO
// sopra una certa larghezza (sotto resta 1 → telefoni IDENTICI a oggi) e
// produciamo una copia del tema con typography/spacing/radius moltiplicati.
import type { PrismTheme } from '../components/ui/prism-provider';

/** Larghezza (dp) sotto cui NON si scala (telefoni invariati). */
export const RESPONSIVE_BREAKPOINT = 520;
/** Larghezza (dp) a cui si raggiunge il fattore massimo. */
export const RESPONSIVE_FULL_WIDTH = 800;
/** Fattore massimo di ingrandimento ("stile telefono grande"). */
export const RESPONSIVE_MAX_SCALE = 1.45;

/** Chiavi di `typography` che sono dimensioni di FONT (da scalare). */
const FONT_SIZE_KEYS = ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

/**
 * Fattore di scala in base alla larghezza della finestra (dp).
 * - width <= BREAKPOINT  → 1 (nessun cambiamento sui telefoni)
 * - width >= FULL_WIDTH  → RESPONSIVE_MAX_SCALE
 * - in mezzo → crescita lineare
 */
export function getResponsiveScale(width: number): number {
  if (width <= RESPONSIVE_BREAKPOINT) return 1;
  const full = RESPONSIVE_FULL_WIDTH - RESPONSIVE_BREAKPOINT;
  const reached = width - RESPONSIVE_BREAKPOINT;
  const s = 1 + (reached / full) * (RESPONSIVE_MAX_SCALE - 1);
  return Math.min(RESPONSIVE_MAX_SCALE, s);
}

const scaleNumber = (value: number, scale: number) => Math.round(value * scale);

/**
 * Ritorna il tema con typography (solo i font), spacing e radius scalati.
 * Se `scale <= 1` ritorna il tema ORIGINALE (stessa identità → zero re-render).
 */
export function buildResponsiveTheme(theme: PrismTheme, scale: number): PrismTheme {
  if (scale <= 1) return theme;

  const typography: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(theme.typography)) {
    typography[key] =
      (FONT_SIZE_KEYS as readonly string[]).includes(key) && typeof value === 'number'
        ? scaleNumber(value, scale)
        : value;
  }

  const spacing: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(theme.spacing)) {
    spacing[key] = typeof value === 'number' ? scaleNumber(value, scale) : value;
  }

  const radius: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(theme.radius)) {
    radius[key] = typeof value === 'number' ? scaleNumber(value, scale) : value;
  }

  return {
    ...theme,
    // `scale` esposto sul tema: i componenti con dimensioni "compagne"
    // hardcoded (es. lineHeight) possono fare `Math.round(N * (t.scale ?? 1))`.
    scale,
    typography,
    spacing,
    radius,
  };
}
