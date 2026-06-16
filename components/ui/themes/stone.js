const stoneTheme = {
  name: 'stone',
  colors: {
    background: '#FAF8F5', backgroundSecondary: '#F0EDE8', backgroundTertiary: '#E6E2DA',
    foreground: '#292524', foregroundSecondary: '#78716C', foregroundTertiary: '#A8A29E',
    accent: '#B45309', accentForeground: '#FFFFFF', accentSubtle: '#B453091A',
    success: '#65A30D', successSubtle: '#65A30D1A',
    warning: '#D97706', warningSubtle: '#D977061A',
    danger: '#DC2626', dangerSubtle: '#DC26261A',
    border: '#D6D3D1', borderStrong: '#A8A29E', overlay: '#29252466',
    card: '#FAF8F5', cardBorder: '#D6D3D180',
    input: '#F0EDE8', inputBorder: '#D6D3D1', placeholder: '#A8A29E',
  },
  typography: { xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, '2xl': 28, '3xl': 34, thin: '100', light: '300', regular: '400', medium: '500', semibold: '600', bold: '700', heavy: '800', tight: 1.2, normal: 1.5, relaxed: 1.75, tighter: -0.5, tight_ls: -0.3, normal_ls: 0, wide: 0.3 },
  spacing: { px: 1, '0.5': 2, 1: 4, 1.5: 6, 2: 8, 2.5: 10, 3: 12, 3.5: 14, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 12: 48, 14: 56, 16: 64 },
  radius: { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 9999 },
  shadow: { none: {}, sm: { shadowColor: '#292524', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }, md: { shadowColor: '#292524', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 }, lg: { shadowColor: '#292524', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 12 } },
  animation: { spring: { gentle: { damping: 20, stiffness: 180 }, snappy: { damping: 18, stiffness: 300 }, bouncy: { damping: 12, stiffness: 200 } }, duration: { fast: 150, normal: 250, slow: 400 } },
  gradients: { background: { colors: ['#FAF8F5', '#F0EDE8'], direction: 'vertical' }, accent: { colors: ['#B45309', '#D97706'], direction: 'vertical' }, card: { colors: ['#FAF8F5', '#F0EDE8'], direction: 'vertical' }, surface: { colors: ['#F0EDE8', '#E6E2DA'], direction: 'vertical' } },
  transition: { enabled: true, duration: 300, easing: 'ease-in-out' },
  haptic: { enabled: true, type: 'medium' },
};

export default stoneTheme;
