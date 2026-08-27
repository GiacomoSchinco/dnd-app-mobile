import React from 'react';
import { View, Pressable, ScrollView, Dimensions, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Quanto spazio riservare in basso per la navbar (default: 100) */
  bottomPadding?: number;
  /** Altezza massima della card in percentuale dello schermo (default: 0.8) */
  maxHeightPercent?: number;
  /** Mostra un pulsante ✕ per chiudere in alto a destra della card (sempre visibile anche a contenuto scrollato) */
  showCloseButton?: boolean;
};

/**
 * Modale che NON copre la tab bar / navbar.
 * Usa un View con position absolute invece del Modal nativo di React Native,
 * così resta dentro lo screen e sotto la tab bar flottante.
 */
export default function BottomModal({
  visible,
  onClose,
  children,
  bottomPadding = 100,
  maxHeightPercent = 0.8,
  showCloseButton = false,
}: Props) {
  const t = useTokens();
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View
      style={{
        // Su web 'fixed' = relativo alla VIEWPORT visibile (lo schermo che si sta
        // usando), non al contenuto scrollabile dove è renderizzato il modale.
        // Su nativo 'absolute' resta relativo al padre (schermo intero).
        position: (Platform.OS === 'web' ? 'fixed' : 'absolute') as 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        paddingHorizontal: t.spacing[4],
        paddingTop: Math.max(t.spacing[4], insets.top),
        paddingBottom: Math.max(bottomPadding, insets.bottom + 80),
        zIndex: 100,
      }}
    >
      {/* Backdrop — chiude al tocco */}
      <Pressable
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        onPress={onClose}
      />

      {/* Card contenuto */}
      <View
        style={{
          backgroundColor: t.colors.card,
          borderRadius: t.radius.xl,
          maxHeight: Dimensions.get('window').height * maxHeightPercent,
        }}
      >
        {showCloseButton && (
          <Pressable
            onPress={onClose}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Chiudi"
            style={{
              position: 'absolute',
              top: t.spacing[2],
              right: t.spacing[2],
              zIndex: 10,
              width: 32,
              height: 32,
              borderRadius: t.radius.full,
              backgroundColor: t.colors.backgroundTertiary,
              ...s.center,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: t.colors.foregroundTertiary }}>✕</Text>
          </Pressable>
        )}
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ padding: t.spacing[6] }}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
}
