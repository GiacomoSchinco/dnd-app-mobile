const lightFantasyTheme = {
  name: 'lightFantasy',
  colors: {
    background: '#FAF6EE',          // Pergamena pulita / Avorio chiaro
    backgroundSecondary: '#F3EFE3', // Pagina d'altri tempi (sfondo delle card)
    backgroundTertiary: '#EAE2D1',  // Ombra della carta
    
    foreground: '#2C251E',          // Inchiostro di china / Seppia scuro
    foregroundSecondary: '#5C4F41', // Cuoio bruciato
    foregroundTertiary: '#8D7B68',  // Polvere di tomo
    
    accent: '#8B2635',              // Rosso Cremisi Reale / Sangue di Drago
    accentForeground: '#FAF6EE',
    accentSubtle: '#8B263510',
    
    success: '#2E7D32',
    successSubtle: '#2E7D3215',
    warning: '#C47B13',
    warningSubtle: '#C47B1315',
    danger: '#D32F2F',
    dangerSubtle: '#D32F2F15',
    
    border: '#2C251E18',
    borderStrong: '#8B263530',
    overlay: '#2C251E55',
    card: '#F3EFE3',
    cardBorder: '#2C251E12',
    input: '#FFFFFF',
    inputBorder: '#2C251E20',
    placeholder: '#8D7B6880',
  },
  typography: { xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, '2xl': 28, '3xl': 34, thin: '100', light: '300', regular: '400', medium: '500', semibold: '600', bold: '700', heavy: '800', tight: 1.2, normal: 1.5, relaxed: 1.75, tighter: -0.5, tight_ls: -0.3, normal_ls: 0, wide: 0.3 },
  spacing: { px: 1, '0.5': 2, 1: 4, 1.5: 6, 2: 8, 2.5: 10, 3: 12, 3.5: 14, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 12: 48, 14: 56, 16: 64 },
  radius: { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 9999 },
  shadow: { none: {}, sm: { shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }, md: { shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 6 }, lg: { shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 24, elevation: 12 } },
  animation: { spring: { gentle: { damping: 20, stiffness: 180 }, snappy: { damping: 18, stiffness: 300 }, bouncy: { damping: 12, stiffness: 200 } }, duration: { fast: 150, normal: 250, slow: 400 } },
  gradients: { background: { colors: ['#FAF6EE', '#F3EFE3'], direction: 'vertical' }, accent: { colors: ['#8B2635', '#B03A4A'], direction: 'vertical' }, card: { colors: ['#F3EFE3', '#EAE2D1'], direction: 'vertical' }, surface: { colors: ['#F3EFE3', '#EAE2D1'], direction: 'vertical' } },
  transition: { enabled: true, duration: 300, easing: 'ease-in-out' },
  haptic: { enabled: true, type: 'medium' },
};

export default lightFantasyTheme;