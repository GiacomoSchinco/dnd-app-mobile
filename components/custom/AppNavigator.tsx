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
import { spacing, radius } from '../../utils/styles';

const Tab = createBottomTabNavigator();

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

// ── Schermata vuota (il tab Dadi non mostra mai una pagina) ──
function EmptyScreen() {
  return null;
}

export default function AppNavigator() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const isDark = t.colors.background.startsWith('#0');

  // Stato: navbar espansa o chiusa
  const [isDiceOpen, setIsDiceOpen] = useState(false);

  // Calcolo millimetrico del margine inferiore
  const bottomMargin = insets.bottom > 0 ? insets.bottom : 16;

  // Stile condiviso tra tab bar e pannello
  const navbarBg = isDark ? 'rgba(28, 28, 36, 0.98)' : 'rgba(255, 255, 255, 0.98)';
  const navbarBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const pillRadius = t.radius.xl || 24;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Tab.Navigator
        screenOptions={({ route }) => ({
          // 1. Icone — nascoste se la navbar è espansa
          tabBarIcon: ({ focused, color }) => {
            if (isDiceOpen && route.name !== 'Dadi') {
              return <View style={{ width: 22, height: 22 }} />;
            }

            let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Personaggi') {
              iconName = focused ? 'shield' : 'shield-outline';
            } else if (route.name === 'Magie') {
              iconName = focused ? 'flash' : 'flash-outline';
            } else if (route.name === 'Altro') {
              iconName = focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
            }

            return <Ionicons name={iconName} size={22} color={color} />;
          },
          tabBarActiveTintColor: t.colors.accent,
          tabBarInactiveTintColor: t.colors.foregroundTertiary,

          // 2. Label nascoste se espanso
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

          // 3. Tab bar: scompare quando il pannello dadi è aperto
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
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Personaggi" component={CharactersScreen} />

        {/* Tasto centrale — spacer invisibile, il vero D20 è fuori */}
        <Tab.Screen
          name="Dadi"
          component={EmptyScreen}
          options={{
            tabBarButton: () => <View style={{ flex: 1 }} />,
            tabBarLabel: () => null,
            tabBarIcon: () => null,
          }}
        />

        <Tab.Screen name="Magie" component={SpellsScreen} />
        <Tab.Screen name="Altro" component={MoreScreen} />
      </Tab.Navigator>

      {/* ── Pannello dadi: si allarga dalla navbar ── */}
      {isDiceOpen && (
        <View
          style={{
            position: 'absolute',
            bottom: bottomMargin + 64, // attaccato alla tab bar
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

      {/* ── D20 flottante — sempre sopra pannello e navbar ── */}
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