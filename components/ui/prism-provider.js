import React, { createContext, useContext, useState, useCallback } from 'react'
import { Vibration, Platform } from 'react-native'
import defaultTheme from './themes/default.js'

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
  const [activeTheme, setActiveTheme] = useState(theme)
  const [transitioning, setTransitioning] = useState(false)
  const [prevTheme, setPrevTheme] = useState(null)

  const setTheme = useCallback((newTheme, options = {}) => {
    const { animated = true, haptic = true } = options
    if (haptic && newTheme.haptic?.enabled) { triggerHaptic(newTheme.haptic.type || 'medium') }
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
