const darkFantasyTheme = {
  name: 'darkFantasy',
  colors: {
    // Sfondi ispirati a pietra profonda, sotterranei e ferro
    background: '#121316',          // Lavagna scurissima / Antracite d'abisso
    backgroundSecondary: '#1C1D22', // Pietra levigata (per le card dei personaggi)
    backgroundTertiary: '#272930',  // Grigio armatura (per i bordi o input attivi)
    
    // Testi altamente leggibili ma morbidi (stile antica cronaca)
    foreground: '#F4EFEA',          // Avorio / Bianca luce di candela
    foregroundSecondary: '#C5BCB3', // Pergamena sbiadita
    foregroundTertiary: '#8C857B',  // Bronzo antico consumato
    
    // Accenti magici (Il cuore del fantasy)
    accent: '#E69A33',              // Oro Araldico / Fuoco del Drago (Attira l'attenzione)
    accentForeground: '#121316',    // Testo scuro sopra l'oro
    accentSubtle: '#E69A3315',      // Bagliore dorato di fondo
    
    // Stati Semantici (Magici ma chiari)
    success: '#3F9E63',              // Verde Druidico / Linfa vitale
    successSubtle: '#3F9E631A',
    warning: '#D97706',              // Ambra Alchemica
    warningSubtle: '#D977061A',
    danger: '#CD4242',               // Sangue di Drago / Rubino
    dangerSubtle: '#CD42421A',
    
    // Strutturali
    border: '#3E362E35',             // Grigio brunito con un tocco di marrone
    borderStrong: '#E69A3340',       // Profilo dorato soft per gli elementi attivi
    overlay: '#00000088',
    card: '#1C1D22',
    cardBorder: '#E69A3320',         // Un micro-bordo dorato attorno alle schede
    input: '#1A1B20',
    inputBorder: '#3E362E60',
    placeholder: '#8C857B80',
  },
  typography: { 
    xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, '2xl': 28, '3xl': 34, 
    thin: '100', light: '300', regular: '400', medium: '500', semibold: '600', bold: '700', heavy: '800', 
    tight: 1.2, normal: 1.5, relaxed: 1.75, tighter: -0.5, tight_ls: -0.3, normal_ls: 0, wide: 0.5 
  },
  spacing: { px: 1, '0.5': 2, 1: 4, 1.5: 6, 2: 8, 2.5: 10, 3: 12, 3.5: 14, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 12: 48, 14: 56, 16: 64 },
  radius: { none: 0, xs: 4, sm: 6, md: 10, lg: 14, xl: 18, '2xl': 22, full: 9999 }, // Angoli leggermente più netti ed eleganti
  shadow: { 
    none: {}, 
    sm: { shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 }, 
    md: { shadowColor: '#000000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 } 
  },
  animation: { spring: { gentle: { damping: 22, stiffness: 150 }, snappy: { damping: 15, stiffness: 240 }, bouncy: { damping: 10, stiffness: 180 } }, duration: { fast: 120, normal: 220, slow: 350 } },
  gradients: { 
    background: { colors: ['#121316', '#1A1B20'], direction: 'vertical' }, 
    accent: { colors: ['#E69A33', '#C27C23'], direction: 'vertical' }, // Sfumatura oro/bronzo d'impatto
    card: { colors: ['#1C1D22', '#23252C'], direction: 'vertical' }, 
    surface: { colors: ['#1A1B20', '#272930'], direction: 'vertical' } 
  },
  transition: { enabled: true, duration: 250, easing: 'ease-in-out' },
  haptic: { enabled: true, type: 'medium' }, // Fondamentale quando tiri i dadi virtuali!
};

export default darkFantasyTheme;