import React from 'react'
import { View, Text, TextInput } from 'react-native'
import { useTokens } from '../prism-provider.js'
const variants = {
  default: (t) => ({ container: { backgroundColor: t.colors.input, borderColor: t.colors.inputBorder }, label: { color: t.colors.foregroundSecondary }, text: { color: t.colors.foreground } }),
  error: (t) => ({ container: { backgroundColor: t.colors.input, borderColor: t.colors.danger }, label: { color: t.colors.danger }, text: { color: t.colors.foreground } }),
  success: (t) => ({ container: { backgroundColor: t.colors.input, borderColor: t.colors.success }, label: { color: t.colors.success }, text: { color: t.colors.foreground } }),
}
export function Input(props) {
  const { variant = 'default', label, helperText, errorMessage, leftIcon, rightIcon, style, theme, ...rest } = props
  const contextTokens = useTokens()
  const t = theme || contextTokens
  const variantStyle = (variants[variant] || variants.default)(t)
  return (
    <View style={[{ gap: t.spacing[1] }, style]}>
      {label && <Text style={[variantStyle.label, { fontSize: t.typography.sm, fontWeight: t.typography.medium }]}>{label}</Text>}
      <View style={[{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: variantStyle.container.borderColor, borderRadius: t.radius.md, paddingHorizontal: t.spacing[3] }, variantStyle.container]}>
        {leftIcon && <View style={{ marginRight: t.spacing[2] }}>{leftIcon}</View>}
        <TextInput {...rest} placeholderTextColor={t.colors.placeholder} style={[{ flex: 1, fontSize: t.typography.base, color: variantStyle.text.color }, rest.style]} />
        {rightIcon && <View style={{ marginLeft: t.spacing[2] }}>{rightIcon}</View>}
      </View>
      {errorMessage && <Text style={{ fontSize: t.typography.sm, color: t.colors.danger }}>{errorMessage}</Text>}
      {helperText && !errorMessage && <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary }}>{helperText}</Text>}
    </View>
  )
}
export default Input