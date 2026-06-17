import React, { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useTokens } from '../prism-provider.js'
function Tabs(props) {
  const { variant = 'underline', tabs, onChange, style, theme, position = 'top' } = props
  const contextTokens = useTokens()
  const t = theme || contextTokens
  const [active, setActive] = useState(0)
  const handle = (i) => { setActive(i); onChange && onChange(tabs[i], i) }

  const insets = position === 'bottom' ? { paddingBottom: 16 } : {}
  const bar = (
    <View style={[{ flexDirection: 'row', padding: 2, backgroundColor: t.colors.backgroundSecondary, borderRadius: t.radius.md }, insets]}>
      {tabs.map((tab, i) => (
        <Pressable key={i} onPress={() => handle(i)} style={{ flex: 1, paddingVertical: 8, alignItems: 'center' }}>
          <Text style={{ color: active === i ? t.colors.accent : t.colors.foregroundSecondary, fontWeight: active === i ? t.typography.medium : t.typography.regular, fontSize: 12 }}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  )

  return (
    <View style={[{ flex: 1 }, style]}>
      {position === 'bottom' && <View style={{ flex: 1 }}>{tabs[active] && tabs[active].content}</View>}
      {bar}
      {position !== 'bottom' && <View style={{ flex: 1, paddingTop: 16 }}>{tabs[active] && tabs[active].content}</View>}
    </View>
  )
}
export default Tabs