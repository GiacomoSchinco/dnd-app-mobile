import React from 'react'
import { View, Text } from 'react-native'
import { useTokens } from '../prism-provider.js'
const variants = {
  solid: (t, color) => ({ container: { backgroundColor: color || t.colors.accent }, label: { color: t.colors.accentForeground } }),
  outline: (t, color) => ({ container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: color || t.colors.border }, label: { color: color || t.colors.foreground } }),
  subtle: (t, color) => ({ container: { backgroundColor: color ? color + '1A' : t.colors.accentSubtle }, label: { color: color || t.colors.accent } }),
}
const sizes = {
  sm: (t) => ({ paddingHorizontal: t.spacing[1.5], paddingVertical: t.spacing[0.5], fontSize: t.typography.xs }),
  md: (t) => ({ paddingHorizontal: t.spacing[2], paddingVertical: t.spacing[1], fontSize: t.typography.sm }),
  lg: (t) => ({ paddingHorizontal: t.spacing[2.5], paddingVertical: t.spacing[1.5], fontSize: t.typography.base }),
}
export function Badge(props) {
  const { variant = 'subtle', size = 'md', color, children, style, theme, ...rest } = props
  const contextTokens = useTokens()
  const t = theme || contextTokens
  const variantStyle = variants[variant](t, color)
  const sizeStyle = sizes[size](t)
  return (
    <View {...rest} style={[{ flexDirection: 'row', alignItems: 'center', borderRadius: t.radius.full }, variantStyle.container, sizeStyle, style]}>
      {props.dot && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: variantStyle.label.color, marginRight: t.spacing[1] }} />}
      <Text style={[{ fontWeight: t.typography.medium }, sizeStyle, variantStyle.label]}>{children}</Text>
    </View>
  )
}
export default Badge