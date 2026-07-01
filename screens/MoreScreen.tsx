import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useTokens } from '../components/ui/prism-provider';
import ScreenHeader from '../components/custom/ScreenHeader';
import DndIcon from '../components/custom/DndIcon';
import { spacing, fontSizes, radius } from '../utils/styles';
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
  { key: 'dadi', label: '🎲 Lancia dadi', icon: 'd20', description: 'Tira d4, d6, d8, d10, d12, d20' },
  { key: 'impostazioni', label: '⚙️ Impostazioni', icon: 'divination', description: 'Temi, info app, esporta scheda' },
];

export default function MoreScreen() {
  const t = useTokens();
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);

  if (activeSection === 'dadi') {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.background }}>
        <View style={{ padding: spacing[6], paddingBottom: 0 }}>
          <Pressable onPress={() => setActiveSection(null)} style={{ marginBottom: spacing[4] }}>
            <Text style={{ color: t.colors.accent, fontSize: fontSizes.base }}>← Torna al menu</Text>
          </Pressable>
        </View>
        <DicesScreen />
      </View>
    );
  }

  if (activeSection === 'impostazioni') {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.background }}>
        <View style={{ padding: spacing[6], paddingBottom: 0 }}>
          <Pressable onPress={() => setActiveSection(null)} style={{ marginBottom: spacing[4] }}>
            <Text style={{ color: t.colors.accent, fontSize: fontSizes.base }}>← Torna al menu</Text>
          </Pressable>
        </View>
        <SettingsScreen />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.colors.background }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: spacing[6], gap: spacing[4] }}>
        <ScreenHeader title="☰ Altro" />

        <Text style={{ fontSize: fontSizes.sm, color: t.colors.foregroundSecondary, marginBottom: spacing[2] }}>
          Tutte le altre funzioni
        </Text>

        <View style={{ gap: spacing[3] }}>
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

        {/* Placeholder per future sezioni */}
        <View style={{
          marginTop: spacing[8],
          padding: spacing[6],
          borderRadius: radius.lg,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: t.colors.backgroundSecondary,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: fontSizes['2xl'], marginBottom: spacing[2] }}>🔮</Text>
          <Text style={{ fontSize: fontSizes.sm, color: t.colors.foregroundSecondary, textAlign: 'center' }}>
            Altre funzioni in arrivo...
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
