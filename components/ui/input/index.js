import React from 'react'
import { View, Text, TextInput } from 'react-native'
import { useTokens } from '../prism-provider.js'
const variants = {
  default: (t) => ({ container: { backgroundColor: t.colors.input, borderColor: t.colors.inputBorder }, label: { color: t.colors.foregroundSecondary }, text: { color: t.colors.foreground } }),
  error: (t) => ({ container: { backgroundColor: t.colors.input, borderColor: t.colors.danger }, label: { color: t.colors.danger }, text: { color: t.colors.foreground } }),
  success: (t) => ({ container: { backgroundColor: t.colors.input, borderColor: t.colors.success }, label: { color: t.colors.success }, text: { color: t.colors.foreground } }),
}
const sizes = {
  sm: (t) => ({ container: { paddingVertical: t.spacing[1.5] }, text: { fontSize: t.typography.sm } }),
  md: (t) => ({ container: { paddingVertical: t.spacing[2.5] }, text: { fontSize: t.typography.base } }),
  lg: (t) => ({ container: { paddingVertical: t.spacing[3.5] }, text: { fontSize: t.typography.md } }),
}
export function Input(props) {
  const { variant = 'default', size = 'md', label, helperText, errorMessage, leftIcon, rightIcon, style, theme, ...rest } = props
  const contextTokens = useTokens()
  const t = theme || contextTokens
  const variantStyle = (variants[variant] || variants.default)(t)
  const sizeStyle = (sizes[size] || sizes.md)(t)
  return (
    <View style={[{ gap: t.spacing[1] }, style]}>
      {label && <Text style={[variantStyle.label, { fontSize: t.typography.sm, fontWeight: t.typography.medium }]}>{label}</Text>}
      <View style={[{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: variantStyle.container.borderColor, borderRadius: t.radius.md, paddingHorizontal: t.spacing[3], ...sizeStyle.container }, variantStyle.container]}>
        {leftIcon && <View style={{ marginRight: t.spacing[2] }}>{leftIcon}</View>}
        <TextInput {...rest} placeholderTextColor={t.colors.placeholder} style={[{ flex: 1, color: variantStyle.text.color, ...sizeStyle.text }, rest.style]} />
        {rightIcon && <View style={{ marginLeft: t.spacing[2] }}>{rightIcon}</View>}
      </View>
      {errorMessage && <Text style={{ fontSize: t.typography.sm, color: t.colors.danger }}>{errorMessage}</Text>}
      {helperText && !errorMessage && <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary }}>{helperText}</Text>}
    </View>
  )
}
export default Input