import React, { useState, useRef, useEffect } from 'react';
import { View, Platform, Pressable, ScrollView, Animated } from 'react-native';
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

const NAVIGATION_TABS = [
  { name: 'Home', component: HomeScreen, iconActive: 'home' as const, iconInactive: 'home-outline' as const },
  { name: 'Personaggi', component: CharactersScreen, iconActive: 'people' as const, iconInactive: 'people-outline' as const },
  { name: 'Magie', component: SpellsScreen, iconActive: 'flash' as const, iconInactive: 'flash-outline' as const },
  { name: 'Altro', component: MoreScreen, iconActive: 'ellipsis-horizontal' as const, iconInactive: 'ellipsis-horizontal-outline' as const },
];

function CentralDiceButton({ onPress, isExpanded }: any) {
  const t = useTokens();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Pressable
      onPress={onPress}
      style={{
        top: -40,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: isExpanded ? t.colors.accent : t.colors.background,
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
          android: { elevation: 24 },
        }),
      }}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <DndIcon name="d20" size={34} color={isExpanded ? '#FFFFFF' : t.colors.accent} />
      </Animated.View>
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

  // Controller unico per gestire la timeline dell'animazione (da 0 a 1)
  const animController = useRef(new Animated.Value(0)).current;

  const toggleDicePanel = () => {
    if (isDiceOpen) {
      Animated.timing(animController, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setIsDiceOpen(false));
    } else {
      setIsDiceOpen(true);
      Animated.timing(animController, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  // Interpolazione: sposta la navbar verso il basso di 120px per nasconderla
  const tabBarTranslateY = animController.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  // Interpolazione: il pannello sale dal basso verso l'alto di 40px
  const dicePanelTranslateY = animController.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  // Interpolazione: gestione dell'opacità del pannello
  const dicePanelOpacity = animController.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 1],
  });

  const bottomMargin = insets.bottom > 0 ? insets.bottom : 16;
  const navbarBg = isDark ? 'rgba(28, 28, 36, 0.98)' : 'rgba(255, 255, 255, 0.98)';
  const navbarBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const pillRadius = t.radius.xl || 24;

  const firstHalfTabs = NAVIGATION_TABS.slice(0, 2);
  const secondHalfTabs = NAVIGATION_TABS.slice(2);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
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
          },
          headerShown: false,
          tabBarStyle: {
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
            transform: [{ translateY: tabBarTranslateY }],
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
              },
              android: { elevation: 6 },
            }),
          },
        })}
      >
        {firstHalfTabs.map((tab) => (
          <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
        ))}

        <Tab.Screen
          name="Dadi"
          component={EmptyScreen}
          options={{
            tabBarButton: () => <View style={{ flex: 1 }} />,
            tabBarLabel: () => null,
            tabBarIcon: () => null,
          }}
        />

        {secondHalfTabs.map((tab) => (
          <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
        ))}
      </Tab.Navigator>

      {/* Pannello dadi animato posizionato più in alto */}
      {isDiceOpen && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: bottomMargin + 80, // <-- Spostato più in alto rispetto a prima
            left: 16,
            right: 16,
            backgroundColor: navbarBg,
            borderRadius: pillRadius,
            borderWidth: 1,
            borderColor: navbarBorder,
            borderTopWidth: 3,
            borderTopColor: t.colors.accent,
            borderBottomWidth: 3,
            borderBottomColor: t.colors.accent,
            paddingHorizontal: spacing[6],
            paddingTop: spacing[3],
            paddingBottom: spacing[6],
            maxHeight: '65%',
            zIndex: 50,
            opacity: dicePanelOpacity,
            transform: [{ translateY: dicePanelTranslateY }],
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
              },
              android: { elevation: 8 },
            }),
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: -spacing[6], marginTop: spacing[4] }}>
              <ScreenHeader title="Lancia i tuoi dadi" center={true} />
            </View>
            <DiceRoller initialType="d20" initialQuantity={1} />
          </ScrollView>
        </Animated.View>
      )}

      {/* Bottone d20 centrale fisso */}
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
          onPress={toggleDicePanel}
          isExpanded={isDiceOpen}
        />
      </View>
    </View>
  );
}