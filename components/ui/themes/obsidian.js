const obsidianTheme = {
  name: 'obsidian',
  colors: {
    background: '#0D0D0D', backgroundSecondary: '#1A1A1A', backgroundTertiary: '#262626',
    foreground: '#FFFFFF', foregroundSecondary: '#A3A3A3', foregroundTertiary: '#737373',
    accent: '#8B5CF6', accentForeground: '#FFFFFF', accentSubtle: '#8B5CF61A',
    success: '#22C55E', successSubtle: '#22C55E1A',
    warning: '#F59E0B', warningSubtle: '#F59E0B1A',
    danger: '#EF4444', dangerSubtle: '#EF44441A',
    border: '#262626', borderStrong: '#404040', overlay: '#000000CC',
    card: '#1A1A1A', cardBorder: '#262626',
    input: '#1A1A1A', inputBorder: '#333333', placeholder: '#525252',
  },
  typography: { xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, '2xl': 28, '3xl': 34, thin: '100', light: '300', regular: '400', medium: '500', semibold: '600', bold: '700', heavy: '800', tight: 1.2, normal: 1.5, relaxed: 1.75, tighter: -0.5, tight_ls: -0.3, normal_ls: 0, wide: 0.3 },
  spacing: { px: 1, '0.5': 2, 1: 4, 1.5: 6, 2: 8, 2.5: 10, 3: 12, 3.5: 14, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 12: 48, 14: 56, 16: 64 },
  radius: { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 9999 },
  shadow: { none: {}, sm: { shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 }, md: { shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 }, lg: { shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 12 } },
  animation: { spring: { gentle: { damping: 20, stiffness: 180 }, snappy: { damping: 18, stiffness: 300 }, bouncy: { damping: 12, stiffness: 200 } }, duration: { fast: 150, normal: 250, slow: 400 } },
  gradients: { background: { colors: ['#0D0D0D', '#1A1A1A'], direction: 'vertical' }, accent: { colors: ['#8B5CF6', '#A78BFA'], direction: 'vertical' }, card: { colors: ['#1A1A1A', '#242424'], direction: 'vertical' }, surface: { colors: ['#1A1A1A', '#262626'], direction: 'vertical' } },
  transition: { enabled: true, duration: 300, easing: 'ease-in-out' },
  haptic: { enabled: true, type: 'medium' },
};

export default obsidianTheme;
