import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated'
import { useTokens } from '../prism-provider.js'
export function Skeleton(props) {
  const { width, height, borderRadius: br, style, theme, ...rest } = props
  const contextTokens = useTokens()
  const t = theme || contextTokens
  const shimmer = useSharedValue(0)
  useEffect(() => { shimmer.value = withRepeat(withSequence(withTiming(1, { duration: 1000 }), withTiming(0, { duration: 1000 })), -1, false) }, [])
  const animatedStyle = useAnimatedStyle(() => ({ opacity: 0.3 + shimmer.value * 0.4 }))
  return <View {...rest} style={[{ borderRadius: br || t.radius.md, backgroundColor: t.colors.backgroundTertiary, width: width || '100%', height: height || 20 }, style]}><Animated.View style={[{ flex: 1, backgroundColor: t.colors.backgroundTertiary }, animatedStyle]} /></View>
}
export default Skeleton