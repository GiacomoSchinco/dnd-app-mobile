import React from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTokens } from '../ui/prism-provider';
import { ROUTES } from '../../lib/routes';
import { NAVIGATION_TABS, type NavigationTab } from './navigation/tab-config';
import { useActiveCharacter } from '../../store/useActiveCharacter';
import { useDiceStore } from '../../store/useDiceStore';
import { hexToRgba } from '../../utils/color';

/** Determina se il tema è scuro in base alla luminanza del background */
function isThemeDark(bgColor: string): boolean {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Luminanza percepita (formula W3C)
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 128;
}

const Tab = createBottomTabNavigator();

function EmptyScreen() {
  return null;
}

export default function AppNavigator() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { activeChar } = useActiveCharacter();
  const isDark = isThemeDark(t.colors.background);
  const { anim } = useDiceStore();

  // Tab con bottone visibile nella tab bar in base al PG attivo
  const hasTabButton = (tab: NavigationTab) => {
    if (tab.hideTabButton) return false;
    if (!tab.show || tab.show === 'always') return true;
    if (tab.show === 'noCharacter' && !activeChar) return true;
    if (tab.show === 'withCharacter' && activeChar) return true;
    return false;
  };

  const visibleTabs = NAVIGATION_TABS.filter(hasTabButton);
  const hiddenTabs = NAVIGATION_TABS.filter((t) => !hasTabButton(t));

  // La tab bar scivola in basso quando si apre il pannello dado (animazione condivisa via store)
  const tabBarTranslateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  const bottomMargin = insets.bottom > 0 ? insets.bottom : 16;
  const navbarBg = hexToRgba(t.colors.card, 0.97);
  const navbarBorder = hexToRgba(t.colors.cardBorder, 0.8);
  const pillRadius = t.radius.xl || 24;

  const splitIndex = Math.ceil(visibleTabs.length / 2);
  const firstHalfTabs = visibleTabs.slice(0, splitIndex);
  const secondHalfTabs = visibleTabs.slice(splitIndex);

  const renderTab = (tab: NavigationTab) => (
    <Tab.Screen
      key={tab.routeName}
      name={tab.routeName}
      component={tab.component}
      options={{
        tabBarLabel: tab.label,
      }}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Tab.Navigator
        initialRouteName={ROUTES.HOME}
        backBehavior="history"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            const currentTab = NAVIGATION_TABS.find((tab) => tab.routeName === route.name);
            const iconName = (currentTab
              ? (focused ? currentTab.iconActive : currentTab.iconInactive)
              : 'help-outline') as any;
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
        {/* Tab nascoste (sempre registrate, senza bottone) */}
        {hiddenTabs.map((tab) => (
          <Tab.Screen
            key={tab.routeName}
            name={tab.routeName}
            component={tab.component}
            options={{
              tabBarButton: () => null,
              tabBarLabel: () => null,
              tabBarIcon: () => null,
              tabBarStyle: { display: 'none' },
            }}
          />
        ))}

        {firstHalfTabs.map(renderTab)}

        <Tab.Screen
          name={ROUTES.DADI}
          component={EmptyScreen}
          options={{
            tabBarButton: () => <View style={{ flex: 1 }} />,
            tabBarLabel: () => null,
            tabBarIcon: () => null,
          }}
        />

        {secondHalfTabs.map(renderTab)}
      </Tab.Navigator>
    </View>
  );
}