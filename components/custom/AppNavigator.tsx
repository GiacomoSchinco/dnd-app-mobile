import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
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

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const isDark = t.colors.background.startsWith('#0');

  // Calcolo millimetrico del margine inferiore per evitare l'effetto "blocco staccato"
  // Se c'è un notch (insets.bottom > 0), usiamo quello, altrimenti impostiamo un valore standard di 16px
  const bottomMargin = insets.bottom > 0 ? insets.bottom : 16;

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Tab.Navigator
        screenOptions={({ route }) => ({
          // 1. Configurazione icone dinamiche (Lineari se inattive, Piene se attive)
          tabBarIcon: ({ focused, color, size }) => {
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
          // 2. Colori dell'interfaccia presi dal tuo Tema
          tabBarActiveTintColor: t.colors.accent,
          tabBarInactiveTintColor: t.colors.foregroundTertiary,
          
          // 3. Stile del testo sotto le icone
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.2,
            marginBottom: 4,
          },
          
          // 4. Nascondiamo l'header nativo superiore per gestire il layout nelle singole pagine
          headerShown: false,

          // 5. Il look "Floating Pill" trasparente
          tabBarStyle: {
            position: 'absolute',
            bottom: bottomMargin,
            left: 16,
            right: 16,
            height: 64,
            borderRadius: t.radius.xl || 24,
            backgroundColor: isDark ? 'rgba(28, 28, 36, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
            paddingTop: 8,
            paddingBottom: 4,
            // Ombre premium per iOS e Android
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
        <Tab.Screen name="Magie" component={SpellsScreen} />
        <Tab.Screen name="Altro" component={MoreScreen} />
      </Tab.Navigator>
    </View>
  );
}