import { View, Text, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTokens } from '../ui/prism-provider';

/** Route dello stack RADICE aperte dai pulsanti rapidi della Home */
export type QuickActionRoute = 'Settings' | 'Compendium';

type Props = {
  onPress: (screen: QuickActionRoute) => void;
};

const ACTIONS = [
  {
    key: 'impostazioni',
    label: 'Impostazioni',
    icon: 'settings' as const,
    screen: 'Settings' as QuickActionRoute,
  },
  {
    key: 'compendio',
    label: 'Compendio',
    icon: 'book' as const,
    screen: 'Compendium' as QuickActionRoute,
  },
];

/**
 * Pulsanti rapidi della Home (Impostazioni e Compendio) resi INLINE: la barra
 * azioni della Home li posiziona in fondo (Thumb Zone) sopra la floating tab
 * bar. Stile circolare con bordo accent, coerente col pulsante centrale del dado.
 */
export default function HomeQuickActions({ onPress }: Props) {
  const t = useTokens();

  return (
    <View style={{ gap: t.spacing[3], alignItems: 'flex-end' }}>
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
            accessibilityRole="button"
            accessibilityLabel={action.label}
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
