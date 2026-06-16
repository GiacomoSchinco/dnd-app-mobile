const neonTheme = {
  name: 'neon',
  colors: {
    background: '#0A0A1A', backgroundSecondary: '#141428', backgroundTertiary: '#1E1E3A',
    foreground: '#FFFFFF', foregroundSecondary: '#A5B4FC', foregroundTertiary: '#6366F166',
    accent: '#00FF88', accentForeground: '#000000', accentSubtle: '#00FF8820',
    success: '#22FF66', successSubtle: '#22FF661A',
    warning: '#FFD700', warningSubtle: '#FFD7001A',
    danger: '#FF3366', dangerSubtle: '#FF33661A',
    border: '#6366F140', borderStrong: '#6366F180', overlay: '#000000CC',
    card: '#141428', cardBorder: '#6366F130',
    input: '#141428', inputBorder: '#6366F140', placeholder: '#6366F180',
  },
  typography: { xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, '2xl': 28, '3xl': 34, thin: '100', light: '300', regular: '400', medium: '500', semibold: '600', bold: '700', heavy: '800', tight: 1.2, normal: 1.5, relaxed: 1.75, tighter: -0.5, tight_ls: -0.3, normal_ls: 0, wide: 0.3 },
  spacing: { px: 1, '0.5': 2, 1: 4, 1.5: 6, 2: 8, 2.5: 10, 3: 12, 3.5: 14, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 12: 48, 14: 56, 16: 64 },
  radius: { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 9999 },
  shadow: { none: {}, sm: { shadowColor: '#00FF88', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 }, md: { shadowColor: '#00FF88', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 }, lg: { shadowColor: '#00FF88', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 28, elevation: 14 } },
  animation: { spring: { gentle: { damping: 20, stiffness: 180 }, snappy: { damping: 18, stiffness: 300 }, bouncy: { damping: 12, stiffness: 200 } }, duration: { fast: 150, normal: 250, slow: 400 } },
  gradients: { background: { colors: ['#0A0A1A', '#141428'], direction: 'vertical' }, accent: { colors: ['#00FF88', '#22FF66'], direction: 'vertical' }, card: { colors: ['#141428', '#1E1E3A'], direction: 'vertical' }, surface: { colors: ['#141428', '#1E1E3A'], direction: 'vertical' } },
  transition: { enabled: true, duration: 300, easing: 'ease-in-out' },
  haptic: { enabled: true, type: 'medium' },
};

export default neonTheme;
