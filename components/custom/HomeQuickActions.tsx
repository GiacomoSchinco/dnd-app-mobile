import { View, Text, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../ui/prism-provider';
import { FLOATING_TAB_HEIGHT, FLOATING_TAB_GAP } from '../../utils/styles';

/** Route dello stack RADICE aperte dai pulsanti rapidi della Home */
export type QuickActionRoute = 'Impostazioni' | 'Compendio';

type Props = {
  onPress: (screen: QuickActionRoute) => void;
};

const ACTIONS = [
  {
    key: 'impostazioni',
    label: 'Impostazioni',
    icon: 'settings' as const,
    screen: 'Impostazioni' as QuickActionRoute,
  },
  {
    key: 'compendio',
    label: 'Compendio',
    icon: 'book' as const,
    screen: 'Compendio' as QuickActionRoute,
  },
];

/**
 * Pulsanti rapidi flottanti della Home (in basso a destra, sopra la floating tab bar):
 * accesso diretto a Impostazioni e Compendio — sezioni consultive pushate sullo
 * stack radice (schermo intero, back alla Home), fuori dalla tab Altro.
 * Stile circolare con bordo accent, coerente col pulsante centrale del dado.
 */
export default function HomeQuickActions({ onPress }: Props) {
  const t = useTokens();
  const insets = useSafeAreaInsets();

  const bottomMargin = insets.bottom > 0 ? insets.bottom : 16;
  const bottom = bottomMargin + FLOATING_TAB_HEIGHT + FLOATING_TAB_GAP;

  return (
    <View
      style={{
        position: 'absolute',
        right: t.spacing[4],
        bottom,
        gap: t.spacing[3],
        alignItems: 'flex-end',
        zIndex: 50,
      }}
    >
      {ACTIONS.map((action) => (
        <View key={action.key} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: t.colors.card,
              borderColor: t.colors.cardBorder,
              borderWidth: 1,
              borderRadius: t.radius.full,
              paddingHorizontal: t.spacing[3],
              paddingVertical: t.spacing[1],
              marginRight: t.spacing[2],
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12,
                  shadowRadius: 4,
                },
                android: { elevation: 3 },
              }),
            }}
          >
            <Text
              style={{
                color: t.colors.foregroundSecondary,
                fontSize: t.typography.xs,
                fontWeight: t.typography.semibold,
              }}
            >
              {action.label}
            </Text>
          </View>
          <Pressable
            onPress={() => onPress(action.screen)}
            style={({ pressed }) => ({
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: pressed ? t.colors.accent : t.colors.background,
              borderWidth: 2,
              borderColor: t.colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            {({ pressed }) => (
              <Ionicons name={action.icon} size={24} color={pressed ? '#FFFFFF' : t.colors.accent} />
            )}
          </Pressable>
        </View>
      ))}
    </View>
  );
}
