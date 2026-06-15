import React from 'react'
import { View, Text, Pressable, Modal as RNModal, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useTokens } from '../prism-provider.js'
function Modal(props) {
  const { visible, onClose, title, children, style, theme } = props
  const contextTokens = useTokens()
  const t = theme || contextTokens
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.modal, { backgroundColor: t.colors.card, borderRadius: t.radius.lg }, style]}>
          {title && <View style={styles.header}><Text style={{ color: t.colors.foreground, fontSize: 18, fontWeight: '600' }}>{title}</Text><Pressable onPress={onClose}><Text style={{ color: t.colors.foregroundTertiary }}>x</Text></Pressable></View>}
          <View>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  )
}
function Sheet(props) {
  const { visible, onClose, title, children, style, theme } = props
  const contextTokens = useTokens()
  const t = theme || contextTokens
  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[sheetStyles.sheet, { backgroundColor: t.colors.card, borderTopLeftRadius: t.radius.xl, borderTopRightRadius: t.radius.xl }, style]}>
          <View style={sheetStyles.handle} />
          {title && <View style={sheetStyles.header}><Text style={{ color: t.colors.foreground, fontSize: 18, fontWeight: '600' }}>{title}</Text><Pressable onPress={onClose}><Text>Done</Text></Pressable></View>}
          <View>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  )
}
const styles = StyleSheet.create({ overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' }, backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#00000066' }, modal: { width: '80%', padding: 20 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } })
const sheetStyles = StyleSheet.create({ sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, maxHeight: '70%' }, handle: { width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }, header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 } })
Modal.Sheet = Sheet
export default Modal