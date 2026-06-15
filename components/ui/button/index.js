import React from 'react'
import { Pressable, Text, ActivityIndicator, View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated'
import { useTokens } from '../prism-provider.js'
const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
const variants = {
  solid: (t) => ({ container: { backgroundColor: t.colors.accent, borderWidth: 0 }, label: { color: t.colors.accentForeground } }),
  outline: (t) => ({ container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: t.colors.border }, label: { color: t.colors.foreground } }),
  ghost: (t) => ({ container: { backgroundColor: 'transparent', borderWidth: 0 }, label: { color: t.colors.accent } }),
  danger: (t) => ({ container: { backgroundColor: t.colors.danger, borderWidth: 0 }, label: { color: '#FFFFFF' } }),
  subtle: (t) => ({ container: { backgroundColor: t.colors.accentSubtle, borderWidth: 0 }, label: { color: t.colors.accent } }),
}
const sizes = {
  sm: (t) => ({ container: { paddingHorizontal: t.spacing[3], paddingVertical: t.spacing[1.5], borderRadius: t.radius.sm }, label: { fontSize: t.typography.sm, fontWeight: t.typography.medium } }),
  md: (t) => ({ container: { paddingHorizontal: t.spacing[4], paddingVertical: t.spacing[2.5], borderRadius: t.radius.md }, label: { fontSize: t.typography.base, fontWeight: t.typography.medium } }),
  lg: (t) => ({ container: { paddingHorizontal: t.spacing[6], paddingVertical: t.spacing[3.5], borderRadius: t.radius.lg }, label: { fontSize: t.typography.md, fontWeight: t.typography.semibold } }),
}
export function Button(props) {
  const { variant = 'solid', size = 'md', loading = false, disabled = false, fullWidth = false, onPress, children, style, labelStyle, theme, ...rest } = props
  const contextTokens = useTokens()
  const t = theme || contextTokens
  const pressed = useSharedValue(0)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.97]) }], opacity: interpolate(pressed.value, [0, 1], [1, 0.85]) }))
  const handlePressIn = () => { pressed.value = withSpring(1, t.animation.spring.snappy) }
  const handlePressOut = () => { pressed.value = withSpring(0, t.animation.spring.gentle) }
  const variantStyle = (variants[variant] || variants.solid)(t)
  const sizeStyle = (sizes[size] || sizes.md)(t)
  const isDisabled = disabled || loading
  return (
    <AnimatedPressable onPress={isDisabled ? undefined : onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}
      accessible accessibilityRole="button" accessibilityState={{ disabled: isDisabled }}
      style={[animatedStyle, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: fullWidth ? 'stretch' : 'flex-start' },
        (variant === 'solid' || variant === 'danger') && t.shadow.sm, variantStyle.container, sizeStyle.container, isDisabled && { opacity: 0.45 }, style]} {...rest}>
      {loading && <ActivityIndicator size="small" color={variantStyle.label.color} />}
      <Text style={[variantStyle.label, sizeStyle.label, labelStyle]}>{children}</Text>
    </AnimatedPressable>
  )
}
export default Button