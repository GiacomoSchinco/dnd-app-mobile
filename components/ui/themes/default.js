const defaultTheme = {
  name: 'default',
  colors: {
    background: '#FFFFFF', backgroundSecondary: '#F2F2F7', backgroundTertiary: '#E5E5EA',
    foreground: '#000000', foregroundSecondary: '#3C3C43', foregroundTertiary: '#3C3C4399',
    accent: '#007AFF', accentForeground: '#FFFFFF', accentSubtle: '#007AFF1A',
    success: '#34C759', successSubtle: '#34C7591A',
    warning: '#FF9500', warningSubtle: '#FF95001A',
    danger: '#FF3B30', dangerSubtle: '#FF3B301A',
    border: '#3C3C4329', borderStrong: '#3C3C4360', overlay: '#00000066',
    card: '#FFFFFF', cardBorder: '#3C3C4320',
    input: '#F2F2F7', inputBorder: '#3C3C4329', placeholder: '#3C3C4360',
  },
  typography: { xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, '2xl': 28, '3xl': 34, thin: '100', light: '300', regular: '400', medium: '500', semibold: '600', bold: '700', heavy: '800', tight: 1.2, normal: 1.5, relaxed: 1.75, tighter: -0.5, tight_ls: -0.3, normal_ls: 0, wide: 0.3 },
  spacing: { px: 1, '0.5': 2, 1: 4, 1.5: 6, 2: 8, 2.5: 10, 3: 12, 3.5: 14, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 12: 48, 14: 56, 16: 64 },
  radius: { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 9999 },
  shadow: { none: {}, sm: { shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }, md: { shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 6 }, lg: { shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 24, elevation: 12 } },
  animation: { spring: { gentle: { damping: 20, stiffness: 180 }, snappy: { damping: 18, stiffness: 300 }, bouncy: { damping: 12, stiffness: 200 } }, duration: { fast: 150, normal: 250, slow: 400 } },
  gradients: { background: { colors: ['#FFFFFF', '#F2F2F7'], direction: 'vertical' }, accent: { colors: ['#007AFF', '#5AC8FA'], direction: 'vertical' }, card: { colors: ['#FFFFFF', '#F8F8F8'], direction: 'vertical' }, surface: { colors: ['#FFFFFF', '#E8E8ED'], direction: 'vertical' } },
  transition: { enabled: true, duration: 300, easing: 'ease-in-out' },
  haptic: { enabled: true, type: 'medium' },
};

export default defaultTheme;
