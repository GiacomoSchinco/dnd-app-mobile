import React, { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { useTokens } from '../prism-provider.js'
import Modal from '../modal/index.js'
function Select(props) {
  const { variant = 'default', label, placeholder, value, options, onChange, style, theme } = props
  const contextTokens = useTokens()
  const t = theme || contextTokens
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)
  const choose = (opt) => { onChange && onChange(opt.value); setOpen(false) }
  return (
    <View style={[{ gap: t.spacing[1] }, style]}>
      {label && <Text style={{ fontSize: t.typography.sm, fontWeight: t.typography.medium, color: t.colors.foregroundSecondary }}>{label}</Text>}
      <Pressable onPress={() => setOpen(true)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: t.colors.input, borderWidth: 1, borderColor: t.colors.inputBorder, borderRadius: t.radius.md, paddingHorizontal: t.spacing[3], paddingVertical: t.spacing[2] }}>
        <Text style={{ color: selected ? t.colors.foreground : t.colors.placeholder }}>{selected ? selected.label : placeholder}</Text>
        <Text style={{ color: t.colors.foregroundTertiary }}>v</Text>
      </Pressable>
      <Modal.Sheet visible={open} onClose={() => setOpen(false)} title={label}>
        <ScrollView>
          {options.map((opt, i) => <Pressable key={i} onPress={() => choose(opt)} style={{ paddingVertical: t.spacing[3], borderBottomWidth: 1, borderBottomColor: t.colors.border }}><Text style={{ color: opt.value === value ? t.colors.accent : t.colors.foreground }}>{opt.label}</Text></Pressable>)}
        </ScrollView>
      </Modal.Sheet>
    </View>
  )
}
export default Select