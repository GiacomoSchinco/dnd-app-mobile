import React, { useEffect } from 'react'
import { View, Text, Pressable } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { useTokens } from '../prism-provider.js'
const types = {
  info: (t) => ({ bg: t.colors.accentSubtle, color: t.colors.accent }),
  success: (t) => ({ bg: t.colors.successSubtle, color: t.colors.success }),
  warning: (t) => ({ bg: t.colors.warningSubtle, color: t.colors.warning }),
  danger: (t) => ({ bg: t.colors.dangerSubtle, color: t.colors.danger }),
}
export function Toast(props) {
  const { type = 'info', message, duration = 3000, onClose, position = 'top', style, theme } = props
  const contextTokens = useTokens()
  const t = theme || contextTokens
  const translateY = useSharedValue(position === 'top' ? -100 : 100)
  const styleType = types[type](t)
  useEffect(() => {
    translateY.value = withSpring(0)
    if (duration > 0) setTimeout(() => { translateY.value = withSpring(position === 'top' ? -100 : 100); onClose && onClose() }, duration)
  }, [])
  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }))
  return (
    <Animated.View style={[{ position: 'absolute', [position]: 20, left: 20, right: 20, backgroundColor: styleType.bg, borderRadius: t.radius.md, padding: t.spacing[3], flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] }, position === 'top' ? { top: 20 } : { bottom: 20 }, animated, style]}>
      <Text style={{ flex: 1, color: styleType.color }}>{message}</Text>
      {onClose && <Pressable onPress={onClose}><Text style={{ color: styleType.color }}>x</Text></Pressable>}
    </Animated.View>
  )
}
export default Toast