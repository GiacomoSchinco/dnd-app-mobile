import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTokens } from '../components/ui/prism-provider';
import { useScreenStyles, spacing, fontSizes, radius } from '../utils/styles';
import Screen from '../components/custom/Screen';
import ScreenHeader from '../components/custom/ScreenHeader';
import DndIcon from '../components/custom/DndIcon';
import DicesScreen from './DicesScreen';
import SettingsScreen from './SettingsScreen';

type SectionKey = 'dadi' | 'impostazioni';

interface AltroItem {
  key: SectionKey;
  label: string;
  icon: string;
  description: string;
}

const ITEMS: AltroItem[] = [
  { key: 'impostazioni', label: '⚙️ Impostazioni', icon: 'divination', description: 'Temi, info app' },
];

export default function MoreScreen() {
  const t = useTokens();
  const s = useScreenStyles();
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);

  if (activeSection === 'dadi') {
    return (
      <DicesScreen
        onBack={() => setActiveSection(null)}
        backLabel="Torna al menu"
      />
    );
  }

  if (activeSection === 'impostazioni') {
    return (
      <SettingsScreen onBack={() => setActiveSection(null)} />
    );
  }

  return (
    <Screen>
      <ScreenHeader title="☰ Altro" />

      <Text style={{ fontSize: fontSizes.sm, color: t.colors.foregroundSecondary, marginBottom: spacing[2], alignSelf: 'flex-start' }}>
        Tutte le altre funzioni
      </Text>

      <View style={{ width: '100%', gap: spacing[3] }}>
        {ITEMS.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => setActiveSection(item.key)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[4],
              padding: spacing[4],
              backgroundColor: pressed ? t.colors.backgroundSecondary : 'transparent',
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: t.colors.backgroundSecondary,
            })}
          >
            <DndIcon name={item.icon as any} size={32} color={t.colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '600', color: t.colors.foreground }}>
                {item.label}
              </Text>
              <Text style={{ fontSize: fontSizes.sm, color: t.colors.foregroundSecondary, marginTop: 2 }}>
                {item.description}
              </Text>
            </View>
            <Text style={{ color: t.colors.foregroundSecondary, fontSize: 18 }}>›</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
