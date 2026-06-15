import React from 'react'
import { View, Text } from 'react-native'
import { useTokens } from '../prism-provider.js'
const variants = {
  default: (t) => ({ backgroundColor: t.colors.card, borderColor: t.colors.cardBorder, shadow: null }),
  elevated: (t) => ({ backgroundColor: t.colors.card, borderColor: t.colors.cardBorder, shadow: t.shadow.md }),
  outlined: (t) => ({ backgroundColor: t.colors.background, borderColor: t.colors.border, shadow: null }),
  ghost: (t) => ({ backgroundColor: 'transparent', borderColor: 'transparent', shadow: null }),
}
export function Card(props) {
  const { variant = 'default', style, children, theme, ...rest } = props
  const contextTokens = useTokens()
  const t = theme || contextTokens
  const vs = (variants[variant] || variants.default)(t)
  const cardStyle = { borderRadius: t.radius.lg, borderWidth: 1, padding: t.spacing[4], backgroundColor: vs.backgroundColor, borderColor: vs.borderColor }
  return <View {...rest} style={[cardStyle, vs.shadow, style]}>{children}</View>
}
Card.Header = function(props) { return <View style={{ marginBottom: 12 }}>{props.children}</View> }
Card.Title = function(props) { const t = useTokens(); return <Text style={{ fontSize: t.typography.lg, fontWeight: t.typography.semibold }}>{props.children}</Text> }
Card.Body = function(props) { return <View style={{ flex: 1 }}>{props.children}</View> }
Card.Footer = function(props) { return <View style={{ marginTop: 16, flexDirection: 'row', gap: 8 }}>{props.children}</View> }
export default Card