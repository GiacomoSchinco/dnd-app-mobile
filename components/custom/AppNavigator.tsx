import React, { useState } from 'react';
import { View, Platform, Pressable, ScrollView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import del tuo Tema Custom
import { useTokens } from '../ui/prism-provider';

// Schermate
import HomeScreen from '../../screens/HomeScreen';
import CharactersScreen from '../../screens/CharactersScreen';
import SpellsScreen from '../../screens/SpellsScreen';
import MoreScreen from '../../screens/MoreScreen';

// Componenti
import DndIcon from './DndIcon';
import ScreenHeader from './ScreenHeader';
import DiceRoller from './DiceRoller';
import { spacing } from '../../utils/styles';

const Tab = createBottomTabNavigator();

// ── 1. DEFINIZIONE DELL'ARRAY DELLE VOCI (Modificabile come vuoi) ──
const NAVIGATION_TABS = [
  {
    name: 'Home',
    component: HomeScreen,
    iconActive: 'home' as const,
    iconInactive: 'home-outline' as const,
  },
  {
    name: 'Personaggi',
    component: CharactersScreen,
    iconActive: 'people' as const,
    iconInactive: 'people-outline' as const,
  },
  {
    name: 'Magie',
    component: SpellsScreen,
    iconActive: 'flash' as const,
    iconInactive: 'flash-outline' as const,
  },
  {
    name: 'Altro',
    component: MoreScreen,
    iconActive: 'ellipsis-horizontal' as const,
    iconInactive: 'ellipsis-horizontal-outline' as const,
  },
];

// ── Pulsante centrale rotondo con D20 ──
function CentralDiceButton({ onPress, accessibilityState, isExpanded }: any) {
  const t = useTokens();
  const isActive = accessibilityState?.selected || isExpanded;

  return (
    <Pressable
      onPress={onPress}
      style={{
        top: -40,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: isActive ? t.colors.accent : t.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: t.colors.accent,
        zIndex: 100,
        ...Platform.select({
          ios: {
            shadowColor: t.colors.accent,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
          },
          android: {
            elevation: 24,
          },
        }),
      }}
    >
      <DndIcon name="d20" size={34} color={isActive ? '#FFFFFF' : t.colors.accent} />
    </Pressable>
  );
}

function EmptyScreen() {
  return null;
}

export default function AppNavigator() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const isDark = t.colors.background.startsWith('#0');
  const [isDiceOpen, setIsDiceOpen] = useState(false);

  const bottomMargin = insets.bottom > 0 ? insets.bottom : 16;
  const navbarBg = isDark ? 'rgba(28, 28, 36, 0.98)' : 'rgba(255, 255, 255, 0.98)';
  const navbarBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const pillRadius = t.radius.xl || 24;

  // Dividiamo l'array a metà per inserire il d20 al centro
  const firstHalfTabs = NAVIGATION_TABS.slice(0, 2);
  const secondHalfTabs = NAVIGATION_TABS.slice(2);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Tab.Navigator
        screenOptions={({ route }) => ({
          // Icone dinamiche basate sulla configurazione dell'array
          tabBarIcon: ({ focused, color }) => {
            if (isDiceOpen && route.name !== 'Dadi') {
              return <View style={{ width: 22, height: 22 }} />;
            }

            // Cerchiamo la tab corrispondente nell'array
            const currentTab = NAVIGATION_TABS.find((tab) => tab.name === route.name);
            const iconName = currentTab
              ? (focused ? currentTab.iconActive : currentTab.iconInactive)
              : 'help-outline';

            return <Ionicons name={iconName} size={22} color={color} />;
          },
          tabBarActiveTintColor: t.colors.accent,
          tabBarInactiveTintColor: t.colors.foregroundTertiary,

          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.2,
            marginBottom: 4,
            ...(isDiceOpen && route.name !== 'Dadi'
              ? { opacity: 0, height: 0, overflow: 'hidden', marginBottom: 0 }
              : {}),
          },

          headerShown: false,

          tabBarStyle: {
            display: isDiceOpen ? 'none' : 'flex',
            position: 'absolute',
            bottom: bottomMargin,
            left: 16,
            right: 16,
            height: 64,
            borderRadius: pillRadius,
            backgroundColor: navbarBg,
            borderWidth: 1,
            borderColor: navbarBorder,
            paddingTop: 8,
            paddingBottom: 4,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
              },
              android: {
                elevation: 6,
              },
            }),
          },
        })}
      >
        {/* Prime due voci dell'array */}
        {firstHalfTabs.map((tab) => (
          <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
        ))}

        {/* Tasto centrale fisso (Spacer) */}
        <Tab.Screen
          name="Dadi"
          component={EmptyScreen}
          options={{
            tabBarButton: () => <View style={{ flex: 1 }} />,
            tabBarLabel: () => null,
            tabBarIcon: () => null,
          }}
        />

        {/* Ultime due voci dell'array */}
        {secondHalfTabs.map((tab) => (
          <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
        ))}
      </Tab.Navigator>

      {/* Pannello dadi espanso */}
      {isDiceOpen && (
        <View
          style={{
            position: 'absolute',
            bottom: bottomMargin + 64,
            left: 16,
            right: 16,
            backgroundColor: navbarBg,
            borderTopLeftRadius: pillRadius,
            borderTopRightRadius: pillRadius,
            borderWidth: 1,
            borderColor: navbarBorder,
            borderTopWidth: 3,
            borderTopColor: t.colors.accent,
            borderBottomWidth: 2,
            borderBottomColor: t.colors.accent,
            borderBottomLeftRadius: pillRadius,
            borderBottomRightRadius: pillRadius,
            paddingHorizontal: spacing[6],
            paddingTop: spacing[3],
            paddingBottom: spacing[6],
            maxHeight: '65%',
            zIndex: 50,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
              },
              android: {
                elevation: 8,
              },
            }),
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: -spacing[6] }}>
              <ScreenHeader title="Lancia i tuoi dadi" center={true} />
            </View>
            <DiceRoller initialType="d20" initialQuantity={1} />
          </ScrollView>
        </View>
      )}

      {/* D20 flottante reale */}
      <View
        style={{
          position: 'absolute',
          bottom: bottomMargin - 24,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 100,
          pointerEvents: 'box-none',
        }}
      >
        <CentralDiceButton
          onPress={() => setIsDiceOpen((prev) => !prev)}
          isExpanded={isDiceOpen}
        />
      </View>
    </View>
  );
}