import React from 'react'
import { View, Text, Image } from 'react-native'
import { useTokens } from '../prism-provider.js'
const sizes = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 }
function Avatar(props) {
  const { size = 'md', source, fallback, style, theme, ...rest } = props
  const contextTokens = useTokens()
  const t = theme || contextTokens
  const dim = sizes[size]
  const init = fallback ? fallback.slice(0, 2).toUpperCase() : '?'
  return (
    <View {...rest} style={[{ width: dim, height: dim, borderRadius: dim / 2, overflow: 'hidden', backgroundColor: t.colors.accent }, style]}>
      {source ? <Image source={source} style={{ width: dim, height: dim }} /> : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: dim / 2.5, fontWeight: t.typography.semibold, color: t.colors.accentForeground }}>{init}</Text></View>}
    </View>
  )
}
Avatar.Group = function(props) {
  const { max = 4, children, style } = props
  const t = useTokens()
  const arr = React.Children.toArray(children)
  return (
    <View style={{ flexDirection: 'row', style }}>
      {arr.slice(0, max).map((child, i) => <View key={i} style={{ marginLeft: i > 0 ? -10 : 0 }}>{React.cloneElement(child, { size: child.props.size || 'md' })}</View>)}
      {arr.length > max && <View style={{ marginLeft: -10, width: 40, height: 40, borderRadius: 20, backgroundColor: t.colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 14 }}>+{arr.length - max}</Text></View>}
    </View>
  )
}
export default Avatar