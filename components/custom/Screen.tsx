import React from 'react';
import { View, ScrollView, ViewStyle, StyleProp } from 'react-native';
import { useScreenStyles } from '../../utils/styles';

type ScreenProps = {
  /** Se true (default) usa ScrollView, altrimenti View */
  scrollable?: boolean;
  /** Stile aggiuntivo per il container principale */
  style?: StyleProp<ViewStyle>;
  /** Stile aggiuntivo per il contentContainer (solo ScrollView) */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Centra i contenuti orizzontalmente? Default: true */
  center?: boolean;
  children: React.ReactNode;
};

/**
 * Wrapper schermata standard che applica automaticamente:
 * - background del tema
 * - padding sicuro per notch / floating tab bar
 * - ScrollView o View a seconda della prop `scrollable`
 */
export default function Screen({
  scrollable = true,
  style,
  contentContainerStyle,
  center = true,
  children,
}: ScreenProps) {
  const s = useScreenStyles();

  const containerStyle: ViewStyle = {
    ...(center ? { alignItems: 'center' as const } : {}),
  };

  if (scrollable) {
    return (
      <ScrollView
        style={[s.screen, style]}
        contentContainerStyle={[s.scrollContent, containerStyle, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[s.screen, s.safePadding, containerStyle, style]}>
      {children}
    </View>
  );
}
