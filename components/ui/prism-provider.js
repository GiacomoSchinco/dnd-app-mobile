import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Vibration, Platform } from 'react-native'
import defaultTheme from './themes/default.js'
import { THEMES } from './themes/registry.js'
import { fileSystemStorage } from '../../store/file-system-storage'

const THEME_STORAGE_KEY = 'app-theme'

const PrismContext = createContext(null)

const triggerHaptic = (type) => {
  if (Platform.OS === 'ios') {
    switch (type) {
      case 'selection': Vibration.vibrate(1); break
      case 'light': Vibration.vibrate(5); break
      case 'medium': Vibration.vibrate([0, 5], false); break
      case 'heavy': Vibration.vibrate([0, 10], false); break
      default: Vibration.vibrate(5)
    }
  } else if (Platform.OS === 'android') {
    Vibration.vibrate(type === 'light' ? 5 : type === 'medium' ? 10 : 5)
  }
}

export function PrismProvider({ theme = defaultTheme, children }) {
  // Stato iniziale: su web lo storage è sincrono → possiamo leggere subito
  // il tema salvato ed evitare il "flash" del tema sbagliato all'avvio.
  const [activeTheme, setActiveTheme] = useState(() => {
    if (Platform.OS === 'web') {
      try {
        const saved = fileSystemStorage.getItem(THEME_STORAGE_KEY)
        if (saved && THEMES[saved]) return THEMES[saved]
      } catch {}
    }
    return theme
  })
  const [transitioning, setTransitioning] = useState(false)
  const [prevTheme, setPrevTheme] = useState(null)

  // Su nativo lo storage è asincrono: carica il tema salvato dopo il mount.
  useEffect(() => {
    if (Platform.OS === 'web') return
    let mounted = true
    ;(async () => {
      try {
        const saved = await fileSystemStorage.getItem(THEME_STORAGE_KEY)
        if (mounted && saved && THEMES[saved]) setActiveTheme(THEMES[saved])
      } catch {}
    })()
    return () => { mounted = false }
  }, [])

  const setTheme = useCallback((newTheme, options = {}) => {
    const { animated = true, haptic = true } = options
    if (haptic && newTheme.haptic?.enabled) { triggerHaptic(newTheme.haptic.type || 'medium') }
    // Persisti la scelta usando la CHIAVE del registro: `theme.name` può differire
    // dalla chiave (es. 'darkFantasy' vs 'dark_fantasy') e al reload si legge
    // THEMES[chiave] → senza questo il tema non veniva ripristinato all'avvio.
    const key = Object.keys(THEMES).find((k) => THEMES[k] === newTheme) ?? newTheme.name
    try {
      Promise.resolve(fileSystemStorage.setItem(THEME_STORAGE_KEY, key)).catch(() => {})
    } catch {}
    if (animated && newTheme.transition?.enabled) {
      setPrevTheme(activeTheme)
      setTransitioning(true)
      setActiveTheme(newTheme)
      setTimeout(() => { setTransitioning(false); setPrevTheme(null) }, newTheme.transition.duration)
    } else {
      setActiveTheme(newTheme)
      setTransitioning(false)
      setPrevTheme(null)
    }
  }, [activeTheme])

  return (
    <PrismContext.Provider value={{ theme: activeTheme, setTheme, transitioning, prevTheme }}>
      {children}
    </PrismContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(PrismContext)
  if (!ctx) { throw new Error('[Prism] useTheme() must be called inside <PrismProvider>.') }
  return ctx
}

export function useTokens() {
  return useTheme().theme
}

export function useThemeTransition() {
  const { transitioning, prevTheme } = useTheme()
  return { transitioning, prevTheme }
}

export function useHaptics() {
  return {
    trigger: (type) => triggerHaptic(type),
    selection: () => triggerHaptic('selection'),
    light: () => triggerHaptic('light'),
    medium: () => triggerHaptic('medium'),
    heavy: () => triggerHaptic('heavy'),
  }
}
